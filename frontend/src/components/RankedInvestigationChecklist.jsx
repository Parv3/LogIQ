import React, { useState } from 'react';

export default function RankedInvestigationChecklist({ anomalies, safetyAlarms }) {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (idx) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const hypotheses = [];
  let idCounter = 1;

  if (anomalies) {
    anomalies.forEach((anom) => {
      if (anom.is_anomaly) {
        hypotheses.push({
          id: idCounter,
          text: `Investigate ${anom.metric} anomaly`,
          hypoth: 'Lube starvation or bearing mechanical wear',
          evidence: `Recorded ${anom.value} vs Normal ${anom.baseline_mean} (Z-Score: +${anom.z_score})`
        });
        idCounter++;
      }
    });
  }

  if (safetyAlarms) {
    safetyAlarms.forEach((a) => {
      hypotheses.push({
        id: idCounter,
        text: `Address Safety Alarm [${a.alarm_id}]`,
        hypoth: 'Hydraulic pressure surge or solenoid valve seating check',
        evidence: `Alarm log: ${a.description} at ${a.timestamp}`
      });
      idCounter++;
    });
  }

  if (hypotheses.length === 0) {
    hypotheses.push({
      id: 1,
      text: 'Routine Machine Inspection',
      hypoth: 'Standard preventive maintenance cycle',
      evidence: 'All metrics within nominal Z-score bounds'
    });
  }

  return (
    <div className="industrial-card">
      <div className="card-title">
        <span>4. RANKED INVESTIGATION CHECKLIST (HYPOTHESES)</span>
        <span className="badge badge-warning">STRICTLY LABELED HYPOTHESES</span>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
        [IMPORTANT] Operational Guardrail Note: The following items are explicitly labeled as <strong>Hypotheses</strong> for incoming shift investigation.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {hypotheses.map((item, i) => (
          <div key={i} className="checklist-item">
            <input
              type="checkbox"
              checked={!!checkedItems[i]}
              onChange={() => toggleCheck(i)}
              style={{ marginTop: '2px', cursor: 'pointer' }}
            />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{i + 1}. {item.text}</span>
              <span style={{ color: 'var(--text-secondary)' }}> | Hypoth: {item.hypoth} | Evidence: {item.evidence}</span>
              <span className="badge-hypothesis">[SYSTEM HYPOTHESIS]</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
