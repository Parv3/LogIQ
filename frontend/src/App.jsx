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
import LoginPage from './components/LoginPage';
import LiveTelemetryWidget from './components/LiveTelemetryWidget';
import CustomShiftModal from './components/CustomShiftModal';
import ShiftHistoryModal from './components/ShiftHistoryModal';
import { auth, onAuthStateChanged, signOut } from './firebase';
import { DEFAULT_PAYLOAD, processClientShift } from './data/defaultScenarios';
import { isEmailAuthorized } from './config/authorizedUsers';

const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:8000/api'
  : 'https://logiq-backend.onrender.com/api';

const DEFAULT_PROCESSED = processClientShift(DEFAULT_PAYLOAD);

export default function App() {
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [activeScenarioId, setActiveScenarioId] = useState('shift_gearbox_overheat');

  const [currentPayload, setCurrentPayload] = useState(DEFAULT_PAYLOAD);
  const [processedData, setProcessedData] = useState(DEFAULT_PROCESSED);
  const [reportResponse, setReportResponse] = useState({
    report_markdown: `During **Shift A (Morning 06:00 - 14:00)**, **Line 4 - Stator Assembly** produced **415 units** against a target of **500 units** (Variance: -85 units, -17%). Total shift downtime reached **100 minutes**, yielding an overall OEE of **71.2%**. Active critical safety alarm: \`ALM-902: Gearbox Overheat High Limit Exceeded (98.4°C)\`. Mandatory maintenance task \`MNT-108\` pending sign-off. Recommended **Hypotheses** for incoming shift investigation.`
  });
  const [isLoading, setIsLoading] = useState(false);

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCustomShiftOpen, setIsCustomShiftOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState('');

  const [shiftHistory, setShiftHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('LOGIQ_SHIFT_HISTORY');
      return saved ? JSON.parse(saved) : [
        { payload: DEFAULT_PAYLOAD, kpis: DEFAULT_PROCESSED.kpis, timestamp: new Date().toISOString() }
      ];
    } catch (e) {
      return [{ payload: DEFAULT_PAYLOAD, kpis: DEFAULT_PROCESSED.kpis, timestamp: new Date().toISOString() }];
    }
  });

  useEffect(() => {
    fetchHealth();
    fetchScenarios();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (isEmailAuthorized(user.email)) {
          setCurrentUser(user);
          setIsLoginOpen(false);
          setAuthError('');
        } else {
          console.warn(`Unauthorized login attempt by: ${user.email}`);
          await signOut(auth);
          setCurrentUser(null);
          setAuthError(`Access Denied: Account '${user.email}' is not on the authorized personnel list.`);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  const saveToHistoryArchive = (payload, kpis) => {
    setShiftHistory(prev => {
      const exists = prev.some(item => item.payload.shift_id === payload.shift_id);
      let updated;
      if (exists) {
        updated = prev.map(item => item.payload.shift_id === payload.shift_id ? { payload, kpis, timestamp: new Date().toISOString() } : item);
      } else {
        updated = [{ payload, kpis, timestamp: new Date().toISOString() }, ...prev];
      }
      try {
        localStorage.setItem('LOGIQ_SHIFT_HISTORY', JSON.stringify(updated.slice(0, 20)));
      } catch (e) {
        console.error("Failed to save shift history to localStorage", e);
      }
      return updated;
    });
  };

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
        saveToHistoryArchive(payload, data.kpis);
      } else {
        const clientData = processClientShift(payload);
        setProcessedData(clientData);
        saveToHistoryArchive(payload, clientData.kpis);
      }
    } catch (err) {
      console.error("Error processing shift data online, using client analytics engine:", err);
      const clientData = processClientShift(payload);
      setProcessedData(clientData);
      saveToHistoryArchive(payload, clientData.kpis);
    }
    
    // Always trigger narrative report update
    generateReport(payload);
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
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error("Error generating report online, generating client executive narrative:", err);
    }

    // Client-side dynamic markdown narrative generator fallback
    const target = payload.target_units || 500;
    const actual = payload.actual_units || 400;
    const variance_units = actual - target;
    const variance_percent = target > 0 ? ((variance_units / target) * 100).toFixed(1) : 0;

    const alarmDetail = payload.alarms && payload.alarms.length > 0 
      ? ` Active critical safety alarms: \`${payload.alarms.map(a => (a.alarm_id || 'ALM') + ': ' + (a.description || 'Alarm')).join('; ')}\`.` 
      : ' All safety interlocks and machine pressure boundaries operated within normal baseline limits.';

    const noteDetail = payload.operator_notes && payload.operator_notes.length > 0 
      ? ` Operator Observation: "${typeof payload.operator_notes[0] === 'string' ? payload.operator_notes[0] : (payload.operator_notes[0].text || '')}".` 
      : '';

    const fallbackMarkdown = `During **${payload.shift_type || 'Shift A'}**, **${payload.line_id || 'Line 1'}** produced **${actual} units** against a target of **${target} units** (Variance: \`${variance_units} units, ${variance_percent}%\`). Total unplanned downtime reached **${payload.unplanned_downtime_minutes || 0} minutes**, with **${payload.scrap_count || 0} scrap units** logged.${alarmDetail}${noteDetail} Recommended **Hypotheses** for incoming shift handover verification.`;

    setReportResponse({ report_markdown: fallbackMarkdown });
    setIsLoading(false);
  };

  const handleCustomFileUpload = (jsonPayload) => {
    setCurrentPayload(jsonPayload);
    setActiveScenarioId('custom_upload');
    processShiftData(jsonPayload);
  };

  const handleCustomShiftSave = (customPayload) => {
    setCurrentPayload(customPayload);
    setActiveScenarioId(customPayload.shift_id);
    processShiftData(customPayload);
  };

  const handleLoadShiftFromHistory = (historicalPayload) => {
    setCurrentPayload(historicalPayload);
    setActiveScenarioId(historicalPayload.shift_id);
    processShiftData(historicalPayload);
  };

  const handleClearHistory = () => {
    setShiftHistory([]);
    try {
      localStorage.removeItem('LOGIQ_SHIFT_HISTORY');
    } catch (e) {}
  };

  const handleExportPdf = () => {
    window.print();
  };

  // FORCED LOGIN GATE: Without login, no one can enter or view the dashboard
  if (authChecked && !currentUser) {
    return (
      <LoginPage
        isOpen={true}
        isForced={true}
        initialError={authError}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <HeaderBar
        shiftId={currentPayload?.shift_id || 'SH-402'}
        date={currentPayload?.date || '18 SEP 2026'}
        operatorName="P. Mishra"
        onFileUpload={handleCustomFileUpload}
        onExportPdf={handleExportPdf}
        isApiOnline={isApiOnline}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onSignOut={() => signOut(auth)}
        onOpenCustomShift={() => setIsCustomShiftOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      <main className="main-layout">
        {/* Left Column (35% width): Real-Time Telemetry + KPI Scorecard + Anomaly Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <LiveTelemetryWidget />
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

      {/* Firebase Shift Supervisor Authentication Modal */}
      <LoginPage
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      {/* Interactive Custom Shift Builder Modal */}
      <CustomShiftModal
        isOpen={isCustomShiftOpen}
        onClose={() => setIsCustomShiftOpen(false)}
        onSaveShift={handleCustomShiftSave}
      />

      {/* Multi-Shift History Archive Modal */}
      <ShiftHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyList={shiftHistory}
        onLoadShift={handleLoadShiftFromHistory}
        onClearHistory={handleClearHistory}
      />

      {/* Floating Operational AI Chatbot */}
      <ShiftChatbot
        activeShiftId={currentPayload?.shift_id}
        processedData={processedData}
      />
    </div>
  );
}
