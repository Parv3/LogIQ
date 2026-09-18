import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

export default function DataPolicyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div className="industrial-card" style={{ maxWidth: '650px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <ShieldCheck size={18} color="var(--accent-blue)" />
            <span>Plant Telemetry & Data Policy - LogIQ</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', lineHeight: 1.6 }}>
          <p><strong>Effective Date: September 2026</strong></p>
          <p>
            LogIQ operates under strict manufacturing data protection standards. Shift data payloads, machine alarms, and operator notes processed by LogIQ are handled in-memory and governed by deterministic rules.
          </p>
          <h4 style={{ color: 'var(--text-primary)' }}>1. Deterministic Rule Enforcement</h4>
          <p>
            All KPI calculations are executed via Python analytics. The narrative generation layer is strictly prohibited from altering or emitting unverified digits.
          </p>
          <h4 style={{ color: 'var(--text-primary)' }}>2. Zero Safety Suppression</h4>
          <p>
            Critical safety alarms and mandatory maintenance actions cannot be suppressed, hidden, or omitted by automated rules.
          </p>
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-primary">Close Data Policy</button>
        </div>
      </div>
    </div>
  );
}
