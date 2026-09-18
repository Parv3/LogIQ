import React, { useState } from 'react';
import { Settings, Upload, Printer, Search, Sun, Moon, Database, User, LogOut, ShieldCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function HeaderBar({ shiftId, date, operatorName, onFileUpload, onExportPdf, isApiOnline }) {
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

      const key = parts[0].toLowerCase();
      const val = parts[1];

      if (key.includes('shift_id')) shiftId = val;
      else if (key.includes('line_id') || key.includes('line')) lineId = val;
      else if (key.includes('date')) date = val;
      else if (key.includes('shift_type')) shiftType = val;
      else if (key.includes('target')) targetUnits = parseInt(val) || targetUnits;
      else if (key.includes('actual')) actualUnits = parseInt(val) || actualUnits;
      else if (key.includes('planned_downtime')) plannedDowntime = parseFloat(val) || plannedDowntime;
      else if (key.includes('unplanned_downtime') || key.includes('downtime')) unplannedDowntime = parseFloat(val) || unplannedDowntime;
      else if (key.includes('scrap')) scrapCount = parseInt(val) || scrapCount;
      else if (key.includes('inspected')) totalInspected = parseInt(val) || totalInspected;
      else if (parts.length >= 4) {
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
      total_inspected: totalInspected,
      operating_time_minutes: 480.0,
      sensor_readings: sensorReadings,
      alarms: alarms,
      maintenance_tasks: maintenanceTasks,
      operator_notes: operatorNotes
    };
  };

  return (
    <header className="header-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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
            <span className="meta-value">{operatorName || 'P. Mishra'}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }} className="no-print">
        <label className="btn" style={{ cursor: 'pointer' }}>
          <Upload size={14} />
          <span>UPLOAD SHIFT LOG / CSV DATA</span>
          <input type="file" accept=".json,.csv" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>

        <ThemeToggle />

        <button onClick={onExportPdf} className="btn" style={{ fontWeight: 700 }}>
          <Printer size={14} />
          <span>EXPORT INCIDENT REPORT (PDF)</span>
        </button>
      </div>
    </header>
  );
}
