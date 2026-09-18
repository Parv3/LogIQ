import React from 'react';

export default function AnomalyFeed({ anomalies }) {
  const defaultFeed = [
    { time: '14:02 UTC', source: 'Machine 3', desc: 'Temperature Spike (Active)', severity: 'High' },
    { time: '13:15 UTC', source: 'Conv. B', desc: 'Motor Load Fluctuation', severity: 'Med' },
    { time: '11:45 UTC', source: 'Machine 1', desc: 'Low Output Detected', severity: 'Low' }
  ];

  const items = anomalies && anomalies.length > 0 ? anomalies.map(a => ({
    time: a.timestamp || '14:02 UTC',
    source: a.metric.includes('temp') ? 'Machine 3' : (a.metric.includes('vibration') ? 'Conv. B' : 'Machine 1'),
    desc: a.description || `${a.metric} anomaly detected`,
    severity: a.status === 'CRITICAL_ANOMALY' ? 'High' : (a.status === 'WARNING' ? 'Med' : 'Low')
  })) : defaultFeed;

  return (
    <div className="industrial-card">
      <div className="card-title">
        <span>ANOMALY FEED <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Chronological)</span></span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Chronological)</span>
      </div>

      <div className="table-container">
        <table className="industrial-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Source</th>
              <th>Description</th>
              <th>Severity | Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <tr key={i}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{row.time}</td>
                <td style={{ fontWeight: 600 }}>{row.source}</td>
                <td>{row.desc}</td>
                <td>
                  <span className={`badge ${
                    row.severity === 'High' ? 'badge-high' : (row.severity === 'Med' ? 'badge-med' : 'badge-low')
                  }`}>
                    {row.severity}
                  </span>
                  <span className="cite"> [cite: 1]</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
