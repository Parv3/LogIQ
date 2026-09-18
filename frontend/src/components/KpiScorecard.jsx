import React from 'react';

export default function KpiScorecard({ kpis }) {
  const target = kpis ? kpis.target_units.toLocaleString() : '10,000';
  const actual = kpis ? kpis.actual_units.toLocaleString() : '8,450';
  const variancePct = kpis ? Math.abs(kpis.variance_percent) : 15.5;
  const downtime = kpis ? kpis.total_downtime_minutes : 45;
  const defects = kpis ? kpis.scrap_count || Math.round(kpis.scrap_rate_percent * 3.5) : 12;

  return (
    <div className="industrial-card">
      <div className="card-title">
        <span>KPI SCORECARD (PANDAS)</span>
      </div>

      <div className="kpi-grid">
        <div className="kpi-box">
          <div className="kpi-sub" style={{ textTransform: 'none', fontWeight: 600 }}>Production Target:</div>
          <div className="kpi-num">{target}</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-sub" style={{ textTransform: 'none', fontWeight: 600 }}>Actual:</div>
          <div className="kpi-num">{actual}</div>
          <div className="kpi-sub">({variancePct}% Variance <span className="cite">[cite: 1]</span>)</div>
        </div>

        <div className="kpi-box amber">
          <div className="kpi-sub" style={{ textTransform: 'none', fontWeight: 600, color: 'var(--text-primary)' }}>Downtime:</div>
          <div className="kpi-num" style={{ color: 'var(--text-primary)' }}>{downtime} Min</div>
          <div className="kpi-sub" style={{ color: 'var(--text-primary)' }}>(Alert <span className="cite">[cite: 1]</span>)</div>
        </div>

        <div className="kpi-box red">
          <div className="kpi-sub" style={{ textTransform: 'none', fontWeight: 600, color: '#FFFFFF' }}>Defects:</div>
          <div className="kpi-num" style={{ color: '#FFFFFF' }}>{defects}</div>
          <div className="kpi-sub" style={{ color: '#FFFFFF' }}>(Yellow <span className="cite">[cite: 1]</span>)</div>
        </div>
      </div>
    </div>
  );
}
