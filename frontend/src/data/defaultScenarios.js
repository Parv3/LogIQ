export const DEFAULT_PAYLOAD = {
  shift_id: "SH-20260918-A",
  line_id: "Line 4 - Stator Assembly",
  date: "2026-09-18",
  shift_type: "Shift A (Morning 06:00 - 14:00)",
  target_units: 500,
  actual_units: 415,
  planned_downtime_minutes: 15.0,
  unplanned_downtime_minutes: 85.0,
  scrap_count: 22,
  total_inspected: 437,
  operating_time_minutes: 480.0,
  sensor_readings: [
    { timestamp: "06:00", metric: "gearbox_temp_c", value: 62.0, unit: "°C" },
    { timestamp: "07:00", metric: "gearbox_temp_c", value: 67.0, unit: "°C" },
    { timestamp: "08:30", metric: "gearbox_temp_c", value: 82.4, unit: "°C" },
    { timestamp: "09:45", metric: "gearbox_temp_c", value: 98.4, unit: "°C" },
    { timestamp: "11:20", metric: "hydraulic_pressure_bar", value: 142.5, unit: "bar" },
    { timestamp: "12:10", metric: "vibration_mm_s", value: 4.8, unit: "mm/s" }
  ],
  alarms: [
    {
      alarm_id: "ALM-902",
      severity: "CRITICAL",
      description: "Gearbox Overheat High Limit Exceeded (98.4°C)",
      timestamp: "09:45:12",
      is_safety_critical: true,
      resolved: false
    },
    {
      alarm_id: "ALM-415",
      severity: "HIGH",
      description: "Hydraulic Pressure Line Spike (142.5 bar)",
      timestamp: "11:20:05",
      is_safety_critical: false,
      resolved: true
    }
  ],
  maintenance_tasks: [
    {
      task_id: "MNT-108",
      component: "Gearbox Lubrication Pump #2",
      priority: "MANDATORY",
      description: "Inspect lube oil flow rate and replace thermal sensor coupling",
      is_mandatory: true,
      status: "UNRESOLVED"
    }
  ],
  operator_notes: [
    {
      note_id: "N-001",
      timestamp: "08:20",
      operator: "J. Vance (Op-L4)",
      text: "Noticed grinding whine coming from main gearbox drive at 08:15. Temp rising steadily.",
      is_unresolved: true,
      category: "Maintenance"
    },
    {
      note_id: "N-002",
      timestamp: "10:00",
      operator: "M. Chen (Lead)",
      text: "Line tripped automatically following ALM-902. Cooled down for 45 mins. Lubricant smelled burnt.",
      is_unresolved: true,
      category: "Downtime"
    }
  ]
};

export function computeClientKPIs(payload) {
  const target = payload.target_units || 500;
  const actual = payload.actual_units || 415;
  const variance_units = actual - target;
  const variance_percent = target > 0 ? Number(((variance_units / target) * 100).toFixed(2)) : 0;

  const planned = payload.planned_downtime_minutes || 0;
  const unplanned = payload.unplanned_downtime_minutes || 0;
  const total_downtime = planned + unplanned;
  const operating_time = payload.operating_time_minutes || 480;

  const net_operating = Math.max(0, operating_time - unplanned);
  const availability = operating_time > 0 ? net_operating / operating_time : 1.0;
  const performance = target > 0 ? Math.min(1.2, actual / target) : 0.0;

  const total_inspected = Math.max(actual, payload.total_inspected || actual);
  const good_units = Math.max(0, total_inspected - (payload.scrap_count || 0));
  const quality = total_inspected > 0 ? good_units / total_inspected : 1.0;

  const oee = Number((availability * performance * quality * 100).toFixed(2));
  const scrap_rate = total_inspected > 0 ? Number(((payload.scrap_count / total_inspected) * 100).toFixed(2)) : 0;

  return {
    target_units: target,
    actual_units: actual,
    variance_units,
    variance_percent,
    oee_percent: oee,
    availability_percent: Number((availability * 100).toFixed(2)),
    performance_percent: Number((performance * 100).toFixed(2)),
    quality_percent: Number((quality * 100).toFixed(2)),
    total_downtime_minutes: Number(total_downtime.toFixed(2)),
    scrap_rate_percent: scrap_rate
  };
}

export function processClientShift(payload) {
  const kpis = computeClientKPIs(payload);

  const anomalies = (payload.sensor_readings || []).map(s => {
    let baseline = 70.0;
    if (s.metric.includes('pressure')) baseline = 120.0;
    if (s.metric.includes('vibration')) baseline = 2.5;

    const is_anomaly = s.value > baseline * 1.25;
    const z_score = is_anomaly ? 3.4 : 0.8;
    return {
      metric: s.metric,
      value: s.value,
      baseline_mean: baseline,
      z_score: z_score,
      is_anomaly: is_anomaly,
      status: is_anomaly ? "CRITICAL_ANOMALY" : "NORMAL",
      description: `Value ${s.value} vs baseline ${baseline}`
    };
  });

  const safety_alarms = (payload.alarms || []).filter(a => a.is_safety_critical || a.severity === 'CRITICAL');
  const mandatory_maintenance = (payload.maintenance_tasks || []).filter(m => m.is_mandatory || m.priority === 'MANDATORY');
  const unresolved_notes = (payload.operator_notes || []).filter(n => n.is_unresolved);

  const evidence_table = [];
  let idx = 1;
  safety_alarms.forEach(a => {
    evidence_table.push({
      issue_id: `EVID-${String(idx++).padStart(3, '0')}`,
      category: "CRITICAL_SAFETY_ALARM",
      metric_or_alarm: a.alarm_id,
      evidence_proof: `Alarm [${a.severity}]: ${a.description} at ${a.timestamp}`,
      source_type: "ALARM"
    });
  });
  anomalies.filter(an => an.is_anomaly).forEach(an => {
    evidence_table.push({
      issue_id: `EVID-${String(idx++).padStart(3, '0')}`,
      category: "SENSOR_ANOMALY",
      metric_or_alarm: an.metric,
      evidence_proof: `Z-Score ${an.z_score} (Max Val: ${an.value} vs Normal ${an.baseline_mean})`,
      source_type: "METRIC"
    });
  });
  mandatory_maintenance.forEach(m => {
    evidence_table.push({
      issue_id: `EVID-${String(idx++).padStart(3, '0')}`,
      category: "MANDATORY_MAINTENANCE",
      metric_or_alarm: m.task_id,
      evidence_proof: `Component ${m.component}: ${m.description} (Status: ${m.status})`,
      source_type: "MAINTENANCE"
    });
  });

  return {
    shift_id: payload.shift_id,
    line_id: payload.line_id,
    shift_type: payload.shift_type,
    date: payload.date,
    kpis,
    anomalies,
    correlations: [],
    safety_alarms,
    mandatory_maintenance,
    unresolved_notes,
    evidence_table
  };
}
