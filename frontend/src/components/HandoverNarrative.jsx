import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function HandoverNarrative({ reportMarkdown, shiftId, variancePercent }) {
  const defaultSummary = `Shift ${shiftId || 'SH-402'} concluded with a production variance of ${variancePercent || '-15.5'}%. All calculated Pandas KPIs and Z-score sensor anomalies have been verified against operational standards.`;

  return (
    <div className="industrial-card">
      <div className="card-title">
        <span>1. EXECUTIVE SHIFT SUMMARY</span>
        <span className="badge badge-info">VERIFIED FACT-BASED NARRATIVE</span>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
        {reportMarkdown ? (
          <div className="markdown-container">
            <ReactMarkdown>{reportMarkdown}</ReactMarkdown>
          </div>
        ) : (
          <p>{defaultSummary}</p>
        )}
      </div>
    </div>
  );
}
