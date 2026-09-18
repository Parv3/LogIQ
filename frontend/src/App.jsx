import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ScenarioSelector from './components/ScenarioSelector';
import KpiCards from './components/KpiCards';
import SafetyBanner from './components/SafetyBanner';
import AnomalySection from './components/AnomalySection';
import EvidenceTable from './components/EvidenceTable';
import MultiShiftView from './components/MultiShiftView';
import ReportView from './components/ReportView';
import { Activity, Database, FileText, RefreshCw, Play, Code } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function App() {
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [llmProvider, setLlmProvider] = useState('Gemini 2.5');
  const [scenarios, setScenarios] = useState([]);
  const [activeScenarioId, setActiveScenarioId] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const [currentPayload, setCurrentPayload] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [reportResponse, setReportResponse] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check health and load scenarios on mount
  useEffect(() => {
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
        // Automatically generate report
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
          setActiveTab('dashboard');
        }
      }
    } catch (err) {
      console.error("Carry forward error:", err);
    }
  };

  useEffect(() => {
    if (scenarios.length > 0) {
      // Load comparison data across all scenarios
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
      <Header isApiOnline={isApiOnline} llmProvider={llmProvider} />

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
        <div className="glass-panel" style={{ padding: '0.85rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="tabs-header" style={{ border: 'none', padding: 0, margin: 0 }}>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                <Activity size={16} />
                <span>Shift Dashboard & Anomalies</span>
              </button>

              <button
                onClick={() => setActiveTab('evidence')}
                className={`tab-btn ${activeTab === 'evidence' ? 'active' : ''}`}
              >
                <Database size={16} />
                <span>Evidence Table</span>
              </button>

              <button
                onClick={() => setActiveTab('report')}
                className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
              >
                <FileText size={16} />
                <span>Handover Report & Audit</span>
              </button>

              <button
                onClick={() => setActiveTab('multishift')}
                className={`tab-btn ${activeTab === 'multishift' ? 'active' : ''}`}
              >
                <RefreshCw size={16} />
                <span>Multi-Shift Carry & Compare</span>
              </button>
            </div>

            <button
              onClick={() => currentPayload && generateReport(currentPayload)}
              className="btn btn-primary"
            >
              <Play size={14} />
              <span>Regenerate Handover Report</span>
            </button>
          </div>
        </div>

        {/* Tab View Contents */}
        {activeTab === 'dashboard' && processedData && (
          <AnomalySection
            anomalies={processedData.anomalies}
            correlations={processedData.correlations}
          />
        )}

        {activeTab === 'evidence' && processedData && (
          <EvidenceTable evidence={processedData.evidence_table} />
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
      </main>
    </div>
  );
}
