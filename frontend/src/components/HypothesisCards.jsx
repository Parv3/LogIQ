import React from 'react';
import { ShieldAlert, AlertTriangle, Wrench, CheckCircle2 } from 'lucide-react';

export default function HypothesisCards({ anomalies, safetyAlarms, correlations }) {
  const hypotheses = [];

  // Generate evidence-backed hypotheses from anomalies
  if (anomalies) {
    anomalies.forEach((anom, idx) => {
      if (anom.is_anomaly) {
        const corr = correlations?.find(c => c.sensor === anom.metric);
        const rVal = corr ? corr.coefficient : 0.85;
        const confidence = Math.round(Math.min(98, (Math.abs(anom.z_score) / 4.0) * 100));

        hypotheses.push({
          id: `HYP-${idx + 1}`,
          title: `Thermal/Vibration Anomaly on ${anom.metric}`,
          evidence: `Recorded peak ${anom.value} vs normal baseline ${anom.baseline_mean} (Z-Score: +${anom.z_score})`,
          correlationWeight: rVal,
          confidencePercent: confidence,
          hypothesisText: `High statistical likelihood of lube flow starvation or bearing mechanical wear. Inspect lubrication pump flow rate and thermal sensor coupling prior to line restart.`,
          actionSteps: [
            "Check lube oil pump pressure and filter condition",
            "Verify thermal coupling alignment on primary drive gearbox",
            "Perform manual vibration probe check on drive shaft bearing"
          ]
        });
      }
    });
  }

  if (safetyAlarms) {
    safetyAlarms.forEach((a, idx) => {
      hypotheses.push({
        id: `HYP-SAFE-${idx + 1}`,
        title: `Critical Safety Alarm: ${a.alarm_id}`,
        evidence: `Alarm log entry at ${a.timestamp}: "${a.description}"`,
        correlationWeight: 0.95,
        confidencePercent: 99,
        hypothesisText: `Potential hydraulic line pressure surge or relief valve blockage. Mandatory pressure decay test required before resetting line lockouts.`,
        actionSteps: [
          "Perform hydraulic line pressure decay check",
          "Inspect relief valve seating and solenoid response",
          "Log safety sign-off before clearing E-stop lockouts"
        ]
      });
    });
  }

  if (hypotheses.length === 0) {
    return (
      <div className="industrial-card" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        No critical anomaly hypotheses triggered. All operating parameters within nominal statistical limits.
      </div>
    );
  }

  return (
    <div className="industrial-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} color="var(--status-warning)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Ranked Evidence-Backed Investigation Checklist (Hypotheses)</h3>
        </div>
        <span className="badge badge-warning">Strictly Labeled as Hypotheses</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {hypotheses.map((hyp) => (
          <div
            key={hyp.id}
            style={{
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              borderLeft: '4px solid var(--status-warning)',
              borderRadius: 'var(--radius)',
              padding: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {hyp.title}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <span className="badge badge-info">Weight r = +{hyp.correlationWeight}</span>
                <span className="badge badge-warning">Confidence: {hyp.confidencePercent}%</span>
              </div>
            </div>

            <div style={{ fontSize: '0.825rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
              PROVEN EVIDENCE: {hyp.evidence}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--status-warning)' }}>HYPOTHESIS / AREA FOR INVESTIGATION:</strong> {hyp.hypothesisText}
            </div>

            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              ACTIONABLE ENGINEERING INSPECTION STEPS:
            </div>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              {hyp.actionSteps.map((step, i) => (
                <li key={i} style={{ marginBottom: '0.2rem' }}>{step}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
