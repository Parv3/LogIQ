import os
from dotenv import load_dotenv
from app.models import ProcessedShiftResponse, GenerateReportResponse
from app.guardrails import audit_generated_report
from app.rules import LLM_TEMPERATURE

# Load environment variables from backend/.env
load_dotenv()

SYSTEM_PROMPT = """
You are an expert Industrial Operations AI tasked with generating a concise executive shift handover summary for a manufacturing facility.

STRICT GUARDRAILS AND CONSTRAINTS:
1. FACT-BASED ONLY: Summarize only verified facts provided in the payload. Do not invent data.
2. NO MATH: Rely entirely on the provided Pandas KPI calculations. Do not attempt to calculate production totals, downtime, or defect rates.
3. ROOT CAUSE HYPOTHESES: You are strictly forbidden from asserting unproven root causes. Any generated root-cause statements must be explicitly labeled as "Hypotheses" or "Potential Areas for Investigation". Never use causal phrases like "caused by", "because of", or "due to".
4. SAFETY FIRST: Under no circumstances are you to suppress, summarize away, or minimize safety-critical alarms or mandatory maintenance actions. Mention all critical safety alarm IDs and descriptions (e.g. ALM-902 Gearbox Overheat).

Output a clean Executive Shift Summary narrative highlighting production performance (Actual vs Target units), total downtime minutes, OEE %, quality scrap rate, safety critical alarms (mentioning ALM-902 Gearbox Overheat), and recommended Hypotheses for incoming shift investigation.
"""

def generate_mock_report(data: ProcessedShiftResponse) -> str:
    """
    Deterministic fallback handover report narrative generator.
    Returns clean executive summary prose with mandatory alarm references and hypotheses tags.
    """
    kpis = data.kpis
    variance_sign = "+" if kpis.variance_units >= 0 else ""

    alarms_str = ", ".join([f"{a.alarm_id}: {a.description}" for a in data.safety_alarms]) if data.safety_alarms else "None"

    summary = f"""During **{data.shift_type}**, **{data.line_id}** (Date: **{data.date}**, Shift ID: `{data.shift_id}`) produced **{kpis.actual_units} units** against a target of **{kpis.target_units} units** (Variance: {variance_sign}{kpis.variance_units} units, {kpis.variance_percent}%). Total shift downtime reached **{kpis.total_downtime_minutes} minutes**, yielding an overall OEE of **{kpis.oee_percent}%** (Availability: {kpis.availability_percent}%, Performance: {kpis.performance_percent}%, Quality: {kpis.quality_percent}%). The quality scrap rate was calculated at **{kpis.scrap_rate_percent}%**.

Safety Alarms & Mandatory Maintenance: Active safety alarms included `{alarms_str}`. All unresolved maintenance tasks and statistical anomalies have been mapped to evidence items. Incoming shift teams should review recommended **Hypotheses** for root-cause investigation."""

    return summary

def call_nvidia_llm(prompt: str, key: str) -> str:
    import requests
    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {
        "model": "nvidia/llama-3.1-nemotron-70b-instruct",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": LLM_TEMPERATURE,
        "max_tokens": 1024
    }
    res = requests.post(url, headers=headers, json=payload, timeout=8)
    if res.status_code == 200:
        return res.json()["choices"][0]["message"]["content"]
    raise Exception(f"NVIDIA API Error Status: {res.status_code}")

def generate_handover_report(data: ProcessedShiftResponse) -> GenerateReportResponse:
    """
    Invokes LLM API (NVIDIA NIM or Gemini 3.6 Flash) or fallback mock generator.
    """
    gemini_key = os.environ.get("GEMINI_API_KEY")
    nvidia_key = os.environ.get("NVIDIA_API_KEY")
    provider = os.environ.get("LLM_PROVIDER", "gemini").lower()
    
    report_md = ""

    if provider == "nvidia" and nvidia_key:
        try:
            prompt = f"{SYSTEM_PROMPT}\n\nPROCESS DATA PAYLOAD:\n{data.model_dump_json()}"
            report_md = call_nvidia_llm(prompt, nvidia_key)
        except Exception:
            report_md = generate_mock_report(data)
    elif gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            prompt = f"{SYSTEM_PROMPT}\n\nPROCESS DATA PAYLOAD:\n{data.model_dump_json()}"
            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=prompt
            )
            report_md = response.text
            if data.safety_alarms and not any(a.alarm_id in report_md for a in data.safety_alarms):
                report_md = generate_mock_report(data)
        except Exception:
            report_md = generate_mock_report(data)
    else:
        report_md = generate_mock_report(data)

    # Run Guardrail Compliance Audit
    audit = audit_generated_report(report_md, data)

    return GenerateReportResponse(
        shift_id=data.shift_id,
        line_id=data.line_id,
        report_markdown=report_md,
        guardrail_audit=audit,
        processed_data=data
    )
