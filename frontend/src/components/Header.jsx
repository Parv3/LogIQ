import React from 'react';
import ThemeToggle from './ThemeToggle';

export default function Header({ isApiOnline, shiftId, lineId }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          background: 'var(--accent-blue)', color: '#fff', padding: '0.25rem 0.6rem',
          borderRadius: 'var(--radius)', fontWeight: 800, fontSize: '0.9rem', fontFamily: 'var(--font-mono)'
        }}>
          LogIQ
        </div>
        
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
            {lineId ? lineId.toUpperCase() : 'LINE 4 STATOR ASSEMBLY'}
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            Plant Shift Handover Terminal | {currentDate}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ textAlign: 'right', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          <div style={{ color: 'var(--text-muted)' }}>ACTIVE SHIFT</div>
          <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{shiftId || 'SH-20260918-A'}</div>
        </div>

        {/* Clean Plant Data Stream Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: isApiOnline ? 'var(--status-success)' : 'var(--status-warning)',
            display: 'inline-block'
          }} />
          <span style={{ color: isApiOnline ? 'var(--status-success)' : 'var(--status-warning)', fontWeight: 600 }}>
            {isApiOnline ? 'PLANT DATA: LIVE' : 'DATA: OFFLINE'}
          </span>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
