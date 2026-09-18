// Embedded Sample CSV Datasets & Universal CSV Parser for LogIQ Operations Command Center

export const SAMPLE_CSVS = {
  alpha: `shift_id,SH-ALPHA-901
line_id,Line 4 - Stator Assembly
date,2026-09-18
shift_type,Shift A (Morning 06:00 - 14:00)
target_units,500
actual_units,380
planned_downtime,15
unplanned_downtime,110
scrap_count,22
inspected,402
Gearbox Oil Temp,08:30,94.2,°C
Gearbox Oil Temp,09:15,98.4,°C
Bearing Vibration,09:45,4.2,mm/s
Hydraulic Line Pressure,10:30,2180.0,PSI
Line Speed,11:00,1240.0,RPM
Motor Drive Current,11:45,48.5,Amps
ALM-902,Gearbox Overheat High Limit Exceeded (98.4°C),09:15,HIGH
ALM-905,Main Motor Drive Overcurrent,11:45,MEDIUM
MNT-108,Replace Gearbox Lubrication Pump Seals,PENDING_SIGN_OFF
Operator Note,Severe thermal spike observed on gearbox housing after 09:00. Oil recirculation pump tripping repeatedly.`,

  beta: `shift_id,SH-BETA-702
line_id,Line 2 - Automated Packaging & Palletizing
date,2026-09-18
shift_type,Shift B (Evening 14:00 - 22:00)
target_units,650
actual_units,540
planned_downtime,20
unplanned_downtime,65
scrap_count,45
inspected,585
Conveyor Feeder Speed,15:00,850.0,RPM
Pneumatic System Pressure,16:30,580.0,PSI
Arm Actuator Temp,18:00,68.5,°C
Optical Sensor Alignment,19:15,0.85,mm
ALM-404,Feeder Infeed Photoeye Sensor Blocked,16:15,MEDIUM
ALM-408,Pneumatic Pressure Drop Below Operating Limit,16:30,HIGH
MNT-304,Realign Packaging Arm Photoeye & Calibrate Sensor,PENDING_SIGN_OFF
Operator Note,High scrap rate caused by misaligned box guide rail. Operator adjusted guide width manually at 17:00.`,

  gamma: `shift_id,SH-GAMMA-303
line_id,Line 1 - High Precision CNC Machining
date,2026-09-18
shift_type,Shift C (Night 22:00 - 06:00)
target_units,600
actual_units,592
planned_downtime,15
unplanned_downtime,8
scrap_count,3
inspected,595
Spindle Speed,23:00,3200.0,RPM
Coolant Fluid Temp,01:30,42.1,°C
Spindle Vibration,03:00,1.25,mm/s
Hydraulic System Pressure,04:45,2100.0,PSI
MNT-101,Routine Shift End Spindle Lubrication,COMPLETED
Operator Note,Shift executed smoothly with optimal spindle thermal balance. 0 safety interlock alarms logged.`
};

/**
 * Universal CSV Parser supporting both vertical Key-Value CSVs and tabular Row CSVs.
 */
