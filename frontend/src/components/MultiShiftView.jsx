import React, { useState } from 'react';
import { ArrowRight, RefreshCw, Layers, TrendingUp } from 'lucide-react';

export default function MultiShiftView({ scenarios, onCarryForward, comparisonData }) {
  const [sourceShift, setSourceShift] = useState(scenarios[0]?.id || '');
  const [targetShift, setTargetShift] = useState(scenarios[1]?.id || '');
  const [carriedSuccess, setCarriedSuccess] = useState(false);

  const handleCarry = () => {
    if (sourceShift && targetShift && sourceShift !== targetShift) {
      onCarryForward(sourceShift, targetShift);
      setCarriedSuccess(true);
      setTimeout(() => setCarriedSuccess(false), 4000);
    } else {
      alert("Please select two distinct shifts to carry unresolved items forward.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Carry Forward Section */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <RefreshCw size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Carry Forward Unresolved Issues Across Shifts</h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Select a completed shift (Shift N) to carry forward all open maintenance tasks, active safety alarms, and unresolved operator notes directly into the incoming shift (Shift N+1).
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>
              SOURCE SHIFT (SHIFT N)
            </label>
            <select
              value={sourceShift}
              onChange={(e) => setSourceShift(e.target.value)}
              className="glass-panel"
              style={{ width: '100%', padding: '0.6rem', color: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
            >
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id} style={{ background: '#1E293B', color: '#fff' }}>
                  {sc.name} ({sc.shift_type})
                </option>
              ))}
            </select>
          </div>

          <ArrowRight size={20} color="var(--accent-cyan)" style={{ marginTop: '1.2rem' }} />

          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>
              TARGET SHIFT (SHIFT N+1)
            </label>
            <select
              value={targetShift}
              onChange={(e) => setTargetShift(e.target.value)}
              className="glass-panel"
              style={{ width: '100%', padding: '0.6rem', color: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
            >
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id} style={{ background: '#1E293B', color: '#fff' }}>
                  {sc.name} ({sc.shift_type})
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleCarry} className="btn btn-primary" style={{ marginTop: '1.2rem' }}>
            <RefreshCw size={14} />
            <span>Execute Carry Forward</span>
          </button>
        </div>

        {carriedSuccess && (
          <div style={{ marginTop: '0.85rem', color: 'var(--status-success)', fontSize: '0.85rem', fontWeight: 600 }}>
            ✓ Successfully carried forward unresolved issues to target shift!
          </div>
        )}
      </div>

      {/* Side-by-Side Shift Comparison Table */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <TrendingUp size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Multi-Shift Performance Trend & Comparison</h3>
        </div>

        {comparisonData && comparisonData.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Shift ID</th>
                  <th>Production Line</th>
                  <th>Date</th>
                  <th>Target / Actual</th>
                  <th>Variance</th>
                  <th>OEE %</th>
                  <th>Downtime (m)</th>
                  <th>Scrap Rate %</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{row.shift_id}</td>
                    <td style={{ fontWeight: 600 }}>{row.line_id}</td>
                    <td>{row.date}</td>
                    <td>{row.actual_units} / {row.target_units}</td>
                    <td>
                      <span className={`badge ${row.variance_units >= 0 ? 'badge-success' : 'badge-danger'}`}>
                        {row.variance_units >= 0 ? '+' : ''}{row.variance_units}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{row.oee_percent}%</td>
                    <td style={{ color: row.downtime_minutes > 30 ? 'var(--status-warning)' : 'var(--text-main)' }}>
                      {row.downtime_minutes} mins
                    </td>
                    <td>{row.scrap_rate_percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Shift comparison data loading...
          </div>
        )}
      </div>
    </div>
  );
}
