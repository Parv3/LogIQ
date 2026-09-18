import React from 'react';
import { AlertTriangle, ShieldAlert, Wrench } from 'lucide-react';

export default function SafetyBanner({ safetyAlarms, mandatoryMaintenance }) {
  const hasSafetyAlarms = safetyAlarms && safetyAlarms.length > 0;
  const hasMandatoryMaint = mandatoryMaintenance && mandatoryMaintenance.length > 0;

  if (!hasSafetyAlarms && !hasMandatoryMaint) {
    return (
      <div className="glass-panel" style={{ borderLeft: '4px solid var(--status-success)', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-success)', fontWeight: 600 }}>
          <span>✓ Safety & Maintenance Status: Nominal (No Active Critical Alarms)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="safety-banner">
      <ShieldAlert size={28} color="var(--status-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--status-danger)', letterSpacing: '0.03em' }}>
            🔴 MANDATORY SAFETY & MAINTENANCE BRIEFING (CANNOT BE SUPPRESSED)
          </h4>
          <span className="badge badge-danger">High Priority</span>
        </div>

        {hasSafetyAlarms && (
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FCA5A5', marginBottom: '0.25rem' }}>
              CRITICAL SAFETY ALARMS TRIGGERED ({safetyAlarms.length}):
            </div>
            {safetyAlarms.map((alarm, i) => (
              <div key={i} style={{ fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem 0.75rem', borderRadius: '4px', marginBottom: '0.25rem' }}>
                <strong>[{alarm.alarm_id}]</strong> {alarm.description} — <span style={{ color: 'var(--text-dim)' }}>Time: {alarm.timestamp}</span>
              </div>
            ))}
          </div>
        )}

        {hasMandatoryMaint && (
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FCD34D', marginBottom: '0.25rem' }}>
              UNRESOLVED MANDATORY MAINTENANCE ({mandatoryMaintenance.length}):
            </div>
            {mandatoryMaintenance.map((maint, i) => (
              <div key={i} style={{ fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem 0.75rem', borderRadius: '4px', marginBottom: '0.25rem' }}>
                <strong>[{maint.task_id}]</strong> Component: {maint.component} — {maint.description} (<span style={{ color: 'var(--status-warning)' }}>Status: {maint.status}</span>)
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
