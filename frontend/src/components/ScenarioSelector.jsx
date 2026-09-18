import React, { useState } from 'react';
import { Layers, Upload, Code, CheckCircle2 } from 'lucide-react';

export default function ScenarioSelector({ scenarios, activeScenarioId, onSelectScenario, onFileUpload }) {
  const [showJsonEditor, setShowJsonEditor] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          onFileUpload(json);
        } catch (err) {
          alert("Invalid JSON file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Shift Data Input & Scenario Selector</h3>
        </div>
        
        <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
          <Upload size={14} />
          <span>Upload Custom JSON</span>
          <input type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {scenarios.map((sc) => {
          const isActive = activeScenarioId === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              className={`glass-panel ${isActive ? 'active-scenario' : ''}`}
              style={{
                flex: '1 1 250px',
                padding: '0.85rem 1rem',
                border: isActive ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isActive ? 'var(--accent-cyan)' : 'var(--text-main)' }}>
                  {sc.name}
                </span>
                {isActive && <CheckCircle2 size={16} color="var(--accent-cyan)" />}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {sc.shift_type} | Target: {sc.target_units} | Actual: {sc.actual_units}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
