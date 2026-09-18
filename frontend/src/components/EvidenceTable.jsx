import React from 'react';
import { Database, FileText } from 'lucide-react';

export default function EvidenceTable({ evidence }) {
  if (!evidence || evidence.length === 0) {
    return (
      <div className="glass-panel" style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
        No evidence entries generated yet. Process shift data to inspect evidence mappings.
      </div>
    );
  }

  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Database size={18} color="var(--accent-cyan)" />
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Verified Evidence & Anomaly Mapping Table</h3>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Issue ID</th>
              <th>Category</th>
              <th>Metric / Alarm Ref</th>
              <th>Evidence Proof & Value</th>
              <th>Source Type</th>
            </tr>
          </thead>
          <tbody>
            {evidence.map((row, i) => (
              <tr key={i}>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  {row.issue_id}
                </td>
                <td>
                  <span className={`badge ${
                    row.category.includes('SAFETY') ? 'badge-danger' : 
                    row.category.includes('ANOMALY') ? 'badge-warning' : 'badge-cyan'
                  }`}>
                    {row.category}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                  {row.metric_or_alarm}
                </td>
                <td>{row.evidence_proof}</td>
                <td>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    [{row.source_type}]
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
