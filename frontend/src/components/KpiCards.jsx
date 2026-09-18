import React from 'react';

export default function KpiCards({ kpis }) {
  const target = kpis ? kpis.target_units : '--';
  const actual = kpis ? kpis.actual_units : '--';
  const variance = kpis ? `${kpis.variance_units >= 0 ? '+' : ''}${kpis.variance_units}` : '--';
  const oee = kpis ? `${kpis.oee_percent}%` : '--%';
  const downtime = kpis ? `${kpis.total_downtime_minutes}m` : '--m';
  const scrap = kpis ? `${kpis.scrap_rate_percent}%` : '--%';

  const isPositive = kpis ? kpis.variance_units >= 0 : true;

  return (
    <div className="kpi-strip">
      <div className="kpi-box">
        <div className="kpi-label">Target Units</div>
        <div className="kpi-value">{target}</div>
      </div>

      <div className="kpi-box">
        <div className="kpi-label">Actual Production</div>
        <div className="kpi-value">{actual}</div>
      </div>

      <div className="kpi-box">
        <div className="kpi-label">Target Variance</div>
        <div className="kpi-value" style={{ color: isPositive ? 'var(--status-success)' : 'var(--status-danger)' }}>
          {variance}
        </div>
      </div>

      <div className="kpi-box">
        <div className="kpi-label">OEE Performance</div>
        <div className="kpi-value" style={{ color: 'var(--accent-blue)' }}>{oee}</div>
      </div>

      <div className="kpi-box">
        <div className="kpi-label">Total Downtime</div>
        <div className="kpi-value" style={{ color: 'var(--status-warning)' }}>{downtime}</div>
      </div>

      <div className="kpi-box">
        <div className="kpi-label">Scrap Rate</div>
        <div className="kpi-value" style={{ color: kpis && kpis.scrap_rate_percent > 3 ? 'var(--status-danger)' : 'var(--text-primary)' }}>
          {scrap}
        </div>
      </div>
    </div>
  );
}
