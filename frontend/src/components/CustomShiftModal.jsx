import React, { useState } from 'react';
import { X, PlusCircle, CheckCircle, Sliders, AlertTriangle } from 'lucide-react';

export default function CustomShiftModal({ isOpen, onClose, onSaveShift }) {
  const [shiftId, setShiftId] = useState(`SH-${Math.floor(100 + Math.random() * 900)}`);
  const [lineId, setLineId] = useState('Line 3 - Assembly & Packaging');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetUnits, setTargetUnits] = useState(500);
  const [actualUnits, setActualUnits] = useState(410);
  const [downtimeMins, setDowntimeMins] = useState(75);
  const [scrapCount, setScrapCount] = useState(14);
  const [operatorNotes, setOperatorNotes] = useState('Line speed degraded after lunch break due to feeder jam.');
  const [hasAlarm, setHasAlarm] = useState(true);
  const [alarmDesc, setAlarmDesc] = useState('ALM-804: Conveyor Belt Speed Below Minimum Limit');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const newShiftPayload = {
      shift_id: shiftId || `SH-${Date.now().toString().slice(-4)}`,
      line_id: lineId,
      date: date,
      shift_type: "Shift B (Evening 14:00 - 22:00)",
      target_units: Number(targetUnits) || 500,
      actual_units: Number(actualUnits) || 400,
      planned_downtime_minutes: 15.0,
      unplanned_downtime_minutes: Number(downtimeMins) || 30.0,
      scrap_count: Number(scrapCount) || 10,
      total_inspected: (Number(actualUnits) || 400) + (Number(scrapCount) || 10),
      operating_time_minutes: 480.0,
      sensor_readings: [
        { metric: "Gearbox Oil Temp", timestamp: "16:30", value: 92.4, unit: "°C" },
        { metric: "Bearing Vibration", timestamp: "17:15", value: 3.8, unit: "mm/s" },
        { metric: "Hydraulic Line Pressure", timestamp: "18:00", value: 2080.0, unit: "PSI" }
      ],
      alarms: hasAlarm ? [
        { alarm_id: "ALM-CUSTOM-01", description: alarmDesc, timestamp: "16:45", severity: "HIGH" }
      ] : [],
      mandatory_maintenance: [
        { task_id: "MNT-202", component: "Conveyor Roller", description: "Inspect tensioner bearing assembly", status: "PENDING_SIGN_OFF" }
      ],
      operator_notes: operatorNotes ? [operatorNotes] : []
    };

    onSaveShift(newShiftPayload);
    onClose();
  };

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
          maxWidth: '520px',
          padding: '1.5rem',
          boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
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
            <Sliders size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Custom Shift Log Builder
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Input plant parameters & simulate operational metrics
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-grid-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                SHIFT ID
              </label>
              <input
                type="text"
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.825rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                DATE
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.825rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              PRODUCTION LINE IDENTIFIER
            </label>
            <input
              type="text"
              value={lineId}
              onChange={(e) => setLineId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.55rem',
                background: 'var(--bg-main)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                fontSize: '0.825rem'
              }}
            />
          </div>

          <div className="form-grid-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                TARGET UNITS
              </label>
              <input
                type="number"
                value={targetUnits}
                onChange={(e) => setTargetUnits(e.target.value)}
                required
                min={1}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.825rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                ACTUAL PRODUCED UNITS
              </label>
              <input
                type="number"
                value={actualUnits}
                onChange={(e) => setActualUnits(e.target.value)}
                required
                min={0}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.825rem'
                }}
              />
            </div>
          </div>

          <div className="form-grid-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                UNPLANNED DOWNTIME (MINS)
              </label>
              <input
                type="number"
                value={downtimeMins}
                onChange={(e) => setDowntimeMins(e.target.value)}
                required
                min={0}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.825rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                SCRAP COUNT (UNITS)
              </label>
              <input
                type="number"
                value={scrapCount}
                onChange={(e) => setScrapCount(e.target.value)}
                required
                min={0}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.825rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              ACTIVE CRITICAL SAFETY ALARM (OPTIONAL)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                checked={hasAlarm}
                onChange={(e) => setHasAlarm(e.target.checked)}
                id="alarmCheck"
              />
              <label htmlFor="alarmCheck" style={{ fontSize: '0.8rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                Flag Critical Safety Interlock Alarm
              </label>
            </div>
            {hasAlarm && (
              <input
                type="text"
                value={alarmDesc}
                onChange={(e) => setAlarmDesc(e.target.value)}
                placeholder="Alarm description..."
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.825rem'
                }}
              />
            )}
          </div>

          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              SHIFT OPERATOR NOTES
            </label>
            <textarea
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: '0.55rem',
                background: 'var(--bg-main)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                fontSize: '0.825rem',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.65rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              marginTop: '0.5rem'
            }}
          >
            <PlusCircle size={16} />
            <span>Generate & Save Shift Data</span>
          </button>
        </form>
      </div>
    </div>
  );
}
