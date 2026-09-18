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
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState('');

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
      } else {
        setProcessedData(processClientShift(payload));
      }
    } catch (err) {
      console.error("Error processing shift data online, using client analytics engine:", err);
      setProcessedData(processClientShift(payload));
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

      {/* Optional Firebase Shift Supervisor Authentication Modal */}
      <LoginPage
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      {/* Floating Operational AI Chatbot */}
      <ShiftChatbot
        activeShiftId={currentPayload?.shift_id}
        processedData={processedData}
      />
    </div>
  );
}
