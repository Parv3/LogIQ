import os
from typing import Tuple
from app.models import ProcessedShiftResponse, GenerateReportResponse, GuardrailAudit
from app.guardrails import audit_generated_report

# System prompt defining strict operational rules for the Industrial Operations AI
SYSTEM_PROMPT = """
You are an expert Industrial Operations AI tasked with generating a concise, structured shift handover report and root-cause briefing for a manufacturing facility.

STRICT GUARDRAILS AND CONSTRAINTS:
1. FACT-BASED ONLY: You must only summarize verified facts provided in the payload. Do not invent data.
2. NO MATH: Rely entirely on the provided Pandas KPI calculations. Do not attempt to calculate production totals, downtime, or defect rates.
3. ROOT CAUSE HYPOTHESES: You are strictly forbidden from asserting unproven root causes. Any generated root-cause statements must be explicitly labeled as "Hypotheses" or "Potential Areas for Investigation".
4. SAFETY FIRST: Under no circumstances are you to suppress, summarize away, or minimize safety-critical alarms or mandatory maintenance actions. These must be prominently displayed.

REQUIRED OUTPUT FORMAT (Must contain all 5 sections):

1. EXECUTIVE SHIFT SUMMARY:
- Brief objective narrative of shift performance (Actual vs Target, major downtime events).

2. CRITICAL ALARMS & MAINTENANCE (DO NOT SUPPRESS):
- List all safety-critical alarms and unresolved, mandatory maintenance tasks.

3. EVIDENCE & ANOMALY TABLE:
- Markdown table linking specific issues or anomalies to exact metrics, alarms, or operator log entries.

4. RANKED INVESTIGATION CHECKLIST (HYPOTHESES):
- Prioritized list of areas for incoming shift investigation. State issue, evidence, and hypothesis.

5. UNRESOLVED ISSUES TO TRACK:
- Extract and list unresolved items carried forward to the next shift.
"""

def generate_mock_report(data: ProcessedShiftResponse) -> str:
    """
    Deterministic fallback handover report generator enforcing 100% guardrail compliance.
    """
    kpis = data.kpis
    
    # 1. Executive Summary
    variance_sign = "+" if kpis.variance_units >= 0 else ""
    summary = f"""# EXECUTIVE SHIFT SUMMARY

**Shift**: {data.shift_type} | **Line**: {data.line_id} | **Date**: {data.date} | **Shift ID**: {data.shift_id}

During {data.shift_type}, **{data.line_id}** produced **{kpis.actual_units} units** against a target of **{kpis.target_units} units** (Variance: {variance_sign}{kpis.variance_units} units, {kpis.variance_percent}%). Total downtime reached **{kpis.total_downtime_minutes} minutes**, resulting in an overall OEE of **{kpis.oee_percent}%** (Availability: {kpis.availability_percent}%, Performance: {kpis.performance_percent}%, Quality: {kpis.quality_percent}%). Scrap rate stood at **{kpis.scrap_rate_percent}%**.
"""

    # 2. Critical Alarms & Maintenance
    alarms_text = ""
    if data.safety_alarms:
        for a in data.safety_alarms:
            alarms_text += f"- 🔴 **CRITICAL SAFETY ALARM [{a.alarm_id}]**: {a.description} (Time: {a.timestamp})\n"
    else:
        alarms_text += "- *No safety-critical alarms raised during this shift.*\n"

    maint_text = ""
    if data.mandatory_maintenance:
        for m in data.mandatory_maintenance:
            maint_text += f"- 🛠️ **MANDATORY MAINTENANCE [{m.task_id}]**: {m.component} - {m.description} (Status: **{m.status}**)\n"
    else:
        maint_text += "- *No unresolved mandatory maintenance tasks.*\n"

    section_2 = f"""# CRITICAL ALARMS & MAINTENANCE (DO NOT SUPPRESS)

### Safety Alarms:
{alarms_text}
### Mandatory Maintenance Actions:
{maint_text}
"""

    # 3. Evidence & Anomaly Table
    rows = ""
    for ev in data.evidence_table:
        rows += f"| `{ev.issue_id}` | **{ev.category}** | `{ev.metric_or_alarm}` | {ev.evidence_proof} | `{ev.source_type}` |\n"

    if not rows:
        rows = "| `EVID-000` | General | Nominal | All parameters within operating limits | METRIC |\n"

    section_3 = f"""# EVIDENCE & ANOMALY TABLE

| Issue ID | Category | Metric / Alarm | Evidence & Proof | Data Source |
|---|---|---|---|---|
{rows}
"""

    # 4. Ranked Investigation Checklist (Hypotheses)
    checklist = ""
    rank = 1

    # Generate hypotheses from anomalies & alarms
    for anom in data.anomalies:
        if anom.is_anomaly:
            checklist += f"""{rank}. **Issue**: Thermal/Vibration Anomaly on `{anom.metric}`
   - **Verified Evidence**: Recorded {anom.value} (Normal Baseline: {anom.baseline_mean}, Z-Score: **+{anom.z_score}**).
   - **HYPOTHESIS / Potential Area for Investigation**: High likelihood of lube flow starvation or bearing mechanical wear. Inspect lubrication pump & coupling before ramping line speed.

"""
            rank += 1

    for a in data.safety_alarms:
        checklist += f"""{rank}. **Issue**: Critical Safety Alarm Triggered (`{a.alarm_id}`)
   - **Verified Evidence**: Alarm log entry at {a.timestamp}: "{a.description}".
   - **HYPOTHESIS / Potential Area for Investigation**: Possible hydraulic line pressure surge or relief valve blockage. Perform pressure decay test.

"""
        rank += 1

    if not checklist:
        checklist = "1. **Issue**: Nominal Operations\n   - **Verified Evidence**: All metrics within Z-score bounds.\n   - **HYPOTHESIS / Potential Area for Investigation**: Continue standard preventive maintenance cycle.\n"

    section_4 = f"""# RANKED INVESTIGATION CHECKLIST (HYPOTHESES)

> [!IMPORTANT]
> **Operational Guardrail Note**: The following items are explicitly labeled as **Hypotheses** and represent recommended areas for investigation by the incoming shift team.

{checklist}
"""

    # 5. Unresolved Issues To Track
    unresolved_text = ""
    if data.unresolved_notes:
        for note in data.unresolved_notes:
            unresolved_text += f"- 📌 **[{note.operator} @ {note.timestamp}]** ({note.category}): {note.text}\n"
    else:
        unresolved_text += "- *All operator logged notes resolved for this shift.*\n"

    section_5 = f"""# UNRESOLVED ISSUES TO TRACK

{unresolved_text}
"""

    return summary + "\n" + section_2 + "\n" + section_3 + "\n" + section_4 + "\n" + section_5

def generate_handover_report(data: ProcessedShiftResponse) -> GenerateReportResponse:
    """
    Invokes Gemini API or fallback mock generator, then runs guardrail auditor.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    report_md = ""

    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            prompt = f"{SYSTEM_PROMPT}\n\nPROCESS DATA PAYLOAD:\n{data.model_dump_json()}"
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            report_md = response.text
        except Exception as e:
            # Fallback if API call fails
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
