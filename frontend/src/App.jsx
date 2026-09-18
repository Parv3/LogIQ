import React, { useState, useEffect } from 'react';
import HeaderBar from './components/HeaderBar';
import KpiScorecard from './components/KpiScorecard';
import AnomalyFeed from './components/AnomalyFeed';
import PriorityZeroBanner from './components/PriorityZeroBanner';
import HandoverNarrative from './components/HandoverNarrative';
import EvidenceAnomalyTable from './components/EvidenceAnomalyTable';
import RankedInvestigationChecklist from './components/RankedInvestigationChecklist';
import UnresolvedTracker from './components/UnresolvedTracker';
import FooterBar from './components/FooterBar';
import DataPolicyModal from './components/DataPolicyModal';
import TermsAndConditions from './components/TermsAndConditions';
import ShiftChatbot from './components/ShiftChatbot';

const API_BASE = 'http://localhost:8000/api';

export default function App() {
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [activeScenarioId, setActiveScenarioId] = useState('shift_gearbox_overheat');

  const [currentPayload, setCurrentPayload] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [reportResponse, setReportResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  useEffect(() => {
    fetchHealth();
    fetchScenarios();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) setIsApiOnline(true);
    } catch (err) {
      setIsApiOnline(false);
    }
  };

  const fetchScenarios = async () => {
    try {
      const res = await fetch(`${API_BASE}/scenarios`);
      if (res.ok) {
        const list = await res.json();
        setScenarios(list);
        if (list.length > 0) {
          loadScenario(list[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load scenarios:", err);
    }
  };

  const loadScenario = async (scenarioId) => {
    setActiveScenarioId(scenarioId);
    try {
      const res = await fetch(`${API_BASE}/scenario/${scenarioId}`);
      if (res.ok) {
        const payload = await res.json();
        setCurrentPayload(payload);
        processShiftData(payload);
      }
    } catch (err) {
      console.error("Error fetching scenario:", err);
    }
  };

  const processShiftData = async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/process-shift`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setProcessedData(data);
        generateReport(payload);
      }
    } catch (err) {
      console.error("Error processing shift data:", err);
    }
  };

  const generateReport = async (payload) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setReportResponse(data);
      }
    } catch (err) {
      console.error("Error generating report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomFileUpload = (jsonPayload) => {
    setCurrentPayload(jsonPayload);
    setActiveScenarioId('custom_upload');
    processShiftData(jsonPayload);
  };

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <HeaderBar
        shiftId={currentPayload?.shift_id || 'SH-402'}
        date={currentPayload?.date || '18 SEP 2026'}
        operatorName="P. Mishra"
        onFileUpload={handleCustomFileUpload}
        onExportPdf={handleExportPdf}
        isApiOnline={isApiOnline}
      />

      <main className="main-layout">
        {/* Left Column (35% width): KPI Scorecard + Anomaly Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <KpiScorecard kpis={processedData?.kpis} />
          <AnomalyFeed anomalies={processedData?.anomalies} />
        </div>

        {/* Right Column (65% width): Priority Banner + Handover Narrative + Evidence Table + Checklist + Tracker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <PriorityZeroBanner
            safetyAlarms={processedData?.safety_alarms}
            maintenanceTasks={processedData?.mandatory_maintenance}
          />

          <HandoverNarrative
            reportMarkdown={reportResponse?.report_markdown}
            shiftId={currentPayload?.shift_id}
            variancePercent={processedData?.kpis?.variance_percent}
          />

          <EvidenceAnomalyTable evidenceTable={processedData?.evidence_table} />

          <RankedInvestigationChecklist anomalies={processedData?.anomalies} />

          <UnresolvedTracker unresolvedNotes={processedData?.unresolved_notes} />
        </div>
      </main>

      <FooterBar
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
      />

      <DataPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <TermsAndConditions isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />

      {/* Floating Operational AI Chatbot */}
      <ShiftChatbot
        activeShiftId={currentPayload?.shift_id}
        processedData={processedData}
      />
    </div>
  );
}
