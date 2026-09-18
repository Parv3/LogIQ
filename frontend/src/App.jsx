import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ScenarioSelector from './components/ScenarioSelector';
import KpiCards from './components/KpiCards';
import SafetyBanner from './components/SafetyBanner';
import SensorChart from './components/SensorChart';
import EvidenceTable from './components/EvidenceTable';
import HypothesisCards from './components/HypothesisCards';
import ShiftSignOff from './components/ShiftSignOff';
import MultiShiftView from './components/MultiShiftView';
import ReportView from './components/ReportView';
import FaqSection from './components/FaqSection';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';
import DataPolicyModal from './components/DataPolicyModal';
import TermsAndConditions from './components/TermsAndConditions';

const API_BASE = 'http://localhost:8000/api';

export default function App() {
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [activeScenarioId, setActiveScenarioId] = useState('');
  const [activeTab, setActiveTab] = useState('briefing');

  const [currentPayload, setCurrentPayload] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [reportResponse, setReportResponse] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
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
      if (res.ok) {
        setIsApiOnline(true);
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ScrollProgress />

      <Header
        isApiOnline={isApiOnline}
        shiftId={currentPayload?.shift_id}
        lineId={currentPayload?.line_id}
      />

      <main className="dashboard-container">
        {/* Scenario Loader Control Bar */}
        <ScenarioSelector
          scenarios={scenarios}
          activeScenarioId={activeScenarioId}
          onSelectScenario={loadScenario}
          onFileUpload={handleCustomFileUpload}
        />

        {/* Safety Critical Alert Banner (Unsuppressed) */}
        {processedData && (
          <SafetyBanner
            safetyAlarms={processedData.safety_alarms}
            mandatoryMaintenance={processedData.mandatory_maintenance}
          />
        )}

        {/* Deterministic Horizontal KPI Strip */}
        <KpiCards kpis={processedData?.kpis} />

        {/* Workspace Mode Bar */}
        <div className="industrial-card no-print" style={{ padding: '0.5rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                onClick={() => setActiveTab('briefing')}
                className={`btn ${activeTab === 'briefing' ? 'btn-primary' : ''}`}
              >
                Shift Briefing & Evidence
              </button>

              <button
                onClick={() => setActiveTab('hypotheses')}
                className={`btn ${activeTab === 'hypotheses' ? 'btn-primary' : ''}`}
              >
                Hypothesis Checklist
              </button>

              <button
                onClick={() => setActiveTab('signoff')}
                className={`btn ${activeTab === 'signoff' ? 'btn-primary' : ''}`}
              >
                Shift Sign-Off Log
              </button>

              <button
                onClick={() => setActiveTab('multishift')}
                className={`btn ${activeTab === 'multishift' ? 'btn-primary' : ''}`}
              >
                24H Multi-Shift Timeline
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.75rem' }}>
              <button onClick={() => setIsPrivacyOpen(true)} className="btn" style={{ padding: '0.25rem 0.5rem' }}>
                Privacy Policy
              </button>
              <button onClick={() => setIsTermsOpen(true)} className="btn" style={{ padding: '0.25rem 0.5rem' }}>
                Terms & Conditions
              </button>
            </div>
          </div>
        </div>

        {/* Streamlined Workspace Views */}
        {activeTab === 'briefing' && (
          <div className="workspace-grid">
            <ReportView reportResponse={reportResponse} isLoading={isLoading} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {processedData && <EvidenceTable evidence={processedData.evidence_table} />}
              <SensorChart sensorReadings={currentPayload?.sensor_readings} />
            </div>
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

        {activeTab === 'multishift' && (
          <MultiShiftView
            scenarios={scenarios}
            onCarryForward={handleCarryForward}
            comparisonData={comparisonData}
          />
        )}

        {/* Native Accordion FAQ Section */}
        <FaqSection />
      </main>

      <BackToTop />

      <DataPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <TermsAndConditions isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}
