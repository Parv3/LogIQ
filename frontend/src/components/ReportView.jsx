import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Download, Check, FileText, Printer } from 'lucide-react';
import GuardrailBadge from './GuardrailBadge';

export default function ReportView({ reportResponse, isLoading }) {
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--accent-cyan)' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          ⚙️ Processing Operational Narrative & Auditing Guardrails...
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Computing Pandas metrics, checking Z-score anomalies, and enforcing zero-suppression rules.
        </div>
      </div>
    );
  }

  if (!reportResponse) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
        Click <strong>"Generate Shift Handover Report"</strong> to compile the briefing.
      </div>
    );
  }

  const { report_markdown, guardrail_audit } = reportResponse;

  const handleCopy = () => {
    navigator.clipboard.writeText(report_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('report-export-area');
    if (element && window.html2pdf) {
      const opt = {
        margin: 0.5,
        filename: `LogIQ_Shift_Report_${reportResponse.shift_id}.pdf`,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top Action Toolbar & Guardrail Audit */}
      <GuardrailBadge audit={guardrail_audit} />

      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
          <FileText size={18} color="var(--accent-cyan)" />
          <span>Structured Handover Briefing & Operational Narrative</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleCopy} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            {copied ? <Check size={14} color="var(--status-success)" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
          </button>

          <button onClick={handleDownloadPdf} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <Download size={14} />
            <span>Export Report PDF</span>
          </button>
        </div>
      </div>

      {/* Rendered Markdown Document */}
      <div className="glass-panel" id="report-export-area" style={{ padding: '2rem' }}>
        <div className="markdown-container">
          <ReactMarkdown>{report_markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
