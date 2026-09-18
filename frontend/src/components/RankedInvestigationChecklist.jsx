import React, { useState } from 'react';

export default function RankedInvestigationChecklist({ anomalies }) {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (idx) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const defaultList = [
    { text: '1. Investigate Machine 3 (Temp Spike)', hypoth: 'Cooling fault', evidence: 'Log DT-402' },
    { text: '2. Check Conveyor B (Motor Load)', hypoth: 'Belt wear', evidence: 'Log MN-13:15' },
    { text: '3. Address Machine 1 (Low Output)', hypoth: 'Calib. error', evidence: 'Log PRD-1145' }
  ];

  return (
    <div className="industrial-card">
      <div className="card-title">
        <span>RANKED INVESTIGATION CHECKLIST</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {defaultList.map((item, i) => (
          <div key={i} className="checklist-item">
            <input
              type="checkbox"
              checked={!!checkedItems[i]}
              onChange={() => toggleCheck(i)}
              style={{ marginTop: '2px', cursor: 'pointer' }}
            />
            <div style={{ flex: 1 }}>
              <span className="cite">[cite: 1] </span>
              <span style={{ fontWeight: 600 }}>{item.text}<sup>1</sup></span>
              <span style={{ color: 'var(--text-muted)' }}> | Hypoth: {item.hypoth}<sup>1</sup> | Evidence: {item.evidence}</span>
              <span className="badge-hypothesis">[SYSTEM HYPOTHESIS]</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
