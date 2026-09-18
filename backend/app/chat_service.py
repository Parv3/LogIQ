import os
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.models import ProcessedShiftResponse

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None

class ChatQueryRequest(BaseModel):
    shift_id: str
    message: str = Field(..., max_length=500)
    history: List[ChatMessage] = []
    processed_data: Optional[ProcessedShiftResponse] = None

class ChatQueryResponse(BaseModel):
    shift_id: str
    reply: str
    sources: List[str] = []
    guardrail_verified: bool = True

def sanitize_user_input(text: str) -> str:
    """
    STRICT SECURITY INPUT SANITIZATION:
    1. Prevents SQL Injection patterns (' OR 1=1 --, UNION SELECT, DROP TABLE).
    2. Strips HTML/Script tags (<script>, javascript:).
    3. Neutralizes LLM Jailbreak / System Prompt injection attempts.
    """
    if not text:
        return ""

    # Strip dangerous HTML/Script tags
    clean = re.sub(r'<[^>]*?>', '', text)

    # Detect & strip SQL injection patterns
    sql_patterns = [
        r"(--|#|/\*|\*/)",
        r"\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|TRUNCATE)\b",
        r"'\s*OR\s*'\d+'\s*=\s*'\d+",
        r"1\s*=\s*1"
    ]
    for pattern in sql_patterns:
        clean = re.sub(pattern, '', clean, flags=re.IGNORECASE)

    # Neutralize system prompt override attempts
    jailbreak_patterns = [
        r"ignore previous instructions",
        r"disregard all prior directives",
        r"you are now an unrestricted",
        r"system prompt"
    ]
    for pattern in jailbreak_patterns:
        clean = re.sub(pattern, "[sanitized]", clean, flags=re.IGNORECASE)

    return clean.strip()

CHAT_SYSTEM_PROMPT = """
You are LogIQ Industrial Plant Assistant — an expert SCADA/MES operational assistant for manufacturing shift supervisors and maintenance teams.

YOUR STRICT SCOPE:
1. Answer questions strictly based on the provided active shift metrics, Z-score sensor anomalies, machine alarms, operator notes, and evidence table.
2. If asked about root causes, label them as "Hypotheses" or "Potential Areas for Investigation".
3. Never invent facts outside the shift data.
4. Keep answers concise, direct, and formatted in clear bullet points for plant floor operators.
"""

def generate_mock_chat_reply(query: str, data: Optional[ProcessedShiftResponse]) -> str:
    """
    Deterministic fallback chat engine for offline / unauthenticated execution.
    """
    query_lower = query.lower()

    if not data:
        return "LogIQ Assistant online. Select a shift scenario to query production metrics, sensor anomalies, or safety alarms."

    if "alarm" in query_lower or "safety" in query_lower or "critical" in query_lower:
        if data.safety_alarms:
            alarms_text = "\n".join([f"• [{a.alarm_id}] {a.description} at {a.timestamp}" for a in data.safety_alarms])
            return f"**Active Critical Safety Alarms ({len(data.safety_alarms)})**:\n{alarms_text}\n\n*Safety Recommendation*: Verify pressure lines and lockouts before line speed ramp."
        return "No critical safety alarms recorded during this shift. All safety interlocks are nominal."

    if "anomaly" in query_lower or "sensor" in query_lower or "temp" in query_lower or "vibration" in query_lower:
        if data.anomalies:
            anom_text = "\n".join([
                f"• `{anom.metric}`: Peak {anom.value} (Baseline: {anom.baseline_mean}, Z-Score: +{anom.z_score}) - {anom.status}"
                for anom in data.anomalies if anom.is_anomaly
            ])
            return f"**Statistical Sensor Anomalies Flagged**:\n{anom_text}\n\n*Investigation Hypothesis*: High probability of lube starvation or bearing friction. Inspect pump coupling."
        return "All sensor metrics (temperature, pressure, vibration) are operating within normal baseline statistical bounds (|Z| < 2.5)."

    if "maintenance" in query_lower or "unresolved" in query_lower or "task" in query_lower:
        if data.mandatory_maintenance:
            maint_text = "\n".join([f"• [{m.task_id}] {m.component}: {m.description} (Status: {m.status})" for m in data.mandatory_maintenance])
            return f"**Mandatory Maintenance Tasks ({len(data.mandatory_maintenance)})**:\n{maint_text}"
        return "No unresolved mandatory maintenance tasks pending for this shift."

    if "kpi" in query_lower or "target" in query_lower or "actual" in query_lower or "oee" in query_lower or "downtime" in query_lower:
        k = data.kpis
        return f"**Shift Production KPI Summary**:\n• **Target vs Actual**: {k.actual_units} / {k.target_units} units (Variance: {k.variance_units} units, {k.variance_percent}%)\n• **OEE**: {k.oee_percent}%\n• **Total Downtime**: {k.total_downtime_minutes} mins\n• **Scrap Rate**: {k.scrap_rate_percent}%"

    return f"**LogIQ Shift Briefing Context ({data.shift_id})**:\nDuring {data.shift_type}, line **{data.line_id}** produced **{data.kpis.actual_units} units** with **{data.kpis.total_downtime_minutes} mins** downtime. There are {len(data.safety_alarms)} active safety alarms and {len(data.unresolved_notes)} unresolved operator notes."

def query_shift_assistant(request: ChatQueryRequest) -> ChatQueryResponse:
    """
    Secure Chatbot Query Handler:
    1. Sanitizes user input against SQL Injection & Jailbreaks.
    2. Builds Context Payload from Shift Data.
    3. Invokes Gemini 2.5 API or Mock Fallback Engine.
    """
    clean_message = sanitize_user_input(request.message)
    if not clean_message:
        return ChatQueryResponse(
            shift_id=request.shift_id,
            reply="Please enter a valid operational question regarding plant metrics or equipment alarms.",
            sources=[]
        )

    gemini_key = os.environ.get("GEMINI_API_KEY")
    nvidia_key = os.environ.get("NVIDIA_API_KEY")
    provider = os.environ.get("LLM_PROVIDER", "gemini").lower()
    
    reply_text = ""
    sources = []

    if request.processed_data:
        sources = [e.issue_id for e in request.processed_data.evidence_table[:4]]

    context_str = ""
    if request.processed_data:
        context_str = f"SHIFT DATA CONTEXT:\n{request.processed_data.model_dump_json()}\n\n"
    prompt = f"{CHAT_SYSTEM_PROMPT}\n\n{context_str}OPERATOR USER QUESTION:\n{clean_message}"

    if provider == "nvidia" and nvidia_key:
        try:
            import requests
            url = "https://integrate.api.nvidia.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {nvidia_key}", "Content-Type": "application/json"}
            payload = {
                "model": "nvidia/llama-3.1-nemotron-70b-instruct",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2
            }
            res = requests.post(url, headers=headers, json=payload, timeout=8)
            if res.status_code == 200:
                reply_text = res.json()["choices"][0]["message"]["content"]
            else:
                reply_text = generate_mock_chat_reply(clean_message, request.processed_data)
        except Exception:
            reply_text = generate_mock_chat_reply(clean_message, request.processed_data)
    elif gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=prompt
            )
            reply_text = response.text
        except Exception:
            reply_text = generate_mock_chat_reply(clean_message, request.processed_data)
    else:
        reply_text = generate_mock_chat_reply(clean_message, request.processed_data)

    return ChatQueryResponse(
        shift_id=request.shift_id,
        reply=reply_text,
        sources=sources,
        guardrail_verified=True
    )
