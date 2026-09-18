from typing import List, Dict
from app.models import ShiftPayload, MachineAlarm, MaintenanceTask, SensorReading, OperatorNote

SCENARIOS: Dict[str, ShiftPayload] = {
    "shift_gearbox_overheat": ShiftPayload(
        shift_id="SH-20260918-A",
        line_id="Line 4 - Stator Assembly",
        date="2026-09-18",
        shift_type="Shift A (Morning 06:00 - 14:00)",
        target_units=500,
        actual_units=415,
        planned_downtime_minutes=15.0,
        unplanned_downtime_minutes=85.0,
        scrap_count=22,
        total_inspected=437,
        operating_time_minutes=480.0,
        sensor_readings=[
            SensorReading(timestamp="06:30", metric="gearbox_temp_c", value=68.5, unit="°C"),
            SensorReading(timestamp="08:15", metric="gearbox_temp_c", value=82.0, unit="°C"),
            SensorReading(timestamp="09:45", metric="gearbox_temp_c", value=98.4, unit="°C"),
            SensorReading(timestamp="11:20", metric="hydraulic_pressure_bar", value=142.5, unit="bar"),
            SensorReading(timestamp="12:10", metric="vibration_mm_s", value=4.8, unit="mm/s"),
        ],
        alarms=[
            MachineAlarm(
                alarm_id="ALM-902",
                severity="CRITICAL",
                description="Gearbox Overheat High Limit Exceeded (98.4°C)",
                timestamp="09:45:12",
                is_safety_critical=True,
                resolved=False
            ),
            MachineAlarm(
                alarm_id="ALM-415",
                severity="HIGH",
                description="Hydraulic Pressure Line Spike (142.5 bar)",
                timestamp="11:20:05",
                is_safety_critical=False,
                resolved=True
            )
        ],
        maintenance_tasks=[
            MaintenanceTask(
                task_id="MNT-108",
                component="Gearbox Lubrication Pump #2",
                priority="MANDATORY",
                description="Inspect lube oil flow rate and replace thermal sensor coupling",
                is_mandatory=True,
                status="UNRESOLVED"
            ),
            MaintenanceTask(
                task_id="MNT-109",
                component="Conveyor Belt Alignment",
                priority="MEDIUM",
                description="Check roller tensioning bracket",
                is_mandatory=False,
                status="IN_PROGRESS"
            )
        ],
        operator_notes=[
            OperatorNote(
                note_id="N-001",
                timestamp="08:20",
                operator="J. Vance (Op-L4)",
                text="Noticed grinding whine coming from main gearbox drive at 08:15. Temp rising steadily.",
                is_unresolved=True,
                category="Maintenance"
            ),
            OperatorNote(
                note_id="N-002",
                timestamp="10:00",
                operator="M. Chen (Lead)",
                text="Line tripped automatically due to ALM-902. Cooled down for 45 mins. Lubricant smelled burnt.",
                is_unresolved=True,
                category="Downtime"
            ),
            OperatorNote(
                note_id="N-003",
                timestamp="13:10",
                operator="J. Vance (Op-L4)",
                text="Part dimensions drift on Station 3. Re-calibrated zero reference.",
                is_unresolved=False,
                category="Quality"
            )
        ]
    ),
    "shift_sensor_drift": ShiftPayload(
        shift_id="SH-20260918-B",
        line_id="Line 2 - Packaging & Bottling",
        date="2026-09-18",
        shift_type="Shift B (Afternoon 14:00 - 22:00)",
        target_units=1200,
        actual_units=1140,
        planned_downtime_minutes=20.0,
        unplanned_downtime_minutes=35.0,
        scrap_count=48,
        total_inspected=1188,
        operating_time_minutes=480.0,
        sensor_readings=[
            SensorReading(timestamp="15:00", metric="capping_torque_nm", value=3.2, unit="Nm"),
            SensorReading(timestamp="17:30", metric="capping_torque_nm", value=1.8, unit="Nm"),
            SensorReading(timestamp="20:00", metric="capping_torque_nm", value=1.1, unit="Nm"),
            SensorReading(timestamp="21:15", metric="vibration_mm_s", value=3.9, unit="mm/s")
        ],
        alarms=[
            MachineAlarm(
                alarm_id="ALM-308",
                severity="HIGH",
                description="Low Capping Torque Threshold Warning (< 1.5 Nm)",
                timestamp="20:05:00",
                is_safety_critical=False,
                resolved=False
            )
        ],
        maintenance_tasks=[
            MaintenanceTask(
                task_id="MNT-204",
                component="Capper Head Load Cell",
                priority="MANDATORY",
                description="Calibrate torque load cell sensor before next batch run",
                is_mandatory=True,
                status="UNRESOLVED"
            )
        ],
        operator_notes=[
            OperatorNote(
                note_id="N-101",
                timestamp="17:45",
                operator="A. Patel",
                text="Caps feeling loose during manual sample checks. Sensor reading torque lower than manual torque wrench.",
                is_unresolved=True,
                category="Quality"
            )
        ]
    ),
    "shift_normal_operation": ShiftPayload(
        shift_id="SH-20260917-C",
        line_id="Line 1 - Machining Cell",
        date="2026-09-17",
        shift_type="Shift C (Night 22:00 - 06:00)",
        target_units=600,
        actual_units=608,
        planned_downtime_minutes=15.0,
        unplanned_downtime_minutes=5.0,
        scrap_count=4,
        total_inspected=612,
        operating_time_minutes=480.0,
        sensor_readings=[
            SensorReading(timestamp="23:00", metric="spindle_speed_rpm", value=3002.0, unit="RPM"),
            SensorReading(timestamp="03:00", metric="spindle_speed_rpm", value=2998.0, unit="RPM"),
            SensorReading(timestamp="05:30", metric="coolant_temp_c", value=24.1, unit="°C")
        ],
        alarms=[],
        maintenance_tasks=[],
        operator_notes=[
            OperatorNote(
                note_id="N-301",
                timestamp="05:45",
                operator="R. Davis",
                text="Shift ran smoothly. Exceeded target by 8 units. Standard tool change done at 02:00.",
                is_unresolved=False,
                category="General"
            )
        ]
    )
}

def get_scenario_list():
    return [
        {
            "id": key,
            "name": payload.line_id,
            "shift_id": payload.shift_id,
            "shift_type": payload.shift_type,
            "date": payload.date,
            "target_units": payload.target_units,
            "actual_units": payload.actual_units,
            "downtime_minutes": payload.planned_downtime_minutes + payload.unplanned_downtime_minutes
        }
        for key, payload in SCENARIOS.items()
    ]
