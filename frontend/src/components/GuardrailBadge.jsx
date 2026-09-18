import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function GuardrailBadge({ audit }) {
  if (!audit) return null;

  const rules = [
    { label: 'Fact-Based Only', passed: audit.fact_based_only },
    { label: 'Zero Math Recalculation', passed: audit.no_math_recalculated },
    { label: 'Hypotheses Tagged', passed: audit.hypotheses_tagged },
    { label: 'Safety Alarms Unsuppressed', passed: audit.safety_alarms_unsuppressed }
  ];

  return (
    <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="var(--status-success)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--status-success)' }}>
            OPERATIONAL GUARDRAILS AUDIT ({audit.passed ? 'PASSED 100%' : 'ATTENTION REQUIRED'})
          </span>
        </div>
        <span className={`badge ${audit.passed ? 'badge-success' : 'badge-danger'}`}>
          {audit.passed ? 'Verified Compliance' : 'Guardrail Issue'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {rules.map((r, i) => (
          <div
            key={i}
            className={`badge ${r.passed ? 'badge-success' : 'badge-danger'}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            {r.passed ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            <span>{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
