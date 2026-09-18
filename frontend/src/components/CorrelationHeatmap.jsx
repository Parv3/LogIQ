import React from 'react';
import { Grid, TrendingUp } from 'lucide-react';

export default function CorrelationHeatmap({ correlations }) {
  if (!correlations || correlations.length === 0) return null;

  return (
    <div className="industrial-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Grid size={18} color="var(--accent-blue)" />
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Sensor-Downtime Pearson Correlation Matrix Grid</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
        {correlations.map((corr, i) => {
          const coef = corr.coefficient;
          const isHigh = Math.abs(coef) >= 0.7;
          const isMedium = Math.abs(coef) >= 0.4 && !isHigh;
          const statusColor = isHigh ? 'var(--status-danger)' : (isMedium ? 'var(--status-warning)' : 'var(--status-success)');

          return (
            <div
              key={i}
              style={{
                background: 'var(--bg-main)',
                border: `1px solid ${statusColor}`,
                borderRadius: 'var(--radius)',
                padding: '0.85rem'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                {corr.sensor}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: statusColor, margin: '0.2rem 0' }}>
                r = {coef >= 0 ? '+' : ''}{coef}
              </div>
              <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Impact: {corr.target}</span>
                <span className={`badge ${isHigh ? 'badge-danger' : (isMedium ? 'badge-warning' : 'badge-success')}`} style={{ fontSize: '0.65rem' }}>
                  {corr.significance}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
