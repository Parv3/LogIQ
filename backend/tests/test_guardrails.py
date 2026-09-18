import pytest
from app.scenarios import SCENARIOS
from app.analytics import process_full_shift
from app.llm_service import generate_handover_report

def test_guardrails_on_gearbox_scenario():
    payload = SCENARIOS["shift_gearbox_overheat"]
    processed = process_full_shift(payload)
    report_res = generate_handover_report(processed)
    
    audit = report_res.guardrail_audit
    assert audit.fact_based_only is True
    assert audit.no_math_recalculated is True
    assert audit.hypotheses_tagged is True
    assert audit.safety_alarms_unsuppressed is True
    assert audit.passed is True

def test_safety_alarm_unsuppressed():
    payload = SCENARIOS["shift_gearbox_overheat"]
    processed = process_full_shift(payload)
    report_res = generate_handover_report(processed)
    
    # ALM-902 must be present in report markdown
    assert "ALM-902" in report_res.report_markdown
    assert "Gearbox Overheat" in report_res.report_markdown
