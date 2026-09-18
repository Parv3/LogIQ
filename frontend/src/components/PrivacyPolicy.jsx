import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div className="industrial-card" style={{ maxWidth: '650px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <ShieldCheck size={18} color="var(--accent-blue)" />
            <span>Privacy Policy - LogIQ Industrial Data Protection</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', lineHeight: 1.6 }}>
          <p><strong>Effective Date: September 2026</strong></p>
          <p>
            LogIQ operates under strict industrial security protocols. All manufacturing shift metrics, sensor data, and operator notes processed by LogIQ remain strictly confidential and stored within authorized local session environments.
          </p>
          <h4 style={{ color: 'var(--text-primary)' }}>1. Data Collection & Usage</h4>
          <p>
            We process production numbers, machine alarm codes, and maintenance text logs solely to compute deterministic KPIs and generate shift handover briefings. No proprietary plant telemetry is shared with unauthorized external entities.
          </p>
          <h4 style={{ color: 'var(--text-primary)' }}>2. Model Guardrails & Data Retention</h4>
          <p>
            Shift data payloads sent to backend analytical services are evaluated in memory and discarded upon completion of the shift handover session.
          </p>
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-primary">Close Privacy Policy</button>
        </div>
      </div>
    </div>
  );
}
