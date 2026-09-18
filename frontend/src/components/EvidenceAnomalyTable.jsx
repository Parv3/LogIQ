import React from 'react';

export default function EvidenceAnomalyTable({ evidenceTable }) {
  if (!evidenceTable || evidenceTable.length === 0) {
    return (
      <div className="industrial-card">
        <div className="card-title">
          <span>3. EVIDENCE & ANOMALY TABLE</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          No evidence items recorded. Nominal operation across all components.
        </div>
      </div>
    );
  }

  return (
    <div className="industrial-card">
      <div className="card-title">
        <span>3. EVIDENCE & ANOMALY TABLE</span>
        <span className="badge badge-info">{evidenceTable.length} Verified Entries</span>
      </div>

      <div className="table-container">
        <table className="industrial-table">
          <thead>
            <tr>
              <th>Issue ID</th>
              <th>Category</th>
              <th>Metric / Alarm</th>
              <th>Evidence & Proof</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {evidenceTable.map((row, i) => (
              <tr key={i}>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', fontWeight: 700 }}>
                  {row.issue_id}
                </td>
                <td>
                  <span className={`badge ${
                    row.category.includes('SAFETY') ? 'badge-high' : 
                    row.category.includes('ANOMALY') ? 'badge-med' : 'badge-low'
                  }`}>
                    {row.category}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {row.metric_or_alarm}
                </td>
                <td style={{ fontSize: '0.8rem' }}>{row.evidence_proof}</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.725rem' }}>
                  {row.source_type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
