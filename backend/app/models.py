from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class MachineAlarm(BaseModel):
    alarm_id: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    description: str
    timestamp: str
    is_safety_critical: bool = False
    resolved: bool = False

class MaintenanceTask(BaseModel):
    task_id: str
    component: str
    priority: str  # MANDATORY, HIGH, MEDIUM, LOW
    description: str
    is_mandatory: bool = True
    status: str  # UNRESOLVED, IN_PROGRESS, RESOLVED

class SensorReading(BaseModel):
    timestamp: str
    metric: str  # e.g., gearbox_temp_c, hydraulic_pressure_bar, vibration_mm_s
    value: float
    unit: str

class OperatorNote(BaseModel):
    note_id: str
    timestamp: str
    operator: str
    text: str
    is_unresolved: bool = True
    category: str = "General"  # Downtime, Quality, Maintenance, Safety

class ShiftPayload(BaseModel):
    shift_id: str
    line_id: str
    date: str
    shift_type: str  # Shift A (Morning), Shift B (Afternoon), Shift C (Night)
    target_units: int
    actual_units: int
    planned_downtime_minutes: float = 0.0
    unplanned_downtime_minutes: float = 0.0
    scrap_count: int = 0
    total_inspected: int
    operating_time_minutes: float = 480.0  # 8 hours standard
    sensor_readings: List[SensorReading] = []
    alarms: List[MachineAlarm] = []
    maintenance_tasks: List[MaintenanceTask] = []
    operator_notes: List[OperatorNote] = []

class ProcessedKPIs(BaseModel):
    target_units: int
    actual_units: int
    variance_units: int
    variance_percent: float
    oee_percent: float
    availability_percent: float
    performance_percent: float
    quality_percent: float
    total_downtime_minutes: float
    scrap_rate_percent: float

class AnomalyItem(BaseModel):
    metric: str
    value: float
    baseline_mean: float
    z_score: float
    is_anomaly: bool
    status: str  # CRITICAL_ANOMALY, WARNING, NORMAL
    description: str

class CorrelationItem(BaseModel):
    sensor: str
    target: str
    coefficient: float
    significance: str  # HIGH, MEDIUM, LOW

class EvidenceEntry(BaseModel):
    issue_id: str
    category: str
    metric_or_alarm: str
    evidence_proof: str
    source_type: str  # METRIC, ALARM, OPERATOR_NOTE, MAINTENANCE

class ProcessedShiftResponse(BaseModel):
    shift_id: str
    line_id: str
    shift_type: str
    date: str
    kpis: ProcessedKPIs
    anomalies: List[AnomalyItem]
    correlations: List[CorrelationItem]
    safety_alarms: List[MachineAlarm]
    mandatory_maintenance: List[MaintenanceTask]
    unresolved_notes: List[OperatorNote]
    evidence_table: List[EvidenceEntry]

class GuardrailAudit(BaseModel):
    fact_based_only: bool = True
    no_math_recalculated: bool = True
    hypotheses_tagged: bool = True
    safety_alarms_unsuppressed: bool = True
    passed: bool = True
    details: List[str] = []

class GenerateReportResponse(BaseModel):
    shift_id: str
    line_id: str
    report_markdown: str
    guardrail_audit: GuardrailAudit
    processed_data: ProcessedShiftResponse
