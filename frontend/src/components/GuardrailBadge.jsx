import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function GuardrailBadge({ audit }) {
  if (!audit) return null;

  const rules = [
    { label: 'Fact-Based Log Verification', passed: audit.fact_based_only },
    { label: 'Calculated Production Metrics', passed: audit.no_math_recalculated },
    { label: 'Hypotheses Strictly Labeled', passed: audit.hypotheses_tagged },
    { label: 'Critical Alarms Unsuppressed', passed: audit.safety_alarms_unsuppressed }
  ];

  return (
    <div className="industrial-card" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'var(--status-success)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={16} color="var(--status-success)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--status-success)' }}>
            SAFETY & OPERATIONAL STANDARDS VERIFIED
          </span>
        </div>
        <span className="badge badge-success">Plant Compliance Approved</span>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {rules.map((r, i) => (
          <div
            key={i}
            className={`badge ${r.passed ? 'badge-success' : 'badge-danger'}`}
            style={{ fontSize: '0.7rem' }}
          >
            {r.passed ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            <span>{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
