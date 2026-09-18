# LogIQ — Intelligent Shift Handover & Root-Cause Briefing System

> **Track 5**: Industry, Manufacturing & Supply Chain (Problem 25)

## 🏆 Team Credits (Team G2)
- **Saksham Chaturvedi** (`12515500360`)
- **Parv Mishra** (`12515500307`)
- **Navya Mitta** (`12515500281`)

---

## 🚀 Overview
**LogIQ** is an AI-powered industrial shift handover report generator and root-cause briefing system designed for modern manufacturing facilities. It processes deterministic shift production metrics, sensor time-series logs, machine alarms, and unstructured operator notes to generate concise, evidence-backed handover reports for incoming shift teams.

LogIQ strictly enforces **4 Core Operational Guardrails** to eliminate AI hallucinations and ensure safety compliance.

---

## 🛡️ Operational Guardrails
1. **FACT-BASED ONLY**: Summaries are grounded strictly in the provided shift JSON payload. No external facts or invented data.
2. **ZERO MATH RECALCULATION**: All production KPIs (Target Variance, OEE, Scrap Rate, Downtime) are computed deterministically by Python/Pandas. The LLM is strictly prohibited from recalculating math.
3. **ROOT CAUSE HYPOTHESES**: All root-cause statements are strictly tagged as **"Hypotheses"** or **"Potential Areas for Investigation"** rather than asserting unproven claims.
4. **SAFETY FIRST (ZERO SUPPRESSION)**: Under no circumstances are safety-critical machine alarms or mandatory maintenance tasks suppressed or summarized away.

---

## ⚙️ Key Features
- **Deterministic Analytics Engine (Pandas & NumPy)**: Computes OEE, Target vs. Actual Variance, Scrap Rate %, and Downtime totals.
- **Statistical Anomaly Detector**: Z-Score and Interquartile Range (IQR) anomaly detection on sensor time series (`gearbox_temp_c`, `hydraulic_pressure_bar`, `vibration_mm_s`).
- **Pearson Sensor-Downtime Correlation**: Quantifies correlation strength linking sensor spikes to downtime events.
- **Evidence & Anomaly Mapping Table**: Automatically links every flagged issue to raw log timestamps, metric values, or operator notes.
- **Multi-Shift Carry-Forward & Comparison**: Carries unresolved operator notes, active safety alarms, and open maintenance tasks forward from Shift $N$ to Shift $N+1$, plus side-by-side shift trend analysis.
- **1-Click PDF Export & Copy Markdown**: Standalone standardized incident and shift report export.

---

## 🏗️ System Architecture

```
                                 +-----------------------------------+
                                 |    Vite + React Command Center    |
                                 | (Shift Selector, Multi-Shift,     |
                                 |  KPI Cards, Evidence Table,       |
                                 |  Guardrail Badges, PDF Exporter)  |
                                 +-----------------+-----------------+
                                                   | REST API
                                                   v
                                 +-----------------------------------+
                                 |         FastAPI Backend           |
                                 +-----------------+-----------------+
                                                   |
                +----------------------------------+----------------------------------+
                |                                  |                                  |
                v                                  v                                  v
    +-----------------------+   +-----------------------+   +-----------------------+
    |  Pandas/NumPy Engine  |   | Anomaly & Correlation |   |   LLM & Guardrails    |
    | - Target Variance     |   | - Z-Score / IQR       |   | - Gemini 2.5/Flash    |
    | - Defect & Scrap Rate |   | - Sensor-Downtime     |   | - Fallback Mock Engine|
    | - Downtime Totals     |   |   Correlation Matrix  |   | - 4 Guardrail Audits  |
    +-----------------------+   +-----------------------+   +-----------------------+
```

---

## 📦 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Run Backend Server (FastAPI)
```bash
# From project root
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*Backend runs at `http://localhost:8000`.*

### 2. Run Backend Pytest Suite
```bash
pytest backend/tests
```

### 3. Run Frontend Server (Vite / React)
```bash
# Open new terminal window from project root
cd frontend
npm install
npm run dev
```
*Frontend Command Center runs at `http://localhost:5173`.*

---

## 📝 License
LogIQ is built for the Track 5 Industry, Manufacturing & Supply Chain Hackathon Challenge.
