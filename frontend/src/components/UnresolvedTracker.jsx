import React, { useState } from 'react';

export default function UnresolvedTracker({ unresolvedNotes }) {
  const [statuses, setStatuses] = useState({});

  const handleStatusChange = (idx, value) => {
    setStatuses(prev => ({ ...prev, [idx]: value }));
  };

  const notes = unresolvedNotes && unresolvedNotes.length > 0 ? unresolvedNotes : [
    { note_id: 'N-001', operator: 'J. Vance (Op-L4)', timestamp: '08:20', text: 'Noticed grinding whine coming from main gearbox drive.', category: 'Maintenance' },
    { note_id: 'N-002', operator: 'M. Chen (Lead)', timestamp: '10:00', text: 'Line tripped automatically following ALM-902.', category: 'Downtime' }
  ];

  return (
    <div className="industrial-card">
      <div className="card-title">
        <span>5. UNRESOLVED ISSUES TO TRACK</span>
        <span className="badge badge-info">CARRIED FORWARD TO SHIFT N+1</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {notes.map((note, i) => {
          const currentStatus = statuses[i] || 'carry_forward';
          return (
            <div key={i} className="checklist-item" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                <input type="checkbox" style={{ cursor: 'pointer' }} />
                <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                  [{note.operator} @ {note.timestamp}] ({note.category}): {note.text}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={`unresolved_${i}`}
                    checked={currentStatus === 'resolved'}
                    onChange={() => handleStatusChange(i, 'resolved')}
                  />
                  <span>Resolved</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={`unresolved_${i}`}
                    checked={currentStatus === 'carry_forward'}
                    onChange={() => handleStatusChange(i, 'carry_forward')}
                  />
                  <span>Carry Forward</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
