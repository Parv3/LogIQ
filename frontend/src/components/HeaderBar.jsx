import React, { useState } from 'react';
import { Settings, Upload, Printer, Search, Sun, Moon, Database, User, LogOut, ShieldCheck, Sliders, History } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function HeaderBar({ 
  shiftId, 
  date, 
  operatorName, 
  onFileUpload, 
  onExportPdf, 
  isApiOnline, 
  currentUser, 
  onOpenLogin, 
  onSignOut,
  onOpenCustomShift,
  onOpenHistory
}) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          if (file.name.endsWith('.csv')) {
            const payload = parseCsvToShiftPayload(content);
            onFileUpload(payload);
          } else {
            const json = JSON.parse(content);
            onFileUpload(json);
          }
        } catch (err) {
          alert("Could not parse file. Ensure valid JSON or CSV format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const parseCsvToShiftPayload = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) throw new Error("Empty CSV file");

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

    lines.forEach((line) => {
      const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      if (parts.length < 2) return;

      const firstPartUpper = parts[0].toUpperCase();
      const firstPartLower = parts[0].toLowerCase();
      const val = parts[1];

      // 1. Alarms (e.g. ALM-902,Gearbox Overheat...,09:15,HIGH)
      if (firstPartUpper.startsWith('ALM-') || firstPartUpper.includes('ALARM')) {
        alarms.push({
          alarm_id: parts[0],
          description: parts[1] || "Critical Operational Alarm",
          timestamp: parts[2] || "09:00",
          severity: (parts[3] || "HIGH").toUpperCase(),
          is_safety_critical: true,
          resolved: false
        });
      }
      // 2. Maintenance Tasks (e.g. MNT-108,Replace Lubrication Pump Seals,PENDING_SIGN_OFF)
      else if (firstPartUpper.startsWith('MNT-') || firstPartUpper.includes('MAINTENANCE')) {
        maintenanceTasks.push({
          task_id: parts[0],
          component: parts[1] ? parts[1].split(' ')[0] : "Equipment",
          priority: "MANDATORY",
          description: parts[1] || "Mandatory Equipment Sign-off",
          is_mandatory: true,
          status: (parts[2] || "PENDING_SIGN_OFF").toUpperCase()
        });
      }
      // 3. Operator Notes (e.g. Operator Note,Severe thermal spike...)
      else if (firstPartLower.includes('note')) {
        operatorNotes.push({
          note_id: `N-00${operatorNotes.length + 1}`,
          timestamp: "12:00",
          operator: "Shift Supervisor",
          text: parts[1] || parts[0],
          is_unresolved: true,
          category: "Operator Observation"
        });
      }
      // 4. Shift Key Metadata
      else if (firstPartLower.includes('shift_id')) shiftId = val;
      else if (firstPartLower.includes('line_id') || firstPartLower === 'line') lineId = val;
      else if (firstPartLower.includes('date')) date = val;
      else if (firstPartLower.includes('shift_type')) shiftType = val;
      else if (firstPartLower.includes('target')) targetUnits = parseInt(val) || targetUnits;
      else if (firstPartLower.includes('actual')) actualUnits = parseInt(val) || actualUnits;
      else if (firstPartLower.includes('planned_downtime')) plannedDowntime = parseFloat(val) || plannedDowntime;
      else if (firstPartLower.includes('unplanned_downtime') || firstPartLower.includes('downtime')) unplannedDowntime = parseFloat(val) || unplannedDowntime;
      else if (firstPartLower.includes('scrap')) scrapCount = parseInt(val) || scrapCount;
      else if (firstPartLower.includes('inspected')) totalInspected = parseInt(val) || totalInspected;
      // 5. Sensor readings (e.g. Gearbox Oil Temp,09:15,98.4,°C)
      else if (parts.length >= 3 && !isNaN(parseFloat(parts[2]))) {
        sensorReadings.push({
          metric: parts[0],
          timestamp: parts[1] || "08:00",
          value: parseFloat(parts[2]) || 0.0,
          unit: parts[3] || "unit"
        });
      }
    });

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
  };

  const loadSampleCsv = async (csvPath) => {
    if (!csvPath) return;
    try {
      const res = await fetch(csvPath);
      if (res.ok) {
        const text = await res.text();
        const payload = parseCsvToShiftPayload(text);
        onFileUpload(payload);
      }
    } catch (err) {
      console.error("Failed to load sample CSV:", err);
    }
  };

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || operatorName || 'P. Mishra';

  return (
    <header className="header-bar">
      <div className="header-left-group">
        <div className="brand-logo">
          <Settings size={20} color="var(--text-secondary)" />
          <span>LOGIQ</span>
        </div>

        <div className="shift-metadata-box">
          <div className="meta-item">
            <span className="meta-label">SHIFT ID:</span>
            <span className="meta-value">{shiftId || 'SH-402'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">DATE:</span>
            <span className="meta-value">{date || '18 SEP 2026'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">OP:</span>
            <span className="meta-value">{displayName}</span>
          </div>
        </div>
      </div>

      <div className="header-actions-group no-print">
        {/* Sample CSV Scenario Selector */}
        <select
          onChange={(e) => loadSampleCsv(e.target.value)}
          defaultValue=""
          className="btn"
          style={{
            background: 'var(--bg-card-sub)',
            color: 'var(--text-primary)',
            fontSize: '0.725rem',
            padding: '0.4rem 0.5rem',
            outline: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            border: '1px solid var(--border-color)'
          }}
          title="Select a pre-loaded sample CSV scenario"
        >
          <option value="" disabled>📊 DEMO DATA CSVs...</option>
          <option value="/sample_data/sample_shift_alpha_gearbox_critical.csv">1. Critical Gearbox Overheat (CSV)</option>
          <option value="/sample_data/sample_shift_beta_packaging_jam.csv">2. Conveyor Feeder Jam (CSV)</option>
          <option value="/sample_data/sample_shift_gamma_optimal_run.csv">3. Optimal High-Speed Run (CSV)</option>
        </select>

        <button onClick={onOpenCustomShift} className="btn" title="Create Custom Shift Log Form">
          <Sliders size={14} color="var(--accent-blue)" />
          <span className="btn-label-desktop">NEW SHIFT FORM</span>
          <span className="btn-label-mobile">NEW FORM</span>
        </button>

        <button onClick={onOpenHistory} className="btn" title="View Shift Archive & History">
          <History size={14} />
          <span className="btn-label-desktop">SHIFT ARCHIVE</span>
          <span className="btn-label-mobile">ARCHIVE</span>
        </button>

        <label className="btn" style={{ cursor: 'pointer' }}>
          <Upload size={14} />
          <span className="btn-label-desktop">UPLOAD SHIFT LOG / CSV</span>
          <span className="btn-label-mobile">UPLOAD</span>
          <input type="file" accept=".json,.csv" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>

        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'var(--bg-card-sub)',
                padding: '0.4rem 0.65rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              <ShieldCheck size={14} color="var(--status-success)" />
              <span>{displayName}</span>
            </div>
            <button 
              onClick={onSignOut} 
              className="btn btn-secondary"
              title="Sign Out of Shift Account"
              style={{ padding: '0.45rem 0.6rem' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button 
            onClick={onOpenLogin} 
            className="btn btn-primary"
            style={{ fontWeight: 700, gap: '0.4rem' }}
          >
            <User size={14} />
            <span className="btn-label-desktop">OPERATOR LOGIN / GOOGLE AUTH</span>
            <span className="btn-label-mobile">LOGIN</span>
          </button>
        )}

        <ThemeToggle />

        <button onClick={onExportPdf} className="btn" style={{ fontWeight: 700 }}>
          <Printer size={14} />
          <span className="btn-label-desktop">EXPORT REPORT (PDF)</span>
          <span className="btn-label-mobile">EXPORT</span>
        </button>
      </div>
    </header>
  );
}
