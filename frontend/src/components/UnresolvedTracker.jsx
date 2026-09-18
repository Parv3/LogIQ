import React, { useState } from 'react';

export default function UnresolvedTracker({ unresolvedNotes }) {
  const [status, setStatus] = useState('carry_forward'); // 'resolved' or 'carry_forward'

  return (
    <div className="industrial-card">
      <div className="card-title">
        <span>UNRESOLVED ISSUES TRACKER</span>
      </div>

      <div className="checklist-item" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <input type="checkbox" style={{ cursor: 'pointer' }} />
          <span className="cite">[cite: 1]</span>
          <span style={{ fontWeight: 600 }}>Conveyor Belt A (Noise reported)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="unresolved_action"
              checked={status === 'resolved'}
              onChange={() => setStatus('resolved')}
            />
            <span><span className="cite">[cite: 1]</span> Resolved</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="unresolved_action"
              checked={status === 'carry_forward'}
              onChange={() => setStatus('carry_forward')}
            />
            <span><span className="cite">[cite: 1]</span> Carry Forward</span>
          </label>
        </div>
      </div>
    </div>
  );
}
