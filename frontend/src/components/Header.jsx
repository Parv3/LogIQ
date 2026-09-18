import React from 'react';
import ThemeToggle from './ThemeToggle';

export default function Header({ isApiOnline, shiftId, lineId }) {
  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          background: 'var(--accent-blue)', color: '#fff', padding: '0.2rem 0.5rem',
          borderRadius: 'var(--radius)', fontWeight: 800, fontSize: '0.9rem', fontFamily: 'var(--font-mono)'
        }}>
          LogIQ
        </div>
        
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {lineId ? lineId.toUpperCase() : 'MANUFACTURING CELL'}
        </div>

        <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          SHIFT: {shiftId || 'SH-ACTIVE'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Real-time Connectivity Status Dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: isApiOnline ? 'var(--status-success)' : 'var(--status-danger)',
            display: 'inline-block'
          }} />
          <span style={{ color: isApiOnline ? 'var(--status-success)' : 'var(--status-danger)', fontWeight: 600 }}>
            {isApiOnline ? 'PYTHON ENGINE: CONNECTED' : 'OFFLINE MODE'}
          </span>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
