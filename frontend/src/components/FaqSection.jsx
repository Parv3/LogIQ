import React from 'react';

const FAQS = [
  {
    q: "How does LogIQ guarantee zero AI math hallucinations?",
    a: "All production KPIs (Target Variance, OEE, Scrap Rate, Downtime) are computed deterministically by Python/Pandas before narrative generation. The language model never emits or alters numbers."
  },
  {
    q: "What operational guardrails are enforced?",
    a: "1. Fact-based only. 2. Zero math recalculated. 3. Root causes explicitly labeled as Hypotheses (banning words like 'caused by' or 'due to'). 4. Zero safety alarm or mandatory maintenance suppression."
  },
  {
    q: "How is multi-shift carry forward handled?",
    a: "Open maintenance tasks, active safety alarms, and unresolved operator notes from Shift N are programmatically injected into Shift N+1 payload."
  }
];

export default function FaqSection() {
  return (
    <div className="industrial-card no-print" style={{ marginTop: '0.5rem' }}>
      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
        OPERATIONAL SYSTEM FAQs (NATIVE ACCORDION)
      </h3>

      {FAQS.map((faq, i) => (
        <details key={i} className="industrial-faq">
          <summary>
            <span>{faq.q}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>+</span>
          </summary>
          <div className="faq-content">{faq.a}</div>
        </details>
      ))}
    </div>
  );
}