export function parseCsvToShiftPayload(text) {
  if (!text || typeof text !== 'string') throw new Error("Empty or invalid CSV content");

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) throw new Error("Empty CSV content");

  let shiftId = `SH-${Date.now().toString().slice(-6)}`;
  let lineId = "Line 1 - Uploaded Dataset";
  let date = new Date().toISOString().split('T')[0];
  let shiftType = "Shift A (Morning 06:00 - 14:00)";
  let targetUnits = 500;
  let actualUnits = 450;
  let plannedDowntime = 15;
  let unplannedDowntime = 35;
  let scrapCount = 12;
  let totalInspected = 462;
  const sensorReadings = [];
  const alarms = [];
  const maintenanceTasks = [];
  const operatorNotes = [];

  // Check if Line 0 is a Tabular Header (must have at least 3 parts and include target/actual columns)
  const headerParts = lines[0].split(',').map(p => p.trim().replace(/^"|"$/g, '').toLowerCase());
  const isTabularHeader = headerParts.length >= 3 && (
    (headerParts.includes('target') || headerParts.includes('target_units')) &&
    (headerParts.includes('actual') || headerParts.includes('actual_units'))
  );

  if (isTabularHeader && lines.length >= 2) {
    const dataParts = lines[1].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
    headerParts.forEach((h, idx) => {
      const val = dataParts[idx];
      if (!val) return;
      if (h.includes('shift_id')) shiftId = val;
      if (h.includes('line_id') || h === 'line') lineId = val;
      if (h.includes('date')) date = val;
      if (h.includes('shift_type')) shiftType = val;
      if (h.includes('target')) targetUnits = parseInt(val) || targetUnits;
      if (h.includes('actual')) actualUnits = parseInt(val) || actualUnits;
      if (h.includes('unplanned') || h === 'downtime') unplannedDowntime = parseFloat(val) || unplannedDowntime;
      else if (h.includes('planned')) plannedDowntime = parseFloat(val) || plannedDowntime;
      if (h.includes('scrap')) scrapCount = parseInt(val) || scrapCount;
      if (h.includes('inspected')) totalInspected = parseInt(val) || totalInspected;
    });

    for (let i = 2; i < lines.length; i++) {
      parseDetailCsvLine(lines[i], alarms, maintenanceTasks, operatorNotes, sensorReadings);
    }
  } else {
    lines.forEach(line => {
      const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      if (parts.length < 2) return;

      const firstPartUpper = parts[0].toUpperCase();
      const firstPartLower = parts[0].toLowerCase();
      const val = parts[1];

      // 1. Shift Key Metadata
      if (firstPartLower.includes('shift_id')) shiftId = val;
      else if (firstPartLower.includes('line_id') || firstPartLower === 'line') lineId = val;
      else if (firstPartLower.includes('date')) date = val;
      else if (firstPartLower.includes('shift_type')) shiftType = val;
      else if (firstPartLower.includes('target')) targetUnits = parseInt(val) || targetUnits;
      else if (firstPartLower.includes('actual')) actualUnits = parseInt(val) || actualUnits;
      else if (firstPartLower.includes('unplanned') || firstPartLower === 'downtime') unplannedDowntime = parseFloat(val) || unplannedDowntime;
      else if (firstPartLower.includes('planned')) plannedDowntime = parseFloat(val) || plannedDowntime;
      else if (firstPartLower.includes('scrap')) scrapCount = parseInt(val) || scrapCount;
      else if (firstPartLower.includes('inspected')) totalInspected = parseInt(val) || totalInspected;
      else {
        parseDetailCsvLine(line, alarms, maintenanceTasks, operatorNotes, sensorReadings);
      }
    });
  }

  return {
    shift_id: shiftId,
    line_id: lineId,
    date: date,
    shift_type: shiftType,
    target_units: targetUnits,
    actual_units: actualUnits,
    planned_downtime_minutes: plannedDowntime,
    unplanned_downtime_minutes: unplannedDowntime,
    scrap_count: scrapCount,
    total_inspected: Math.max(actualUnits + scrapCount, totalInspected),
    operating_time_minutes: 480.0,
    sensor_readings: sensorReadings,
    alarms: alarms,
    maintenance_tasks: maintenanceTasks,
    operator_notes: operatorNotes
  };
}

function parseDetailCsvLine(line, alarms, maintenanceTasks, operatorNotes, sensorReadings) {
  const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
  if (parts.length < 2) return;

  const firstUpper = parts[0].toUpperCase();
  const firstLower = parts[0].toLowerCase();

  if (firstUpper.startsWith('ALM-') || firstUpper.includes('ALARM')) {
    alarms.push({
      alarm_id: parts[0],
      description: parts[1] || "Critical Operational Alarm",
      timestamp: parts[2] || "09:00",
      severity: (parts[3] || "HIGH").toUpperCase(),
      is_safety_critical: true,
      resolved: false
    });
  } else if (firstUpper.startsWith('MNT-') || firstUpper.includes('MAINTENANCE')) {
    maintenanceTasks.push({
      task_id: parts[0],
      component: parts[1] ? parts[1].split(' ')[0] : "Equipment",
      priority: "MANDATORY",
      description: parts[1] || "Mandatory Equipment Sign-off",
      is_mandatory: true,
      status: (parts[2] || "PENDING_SIGN_OFF").toUpperCase()
    });
  } else if (firstLower.includes('note')) {
    operatorNotes.push({
      note_id: `N-00${operatorNotes.length + 1}`,
      timestamp: "12:00",
      operator: "Shift Supervisor",
      text: parts[1] || parts[0],
      is_unresolved: true,
      category: "Operator Observation"
    });
  } else if (parts.length >= 3 && !isNaN(parseFloat(parts[2]))) {
    sensorReadings.push({
      metric: parts[0],
      timestamp: parts[1] || "08:00",
      value: parseFloat(parts[2]) || 0.0,
      unit: parts[3] || "unit"
    });
  }
}
