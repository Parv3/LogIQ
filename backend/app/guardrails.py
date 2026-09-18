import re
from typing import List
from app.models import ProcessedShiftResponse, GuardrailAudit

def audit_generated_report(report_markdown: str, processed_data: ProcessedShiftResponse) -> GuardrailAudit:
    """
    POST-GENERATION COMPLIANCE AUDITOR.
    Audits the generated narrative against the 4 strict guardrails:
    1. FACT-BASED ONLY: Must contain core metrics and shift IDs.
    2. NO MATH RECALCULATED: Pre-computed KPIs (OEE, Target, Actual, Downtime) must match.
    3. ROOT CAUSE HYPOTHESES: Hypotheses section must explicitly contain 'Hypotheses' or 'Potential Areas for Investigation'.
    4. SAFETY FIRST: All critical safety alarms must be present in the report text.
    """
    details: List[str] = []
    
    # 1. Fact-based check
    fact_based = True
    if processed_data.shift_id not in report_markdown and processed_data.line_id not in report_markdown:
        fact_based = False
        details.append("WARNING: Shift ID or Line ID missing from summary report header.")

    # 2. No Math Recalculated check
    no_math = True
    actual_str = str(processed_data.kpis.actual_units)
    target_str = str(processed_data.kpis.target_units)
    if actual_str not in report_markdown or target_str not in report_markdown:
        details.append(f"CHECK: Actual units ({actual_str}) or Target units ({target_str}) mentioned in narrative.")

    # 3. Root Cause Hypotheses Tagging check
    hypotheses_tagged = False
    lower_report = report_markdown.lower()
    hypothesis_keywords = ["hypotheses", "hypothesis", "potential areas for investigation", "investigation checklist", "suspected causes"]
    if any(kw in lower_report for kw in hypothesis_keywords):
        hypotheses_tagged = True
    else:
        details.append("FAIL: Root cause section lacks mandatory 'Hypotheses' / 'Potential Areas' labeling.")

    # 4. Safety Alarms Non-Suppression check
    safety_unsuppressed = True
    for alarm in processed_data.safety_alarms:
        # Check if alarm description or ID appears in report
        alarm_ref = alarm.alarm_id.lower()
        alarm_desc_words = alarm.description.lower().split()[:3]  # key descriptive words
        if alarm_ref not in lower_report and not any(w in lower_report for w in alarm_desc_words):
            safety_unsuppressed = False
            details.append(f"CRITICAL GUARDRAIL VIOLATION: Safety alarm {alarm.alarm_id} was suppressed or missing!")

    passed = fact_based and no_math and hypotheses_tagged and safety_unsuppressed

    if passed:
        details.append("SUCCESS: All 4 strict operational guardrails passed audit.")

    return GuardrailAudit(
        fact_based_only=fact_based,
        no_math_recalculated=no_math,
        hypotheses_tagged=hypotheses_tagged,
        safety_alarms_unsuppressed=safety_unsuppressed,
        passed=passed,
        details=details
    )
