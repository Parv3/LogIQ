import React from 'react';
import { X, FileText } from 'lucide-react';

export default function TermsAndConditions({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div className="industrial-card" style={{ maxWidth: '650px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <FileText size={18} color="var(--accent-blue)" />
            <span>Terms & Conditions - LogIQ Operational System</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', lineHeight: 1.6 }}>
          <p><strong>Track 5 Operational Terms</strong></p>
          <h4 style={{ color: 'var(--text-primary)' }}>1. Operational Guardrail Compliance</h4>
          <p>
            Users of LogIQ must recognize that generated root-cause statements represent operational <strong>Hypotheses</strong> for engineering investigation. All mandatory safety-critical machine alarms must be physically verified by qualified personnel.
          </p>
          <h4 style={{ color: 'var(--text-primary)' }}>2. Mathematical Accuracy Guarantee</h4>
          <p>
            All production numbers (OEE, Target Variance, Scrap Count) are computed deterministically via Python analytics. Users agree not to override calculated KPI values without technical audit.
          </p>
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-primary">Accept Terms</button>
        </div>
      </div>
    </div>
  );
}
