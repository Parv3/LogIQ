import React, { useState } from 'react';
import { ShieldCheck, CheckSquare, PenTool, Award } from 'lucide-react';

export default function ShiftSignOff({ shiftId, lineId }) {
  const [outgoingLead, setOutgoingLead] = useState('M. Chen (Shift Lead)');
  const [incomingLead, setIncomingLead] = useState('D. Kumar (Incoming Lead)');
  const [checklist, setChecklist] = useState({
    kpiVerified: true,
    safetyChecked: true,
    unresolvedReviewed: true,
    maintenanceDelegated: true
  });
  const [signedOff, setSignedOff] = useState(false);

  const handleToggle = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(Boolean);

  const handleSignOff = (e) => {
    e.preventDefault();
    if (allChecked && outgoingLead && incomingLead) {
      setSignedOff(true);
    } else {
      alert("Please complete all verification items before signing off.");
    }
  };

  return (
    <div className="industrial-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="var(--status-success)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Shift Transfer & Verification Sign-Off Log</h3>
        </div>
        {signedOff ? (
          <span className="badge badge-success" style={{ gap: '0.4rem', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
            <Award size={14} />
            <span>TRANSFERRED & VERIFIED</span>
          </span>
        ) : (
          <span className="badge badge-warning">Pending Handover Verification</span>
        )}
      </div>

      {signedOff ? (
        <div style={{ background: 'rgba(5, 150, 105, 0.08)', border: '1px solid var(--status-success)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--status-success)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
            ✓ OFFICIAL SHIFT HANDOVER TRANSFER COMPLETE
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>Outgoing Shift Lead: <strong>{outgoingLead}</strong></div>
            <div>Incoming Shift Lead: <strong>{incomingLead}</strong></div>
            <div>Shift Reference: <strong>{shiftId} ({lineId})</strong></div>
            <div>Transfer Timestamp: <strong>{new Date().toLocaleString()}</strong></div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSignOff} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                OUTGOING SHIFT LEAD SIGNATURE
              </label>
              <input
                type="text"
                value={outgoingLead}
                onChange={(e) => setOutgoingLead(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-main)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                INCOMING SHIFT LEAD SIGNATURE
              </label>
              <input
                type="text"
                value={incomingLead}
                onChange={(e) => setIncomingLead(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-main)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}
              />
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            MANDATORY SHIFT HANDOVER INSPECTION CHECKLIST:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={checklist.kpiVerified} onChange={() => handleToggle('kpiVerified')} />
              <span>Verified Python/Pandas KPI calculations</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={checklist.safetyChecked} onChange={() => handleToggle('safetyChecked')} />
              <span>Inspected safety alarms & mandatory maintenance</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={checklist.unresolvedReviewed} onChange={() => handleToggle('unresolvedReviewed')} />
              <span>Reviewed unresolved operator log entries</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={checklist.maintenanceDelegated} onChange={() => handleToggle('maintenanceDelegated')} />
              <span>Delegated open tasks to incoming shift team</span>
            </label>
          </div>

          <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
            <button type="submit" disabled={!allChecked} className="btn btn-primary">
              <PenTool size={14} />
              <span>Sign Off & Transfer Shift</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
