import React from 'react';
import { X, History, ArrowRight, Trash2, ShieldCheck, Activity } from 'lucide-react';

export default function ShiftHistoryModal({ isOpen, onClose, historyList, onLoadShift, onClearHistory }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(6px)',
      zIndex: 100000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div 
        className="industrial-card"
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: '1.5rem',
          boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          position: 'relative',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <button
          onClick={onClose}
          className="btn btn-secondary"
          style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.25rem 0.5rem' }}
        >
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            background: 'rgba(2, 132, 199, 0.15)',
            color: 'var(--accent-blue)',
            padding: '0.5rem',
            borderRadius: 'var(--radius)',
            display: 'flex'
          }}>
            <History size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Multi-Shift Log Archive & History
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Historical shift comparisons & production audit logs ({historyList?.length || 0} recorded)
            </div>
          </div>
        </div>

        {historyList && historyList.length > 0 ? (
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
            <div className="table-container">
              <table className="industrial-table">
                <thead>
                  <tr>
                    <th>SHIFT ID</th>
                    <th>DATE</th>
                    <th>PRODUCED / TARGET</th>
                    <th>DOWNTIME</th>
                    <th>SAFETY ALARMS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {historyList.map((item, idx) => {
                    const payload = item.payload;
                    const kpis = item.kpis;
                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          {payload.shift_id}
                        </td>
                        <td style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                          {payload.date || '2026-09-18'}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>
                          <strong>{payload.actual_units}</strong> / {payload.target_units}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>
                          {kpis?.total_downtime_minutes || payload.unplanned_downtime_minutes || 0} mins
                        </td>
                        <td>
                          {(payload.alarms && payload.alarms.length > 0) ? (
                            <span className="badge badge-high" style={{ fontSize: '0.65rem' }}>
                              {payload.alarms.length} ACTIVE
                            </span>
                          ) : (
                            <span className="badge badge-low" style={{ fontSize: '0.65rem' }}>
                              0 ALARMS
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              onLoadShift(payload);
                              onClose();
                            }}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', gap: '0.3rem' }}
                          >
                            <span>Load</span>
                            <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius)',
            marginBottom: '1rem'
          }}>
            <Activity size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
            <div>No saved shift history records found.</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Load different scenarios or create a custom shift log to populate historical audit records.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={onClearHistory}
            className="btn btn-secondary"
            disabled={!historyList || historyList.length === 0}
            style={{ fontSize: '0.725rem', color: '#F87171' }}
          >
            <Trash2 size={13} color="#F87171" />
            <span>Clear History Archive</span>
          </button>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}
          >
            Close Archive Window
          </button>
        </div>
      </div>
    </div>
  );
}
