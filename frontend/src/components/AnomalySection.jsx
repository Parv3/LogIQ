import React from 'react';
import { Activity, Zap, Link } from 'lucide-react';

export default function AnomalySection({ anomalies, correlations }) {
  return (
    <div className="grid-2">
      {/* Statistical Anomaly Detector */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <Activity size={18} color="var(--status-warning)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Statistical Sensor Anomalies (Z-Score)</h3>
        </div>

        {anomalies && anomalies.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {anomalies.map((anom, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: `4px solid ${anom.is_anomaly ? 'var(--status-warning)' : 'var(--status-success)'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {anom.metric}
                  </span>
                  <span className={`badge ${anom.is_anomaly ? 'badge-warning' : 'badge-success'}`}>
                    Z-Score: +{anom.z_score}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Recorded Peak: <strong>{anom.value}</strong> vs Expected Baseline: {anom.baseline_mean}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            No statistically significant sensor anomalies detected (Z-score &lt; 2.5).
          </div>
        )}
      </div>

      {/* Sensor Correlation Matrix */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <Link size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Sensor-Downtime Correlation Matrix</h3>
        </div>

        {correlations && correlations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {correlations.map((corr, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.85rem' }}>
                    {corr.sensor} → {corr.target}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Pearson Coefficient: <strong>r = {corr.coefficient}</strong>
                  </div>
                </div>

                <span className={`badge ${corr.significance === 'HIGH' ? 'badge-cyan' : 'badge-warning'}`}>
                  {corr.significance} Correlation
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Correlation calculations pending sensor time series input.
          </div>
        )}
      </div>
    </div>
  );
}
