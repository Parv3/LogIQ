# FRONTEND_GUIDE.md - LogIQ Industrial Operations Command Center

Welcome to the frontend engineering guide for **LogIQ** — an Industrial Operations AI system for Shift Handover & Root-Cause Briefings (Track 5: Industry, Manufacturing & Supply Chain).

---

## Team Credits (Team G2)
- **Saksham Chaturvedi** (`12515500360`)
- **Parv Mishra** (`12515500307`)
- **Navya Mitta** (`12515500281`)

---

## 🎨 Design Aesthetics & Theme Guidelines
LogIQ requires an **Industrial Command Center / Operations Center** aesthetic that looks state-of-the-art:
- **Color Palette**: Dark Slate / Cyber Industrial (`#0B0F19` deep background, `#1E293B` panel cards, `#10B981` success/normal, `#EF4444` safety critical alarm, `#F59E0B` warning/anomaly, `#06B6D4` cyber cyan accents).
- **Typography**: Clean sans-serif fonts (e.g. *Inter*, *Outfit*, or *Roboto Mono* for numbers/code).
- **Visual Feel**: Glassmorphism card overlays, smooth micro-animations, glowing status badges, clear visual hierarchy.

---

## 🚀 Recommended Frontend Stack
- **Framework**: React 18+ via Vite (`npm create vite@latest frontend -- --template react`)
- **Icons**: `lucide-react` (Industrial & UI icons: `AlertTriangle`, `Activity`, `CheckCircle2`, `ShieldAlert`, `FileText`, `Layers`, `Download`, `RefreshCw`)
- **Markdown Rendering**: `react-markdown` (renders generated handover reports)
- **PDF Export**: `html2pdf.js` or `jsPDF` (for 1-click incident/shift report PDF download)
- **Styling**: Vanilla CSS with utility variables defined in `src/styles/index.css`

---

## 🖥️ Layout & Key Components

```
+---------------------------------------------------------------------------------+
|  [Header] LogIQ Command Center | Team G2 | Model: Gemini 2.5 | API: Connected    |
+---------------------------------------------------------------------------------+
|  [Control Bar] Select Scenario: [Line 4 - Gearbox Overheat v] [Upload JSON]     |
+---------------------------------------------------------------------------------+
|  [Safety Alert Banner] ⚠️ CRITICAL ALARMS: E-STOP Hydraulic Pressure Failure     |
+---------------------------------------------------------------------------------+
|  [KPI Cards Grid]                                                               |
|  +----------------+ +----------------+ +----------------+ +-----------------+  |
|  | OEE: 74.2%     | | Target: 500    | | Downtime: 85m | | Scrap Rate: 3.8%|  |
|  | (Variance: -80)| | Actual: 420    | | (3 Incidents) | | (Z-Score: +2.1) |  |
|  +----------------+ +----------------+ +----------------+ +-----------------+  |
+---------------------------------------------------------------------------------+
|  [Tab Navigation] [📊 Shift Dashboard] [🔗 Evidence Table] [📝 Handover Report] [🔄 Multi-Shift Carry] |
+---------------------------------------------------------------------------------+
|  [Tab View Content Area]                                                        |
|  - Shift Dashboard: Anomaly Cards, Sensor-Downtime Correlation Matrix           |
|  - Evidence Table: Mapping metrics to raw log timestamps & operator notes       |
|  - Handover Report: 5 Guardrailed Report Sections + Guardrail Audit Badges      |
|  - Multi-Shift Carry: Issues carried forward from Shift A -> Shift B             |
+---------------------------------------------------------------------------------+
```

---

## 📡 REST API Integration Contracts

The backend FastAPI service runs on `http://localhost:8000`.

### 1. `GET /api/health`
Checks backend and LLM service status.
**Response**:
```json
{
  "status": "online",
  "llm_provider": "gemini-2.5-flash",
  "guardrails_enabled": true
}
```

### 2. `GET /api/scenarios`
Returns pre-loaded industrial shift scenarios for fast demo testing.
**Response**:
```json
[
  {
    "id": "shift_gearbox_overheat",
    "name": "Line 4 - Gearbox Overheat & Pressure Spike",
    "shift": "Shift A",
    "date": "2026-09-18"
  }
]
```

### 3. `POST /api/process-shift`
Processes raw shift JSON payload using Python Pandas/NumPy. Computes KPIs, Z-score anomalies, and sensor correlations.
**Request Body**: `ShiftPayloadJSON`
**Response**:
```json
{
  "kpis": {
    "target_units": 500,
    "actual_units": 420,
    "variance_units": -80,
    "oee_percent": 74.2,
    "downtime_minutes": 85,
    "scrap_rate_percent": 3.8
  },
  "anomalies": [
    {
      "metric": "gearbox_temp_c",
      "value": 98.4,
      "z_score": 3.12,
      "status": "CRITICAL_ANOMALY"
    }
  ],
  "correlations": [
    {
      "sensor": "gearbox_temp_c",
      "target": "downtime_minutes",
      "coefficient": 0.89,
      "significance": "HIGH"
    }
  ],
  "safety_alarms": [
    {
      "alarm_id": "ALM-902",
      "severity": "CRITICAL",
      "description": "Hydraulic Line Pressure High - E-Stop Triggered",
      "timestamp": "06:14:22"
    }
  ],
  "unresolved_items": [
    "Check seal alignment on Hydraulic Pump #2"
  ]
}
```

### 4. `POST /api/generate-report`
Invokes the Guardrailed LLM engine to generate the 5-section shift handover briefing.
**Response**:
```json
{
  "report_markdown": "# EXECUTIVE SHIFT SUMMARY\n...",
  "guardrail_audit": {
    "fact_based_only": true,
    "no_math_recalculated": true,
    "hypotheses_tagged": true,
    "safety_alarms_unsuppressed": true,
    "passed": true
  }
}
```

### 5. `POST /api/carry-forward`
Carries open issues and unresolved notes from Shift $N$ into Shift $N+1$.
**Response**: Updated Shift $N+1$ payload with inherited unresolved notes.

---

## 🛡️ Guardrail UI Guidelines

The frontend must visually enforce and communicate the **4 Core Guardrails**:
1. **Zero Math Alteration**: Always display pre-computed KPI values directly from `/api/process-shift`. Never re-compute or recalculate values client-side.
2. **Safety First Banner**: If `safety_alarms` array is non-empty, render a persistent top alert banner in `#EF4444` red.
3. **Hypothesis Tags**: The "Ranked Investigation Checklist" in the report viewer must display a **"Hypothesis"** badge next to every potential cause item.
4. **Guardrail Compliance Badges**: Render a row of green checkmarks for all 4 passed guardrails alongside the report output.

---

## 📄 Standardized Export
Provide 2 action buttons on the report view:
- 📋 **Copy Markdown**: Copies `report_markdown` to clipboard.
- 📥 **Download Incident Briefing PDF**: Uses `html2pdf.js` to download the formatted report and evidence table as a clean PDF file.

---

## 🛠️ Local Setup Commands for Frontend Dev
```bash
# Initialize Vite React app inside frontend/
npx -y create-vite@latest frontend --template react
cd frontend
npm install lucide-react react-markdown html2pdf.js
npm run dev
```

*Frontend dev server runs at `http://localhost:5173`.*
