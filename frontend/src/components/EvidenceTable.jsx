import React, { useState } from 'react';

export default function EvidenceTable({ evidence }) {
  const [sortField, setSortField] = useState('issue_id');
  const [sortAsc, setSortAsc] = useState(true);

  if (!evidence || evidence.length === 0) {
    return (
      <div className="industrial-card" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        No evidence entries mapped for this shift payload.
      </div>
    );
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedData = [...evidence].sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="industrial-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          SECTION 3: VERIFIED EVIDENCE & ANOMALY TABLE
        </h3>
        <span className="badge badge-info">{evidence.length} Mapped Entries</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('issue_id')}>
                Issue ID {sortField === 'issue_id' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th className="sortable" onClick={() => handleSort('category')}>
                Category {sortField === 'category' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th className="sortable" onClick={() => handleSort('metric_or_alarm')}>
                Metric / Alarm {sortField === 'metric_or_alarm' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th className="sortable" onClick={() => handleSort('evidence_proof')}>
                Evidence Proof {sortField === 'evidence_proof' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th className="sortable" onClick={() => handleSort('source_type')}>
                Source {sortField === 'source_type' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, i) => (
              <tr key={i}>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', fontWeight: 600 }}>
                  {row.issue_id}
                </td>
                <td>
                  <span className={`badge ${
                    row.category.includes('SAFETY') ? 'badge-danger' : 
                    row.category.includes('ANOMALY') ? 'badge-warning' : 'badge-info'
                  }`}>
                    {row.category}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {row.metric_or_alarm}
                </td>
                <td style={{ fontSize: '0.8rem' }}>{row.evidence_proof}</td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
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
