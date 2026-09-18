import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ScenarioSelector from './components/ScenarioSelector';
import KpiCards from './components/KpiCards';
import SafetyBanner from './components/SafetyBanner';
import SensorChart from './components/SensorChart';
import CorrelationHeatmap from './components/CorrelationHeatmap';
import EvidenceTable from './components/EvidenceTable';
import HypothesisCards from './components/HypothesisCards';
import ShiftSignOff from './components/ShiftSignOff';
import MultiShiftView from './components/MultiShiftView';
import ReportView from './components/ReportView';
import FaqSection from './components/FaqSection';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';
import ConsentNotice from './components/ConsentNotice';
import FloatingContact from './components/FloatingContact';
import DataPolicyModal from './components/DataPolicyModal';
import TermsAndConditions from './components/TermsAndConditions';
import { initUtmTracker } from './utils/utmTracker';
import { Activity, Database, FileText, RefreshCw, Play, BarChart2, ShieldCheck, PenTool } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function App() {
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [llmProvider, setLlmProvider] = useState('Gemini 2.5');
  const [scenarios, setScenarios] = useState([]);
  const [activeScenarioId, setActiveScenarioId] = useState('');
  const [activeTab, setActiveTab] = useState('charts');
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPayload, setCurrentPayload] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [reportResponse, setReportResponse] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  useEffect(() => {
    initUtmTracker();
    fetchHealth();
    fetchScenarios();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        const data = await res.json();
        setIsApiOnline(true);
        if (data.llm_provider) setLlmProvider(data.llm_provider);
      }
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

  const handleCarryForward = async (sourceId, targetId) => {
    try {
      const resSource = await fetch(`${API_BASE}/scenario/${sourceId}`);
      const resTarget = await fetch(`${API_BASE}/scenario/${targetId}`);
      if (resSource.ok && resTarget.ok) {
        const payloadSource = await resSource.json();
        const payloadTarget = await resTarget.json();

        const carryRes = await fetch(`${API_BASE}/carry-forward`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ current_payload: payloadSource, next_payload: payloadTarget })
        });
        if (carryRes.ok) {
          const updatedNext = await carryRes.json();
          setCurrentPayload(updatedNext);
          processShiftData(updatedNext);
          setActiveTab('charts');
        }
      }
    } catch (err) {
      console.error("Carry forward error:", err);
    }
  };

  useEffect(() => {
    if (scenarios.length > 0) {
      Promise.all(scenarios.map(s => fetch(`${API_BASE}/scenario/${s.id}`).then(r => r.json())))
        .then(payloads => {
          fetch(`${API_BASE}/compare-shifts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloads)
          })
            .then(r => r.json())
            .then(comp => setComparisonData(comp));
        });
    }
  }, [scenarios]);

  const filteredEvidence = processedData?.evidence_table?.filter(e =>
    !searchQuery || e.evidence_proof.toLowerCase().includes(searchQuery.toLowerCase()) || e.metric_or_alarm.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ScrollProgress />

      <Header
        isApiOnline={isApiOnline}
        llmProvider={llmProvider}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
      />

      <main className="dashboard-container">
        {/* Scenario Loader Bar */}
        <ScenarioSelector
          scenarios={scenarios}
          activeScenarioId={activeScenarioId}
          onSelectScenario={loadScenario}
          onFileUpload={handleCustomFileUpload}
        />

        {/* Safety Critical Alert Banner */}
        {processedData && (
          <SafetyBanner
            safetyAlarms={processedData.safety_alarms}
            mandatoryMaintenance={processedData.mandatory_maintenance}
          />
        )}

        {/* Deterministic KPI Cards */}
        {processedData && <KpiCards kpis={processedData.kpis} />}

        {/* Action Controls & Navigation Tabs */}
        <div className="industrial-card no-print" style={{ padding: '0.75rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('charts')}
                className={`btn ${activeTab === 'charts' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <BarChart2 size={15} />
                <span>Sensor Charts & Heatmap</span>
              </button>

              <button
                onClick={() => setActiveTab('hypotheses')}
                className={`btn ${activeTab === 'hypotheses' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <ShieldCheck size={15} />
                <span>Hypothesis Checklist</span>
              </button>

              <button
                onClick={() => setActiveTab('signoff')}
                className={`btn ${activeTab === 'signoff' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <PenTool size={15} />
                <span>Shift Sign-Off</span>
              </button>

              <button
                onClick={() => setActiveTab('evidence')}
                className={`btn ${activeTab === 'evidence' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Database size={15} />
                <span>Evidence Table</span>
              </button>

              <button
                onClick={() => setActiveTab('report')}
                className={`btn ${activeTab === 'report' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <FileText size={15} />
                <span>Handover Briefing & Audit</span>
              </button>

              <button
                onClick={() => setActiveTab('multishift')}
                className={`btn ${activeTab === 'multishift' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <RefreshCw size={15} />
                <span>24H Multi-Shift Timeline</span>
              </button>
            </div>

            <button
              onClick={() => currentPayload && generateReport(currentPayload)}
              className="btn btn-primary"
            >
              <Play size={14} />
              <span>Re-run Handover Briefing</span>
            </button>
          </div>
        </div>

        {/* Tab View Contents */}
        {activeTab === 'charts' && processedData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <SensorChart sensorReadings={currentPayload?.sensor_readings} />
            <CorrelationHeatmap correlations={processedData.correlations} />
          </div>
        )}

        {activeTab === 'hypotheses' && processedData && (
          <HypothesisCards
            anomalies={processedData.anomalies}
            safetyAlarms={processedData.safety_alarms}
            correlations={processedData.correlations}
          />
        )}

        {activeTab === 'signoff' && currentPayload && (
          <ShiftSignOff shiftId={currentPayload.shift_id} lineId={currentPayload.line_id} />
        )}

        {activeTab === 'evidence' && processedData && (
          <EvidenceTable evidence={filteredEvidence} />
        )}

        {activeTab === 'report' && (
          <ReportView reportResponse={reportResponse} isLoading={isLoading} />
        )}

        {activeTab === 'multishift' && (
          <MultiShiftView
            scenarios={scenarios}
            onCarryForward={handleCarryForward}
            comparisonData={comparisonData}
          />
        )}

        {/* FAQ Section */}
        <FaqSection />
      </main>

      <BackToTop />
      <ConsentNotice />
      <FloatingContact />

      <DataPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <TermsAndConditions isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}
