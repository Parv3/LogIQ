from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from app.models import ShiftPayload, ProcessedShiftResponse, GenerateReportResponse
from app.chat_service import ChatQueryRequest, ChatQueryResponse, query_shift_assistant
from app.scenarios import SCENARIOS, get_scenario_list
from app.analytics import process_full_shift, compute_shift_kpis
from app.llm_service import generate_handover_report
from app.shift_tracker import tracker_instance

app = FastAPI(
    title="LogIQ - Industrial Operations AI API",
    description="Shift Handover Report & Root-Cause Briefing System (Team G2)",
    version="1.0.0"
)

# CORS middleware for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "system": "LogIQ Industrial Operations AI",
        "team": "Team G2 (Saksham Chaturvedi, Parv Mishra, Navya Mitta)",
        "llm_provider": "Operational Analytics Engine",
        "guardrails_enabled": True
    }

@app.get("/api/scenarios")
def list_scenarios():
    return get_scenario_list()

@app.get("/api/scenario/{scenario_id}")
def get_scenario(scenario_id: str):
    if scenario_id not in SCENARIOS:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return SCENARIOS[scenario_id]

@app.post("/api/process-shift", response_model=ProcessedShiftResponse)
def process_shift(payload: ShiftPayload):
    """
    Computes Pandas KPIs, Z-score anomalies, correlations, and evidence table.
    """
    return process_full_shift(payload)

@app.post("/api/generate-report", response_model=GenerateReportResponse)
def generate_report(payload: ShiftPayload):
    """
    Full pipeline: Process shift data -> Invoke backend LLM engine -> Audit guardrails.
    """
    processed = process_full_shift(payload)
    return generate_handover_report(processed)

@app.post("/api/carry-forward")
def carry_forward_shift(current_payload: ShiftPayload, next_payload: ShiftPayload):
    """
    Carries unresolved operator notes, mandatory maintenance, and active safety alarms forward to next shift.
    """
    updated_next = tracker_instance.carry_forward_to_next(current_payload, next_payload)
    return updated_next

@app.post("/api/compare-shifts")
def compare_shifts(payloads: List[ShiftPayload]):
    """
    Compares metrics across multiple shifts side-by-side.
    """
    comparison = []
    for p in payloads:
        kpis = compute_shift_kpis(p)
        comparison.append({
            "shift_id": p.shift_id,
            "line_id": p.line_id,
            "date": p.date,
            "target_units": kpis.target_units,
            "actual_units": kpis.actual_units,
            "variance_units": kpis.variance_units,
            "oee_percent": kpis.oee_percent,
            "downtime_minutes": kpis.total_downtime_minutes,
            "scrap_rate_percent": kpis.scrap_rate_percent,
            "safety_alarms_count": len([a for a in p.alarms if a.is_safety_critical])
        })
    return comparison

@app.post("/api/chat", response_model=ChatQueryResponse)
def chat_with_assistant(request: ChatQueryRequest):
    """
    Sanitized & Guardrailed AI Operational Assistant Chatbot.
    Protects against SQL Injection, Prompt Injection, and generic security threats.
    """
    return query_shift_assistant(request)

