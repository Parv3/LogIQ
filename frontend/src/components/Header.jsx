import React from 'react';
import { Activity, ShieldCheck, Cpu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import SiteSearch from './SiteSearch';

export default function Header({ isApiOnline, llmProvider, searchQuery, setSearchQuery, onOpenPrivacy, onOpenTerms }) {
  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '36px', height: '36px', background: 'var(--accent-blue)', color: '#fff',
          borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '1.2rem'
        }}>
          L
        </div>
        <div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            LogIQ Command Center
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Track 5 | Team G2 (Saksham Chaturvedi, Parv Mishra, Navya Mitta)
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }} className="no-print">
        <SiteSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <div className="badge badge-info" style={{ gap: '0.35rem' }}>
          <Cpu size={13} />
          <span>{llmProvider || 'Gemini 2.5 Engine'}</span>
        </div>

        <div className="badge badge-success" style={{ gap: '0.35rem' }}>
          <ShieldCheck size={13} />
          <span>Guardrails Active</span>
        </div>

        <div className={`badge ${isApiOnline ? 'badge-success' : 'badge-danger'}`} style={{ gap: '0.35rem' }}>
          <Activity size={13} />
          <span>{isApiOnline ? 'API Connected' : 'API Offline'}</span>
        </div>

        <ThemeToggle />

        <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.75rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.75rem' }}>
          <button onClick={onOpenPrivacy} className="btn btn-secondary" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}>
            Privacy
          </button>
          <button onClick={onOpenTerms} className="btn btn-secondary" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}>
            Terms
          </button>
        </div>
      </div>
    </header>
  );
}
