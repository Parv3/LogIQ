import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import SkeletonLoader from './SkeletonLoader';
import GuardrailBadge from './GuardrailBadge';

export default function ReportView({ reportResponse, isLoading }) {
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return <SkeletonLoader type="report" />;
  }

  if (!reportResponse) {
    return (
      <div className="industrial-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        Select a shift scenario above to load the operational handover report.
      </div>
    );
  }

  const { report_markdown, guardrail_audit } = reportResponse;

  const handleCopy = () => {
    navigator.clipboard.writeText(report_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('report-export-area');
    if (element && window.html2pdf) {
      const opt = {
        margin: 0.5,
        filename: `LogIQ_Shift_Briefing_${reportResponse.shift_id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      window.html2pdf().from(element).set(opt).save();
    } else {
      window.print();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <GuardrailBadge audit={guardrail_audit} />

      <div className="industrial-card no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
          OFFICIAL SHIFT HANDOVER REPORT
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleCopy} className="btn">
            {copied ? '✓ Copied' : 'Copy Briefing Text'}
          </button>

          <button onClick={handleDownloadPdf} className="btn btn-primary">
            Export Briefing PDF
          </button>
        </div>
      </div>

      <div className="industrial-card" id="report-export-area">
        <div className="markdown-container">
          <ReactMarkdown>{report_markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
