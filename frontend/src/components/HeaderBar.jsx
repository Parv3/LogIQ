import React, { useState } from 'react';
import { Settings, Upload, Printer, Search, Sun, Moon, Database } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function HeaderBar({ shiftId, date, operatorName, onFileUpload, onExportPdf, isApiOnline }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          onFileUpload(json);
        } catch (err) {
          alert("Invalid JSON shift payload.");
        }
      };
      reader.readAsText(file);
    }
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
