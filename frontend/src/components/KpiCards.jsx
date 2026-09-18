import React from 'react';
import { Target, Gauge, Clock, Trash2, TrendingDown, TrendingUp } from 'lucide-react';

export default function KpiCards({ kpis }) {
  if (!kpis) return null;

  const isPositiveVariance = kpis.variance_units >= 0;
  const varianceSign = isPositiveVariance ? '+' : '';

  return (
    <div className="grid-4">
      {/* OEE Card */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Overall Equipment Effectiveness</span>
          <Gauge size={18} color="var(--accent-cyan)" />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
          {kpis.oee_percent}%
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', gap: '0.5rem' }}>
          <span>Avail: {kpis.availability_percent}%</span> • 
          <span>Perf: {kpis.performance_percent}%</span> • 
          <span>Qual: {kpis.quality_percent}%</span>
        </div>
      </div>

      {/* Target vs Actual Card */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Production Target vs Actual</span>
          <Target size={18} color="var(--accent-blue)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{kpis.actual_units}</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>/ {kpis.target_units} units</span>
        </div>
        <div style={{ marginTop: '0.35rem' }}>
          <span className={`badge ${isPositiveVariance ? 'badge-success' : 'badge-danger'}`}>
            {isPositiveVariance ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {varianceSign}{kpis.variance_units} units ({varianceSign}{kpis.variance_percent}%)
          </span>
        </div>
      </div>

      {/* Total Downtime Card */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Downtime</span>
          <Clock size={18} color="var(--status-warning)" />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-warning)' }}>
          {kpis.total_downtime_minutes} <span style={{ fontSize: '1rem', fontWeight: 500 }}>mins</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          Unplanned downtime impact analyzed by Pandas engine
        </div>
      </div>

      {/* Scrap Rate Card */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Quality Scrap Rate</span>
          <Trash2 size={18} color="var(--status-danger)" />
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: kpis.scrap_rate_percent > 3 ? 'var(--status-danger)' : 'var(--status-success)' }}>
          {kpis.scrap_rate_percent}%
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          Quality inspection scrap percentage
        </div>
      </div>
    </div>
  );
}
