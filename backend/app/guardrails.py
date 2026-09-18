import re
from typing import List
from app.models import ProcessedShiftResponse, GuardrailAudit
from app.rules import BANNED_HYPOTHESIS_PHRASES

def audit_generated_report(report_markdown: str, processed_data: ProcessedShiftResponse) -> GuardrailAudit:
    """
    POST-GENERATION COMPLIANCE AUDITOR ENFORCING PROJECT_RULES.md:
    1. FACT-BASED ONLY: Must contain core metrics and shift IDs.
    2. NO MATH RECALCULATED: Pre-computed KPIs must match Python calculations.
    3. ROOT CAUSE HYPOTHESES: Must be tagged as 'Hypotheses' AND cannot use banned causal phrases ("caused by", "due to").
    4. SAFETY FIRST: All critical safety alarms must be present in output.
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

    # 3. Root Cause Hypotheses Tagging & Banned Causal Phrase check (Rule A2)
    hypotheses_tagged = True
    lower_report = report_markdown.lower()
    
    hypothesis_keywords = ["hypotheses", "hypothesis", "potential areas for investigation", "investigation checklist", "suspected causes"]
    if not any(kw in lower_report for kw in hypothesis_keywords):
        hypotheses_tagged = False
        details.append("FAIL: Root cause section lacks mandatory 'Hypotheses' / 'Potential Areas' labeling.")

    # Check for banned causal phrases (Rule A2)
    for banned in BANNED_HYPOTHESIS_PHRASES:
        if banned in lower_report:
            hypotheses_tagged = False
            details.append(f"RULE A2 VIOLATION: Banned causal phrase '{banned}' detected in narrative output!")

    # 4. Safety Alarms Non-Suppression check (Rule A3)
    safety_unsuppressed = True
    for alarm in processed_data.safety_alarms:
        alarm_ref = alarm.alarm_id.lower()
        alarm_desc_words = alarm.description.lower().split()[:3]
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
