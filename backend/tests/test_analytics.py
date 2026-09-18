import pytest
from app.models import ShiftPayload, MachineAlarm, MaintenanceTask, SensorReading, OperatorNote
from app.analytics import compute_shift_kpis, detect_sensor_anomalies, process_full_shift

def test_kpi_calculations():
    payload = ShiftPayload(
        shift_id="TEST-01",
        line_id="Line 1",
        date="2026-09-18",
        shift_type="Shift A",
        target_units=500,
        actual_units=400,
        planned_downtime_minutes=10.0,
        unplanned_downtime_minutes=30.0,
        scrap_count=20,
        total_inspected=420,
        operating_time_minutes=480.0
    )
    kpis = compute_shift_kpis(payload)
    
    assert kpis.target_units == 500
    assert kpis.actual_units == 400
    assert kpis.variance_units == -100
    assert kpis.variance_percent == -20.0
    assert kpis.total_downtime_minutes == 40.0
    assert kpis.scrap_rate_percent == 4.76
    assert kpis.oee_percent > 0.0

def test_anomaly_detection():
    readings = [
        {"metric": "gearbox_temp_c", "value": 98.4, "timestamp": "09:45"},
        {"metric": "gearbox_temp_c", "value": 70.0, "timestamp": "08:00"}
    ]
    anomalies = detect_sensor_anomalies(readings)
    assert len(anomalies) == 1
    anom = anomalies[0]
    assert anom.metric == "gearbox_temp_c"
    assert anom.is_anomaly is True
    assert anom.z_score >= 3.0

def test_full_shift_processing():
    payload = ShiftPayload(
        shift_id="TEST-02",
        line_id="Line 4",
        date="2026-09-18",
        shift_type="Shift A",
        target_units=500,
        actual_units=415,
        planned_downtime_minutes=15.0,
        unplanned_downtime_minutes=85.0,
        scrap_count=22,
        total_inspected=437,
        alarms=[
            MachineAlarm(
                alarm_id="ALM-902",
                severity="CRITICAL",
                description="Gearbox Overheat",
                timestamp="09:45",
                is_safety_critical=True
            )
        ]
    )
    res = process_full_shift(payload)
    assert res.shift_id == "TEST-02"
    assert len(res.safety_alarms) == 1
    assert res.safety_alarms[0].alarm_id == "ALM-902"
    assert len(res.evidence_table) >= 1
