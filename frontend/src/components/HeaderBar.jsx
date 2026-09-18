import React, { useState } from 'react';
import { Settings, Upload, Printer, Search, Sun, Moon, Database, User, LogOut, ShieldCheck, Sliders, History } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { SAMPLE_CSVS, parseCsvToShiftPayload } from '../data/sampleCsvData';

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

  const handleSelectSample = (keyOrPath) => {
    if (!keyOrPath) return;
    try {
      if (SAMPLE_CSVS[keyOrPath]) {
        const payload = parseCsvToShiftPayload(SAMPLE_CSVS[keyOrPath]);
        onFileUpload(payload);
      } else {
        fetch(keyOrPath)
          .then(res => res.text())
          .then(text => {
            const payload = parseCsvToShiftPayload(text);
            onFileUpload(payload);
          })
          .catch(err => console.error("Error fetching sample CSV:", err));
      }
    } catch (err) {
      console.error("Error loading sample CSV:", err);
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
          onChange={(e) => handleSelectSample(e.target.value)}
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
          <option value="alpha">1. Critical Gearbox Overheat (CSV)</option>
          <option value="beta">2. Conveyor Feeder Jam (CSV)</option>
          <option value="gamma">3. Optimal High-Speed Run (CSV)</option>
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
