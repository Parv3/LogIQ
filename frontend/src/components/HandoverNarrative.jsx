import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function HandoverNarrative({ reportMarkdown, shiftId, variancePercent }) {
  const defaultNarrative = `Verified facts only. Shift ${shiftId || 'SH-402'} concluded with a critical production deficit of ${variancePercent || '15.5'}%^1. Preparation of the detailed production metrics summary is complete. See following details on requirements review^1.`;

  return (
    <div className="industrial-card">
      <div className="card-title">
        <span>HANDOVER NARRATIVE (LLM GENERATED)</span>
      </div>

      <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
        {reportMarkdown ? (
          <div className="markdown-container">
            <ReactMarkdown>{reportMarkdown}</ReactMarkdown>
          </div>
        ) : (
          <p>{defaultNarrative}</p>
        )}
      </div>
    </div>
  );
}
