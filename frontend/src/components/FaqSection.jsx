import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    question: "How does LogIQ ensure zero AI math hallucinations?",
    answer: "LogIQ runs a dual-layer architecture. All production KPIs (Target Variance, OEE, Scrap Rate %, Downtime totals) are calculated deterministically by Python/Pandas prior to any narrative generation. The language model is strictly prohibited from performing or recalculating math."
  },
  {
    question: "What are the 4 strict operational guardrails enforced by LogIQ?",
    answer: "1. Fact-Based Only (grounded 100% in payload data). 2. Zero Math Recalculation (using Python metrics directly). 3. Root Cause Hypotheses Tagging (strictly labeling causes as hypotheses). 4. Safety First (zero suppression of critical safety alarms or mandatory maintenance)."
  },
  {
    question: "How does multi-shift carry-forward work?",
    answer: "When transferring from Shift A to Shift B, open maintenance tasks, active safety alarms, and unresolved operator notes are automatically carried forward into Shift B's briefing payload."
  },
  {
    question: "How are Z-score statistical sensor anomalies detected?",
    answer: "Sensor time-series metrics (gearbox temp, hydraulic pressure, vibration) are evaluated using Z-score formula Z = (X - μ) / σ against expected industrial baselines. Values with |Z| >= 2.5 trigger anomaly flags."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="industrial-card no-print">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <HelpCircle size={18} color="var(--accent-blue)" />
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Frequently Asked Operational Questions (FAQs)</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {FAQS.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                background: 'var(--bg-main)',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => toggleFaq(i)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span>{faq.question}</span>
                {isOpen ? <ChevronUp size={16} color="var(--accent-blue)" /> : <ChevronDown size={16} />}
              </button>

              {isOpen && (
                <div style={{ padding: '0.75rem 1rem', fontSize: '0.825rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', lineHeight: 1.6 }}>
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
