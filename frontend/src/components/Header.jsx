import React from 'react';
import { Activity, ShieldCheck, Cpu, Terminal } from 'lucide-react';

export default function Header({ isApiOnline, llmProvider }) {
  return (
    <header className="app-header">
      <div className="brand-container">
        <div className="brand-logo">L</div>
        <div>
          <div className="brand-title">LogIQ</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Intelligent Shift Handover & Root-Cause Briefing
          </div>
        </div>
        <span className="team-tag">Team G2</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="badge badge-cyan" style={{ gap: '0.4rem' }}>
          <Cpu size={14} />
          <span>{llmProvider || 'Gemini 2.5 Engine'}</span>
        </div>

        <div className="badge badge-success" style={{ gap: '0.4rem' }}>
          <ShieldCheck size={14} />
          <span>Guardrails Active</span>
        </div>

        <div className={`badge ${isApiOnline ? 'badge-success' : 'badge-danger'}`} style={{ gap: '0.4rem' }}>
          <Activity size={14} />
          <span>{isApiOnline ? 'API Connected' : 'API Offline'}</span>
        </div>
      </div>
    </header>
  );
}
