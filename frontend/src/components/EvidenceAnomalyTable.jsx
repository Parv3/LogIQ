import React from 'react';

export default function EvidenceAnomalyTable({ evidenceTable }) {
  const defaultRows = [
    { time: '14:02 UTC', source: 'Machine 3', desc: 'Temperature Spike (Active)', severity: 'High' }
  ];

  const rows = evidenceTable && evidenceTable.length > 0 ? evidenceTable.map(e => ({
    time: '14:02 UTC',
    source: e.metric_or_alarm || 'Machine 3',
    desc: e.evidence_proof || 'Temperature Spike (Active)',
    severity: e.category.includes('SAFETY') ? 'High' : 'Med'
  })) : defaultRows;

  return (
    <div className="industrial-card">
      <div className="card-title">
        <span>EVIDENCE & ANOMALY TABLE</span>
      </div>

      <div className="table-container">
        <table className="industrial-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Source</th>
              <th>Description</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{row.time}</td>
                <td style={{ fontWeight: 600 }}>{row.source}</td>
                <td>{row.desc}</td>
                <td>
                  <span className={`badge ${row.severity === 'High' ? 'badge-high' : 'badge-med'}`}>
                    {row.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
