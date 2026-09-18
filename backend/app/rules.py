"""
PROJECT RULES CONSTANTS (PROJECT_RULES.md)
Deterministic Operational Rules for LogIQ Industrial System.
"""

# Non-Negotiable Rules Constants
LLM_TEMPERATURE: float = 0.2
RANDOM_SEED: int = 42
MIN_BASELINE_SAMPLES: int = 20
MAX_PROCESSING_TIME_SECONDS: float = 10.0

# Banned Causal Assertion Phrases in Hypotheses (Rule A2)
# No sentence may assert causation unless arithmetically derived.
BANNED_HYPOTHESIS_PHRASES = [
    "caused by",
    "because of",
    "due to",
    "is the reason",
    "resulted from"
]

# Mandatory Report Sections (Rule A3 & Prompt Guardrails)
MANDATORY_REPORT_SECTIONS = [
    "EXECUTIVE SHIFT SUMMARY",
    "CRITICAL ALARMS & MAINTENANCE",
    "EVIDENCE & ANOMALY TABLE",
    "RANKED INVESTIGATION CHECKLIST",
    "UNRESOLVED ISSUES TO TRACK"
]

# Rule Metadata Export
SYSTEM_RULES_METADATA = {
    "every_number_computed_in_python": True,
    "unproven_statements_labelled_as_hypotheses": True,
    "banned_hypothesis_phrases": BANNED_HYPOTHESIS_PHRASES,
    "zero_safety_suppression_enforced": True,
    "every_assertion_carries_evidence_id": True,
    "offline_mode_capable": True,
    "llm_temperature": LLM_TEMPERATURE
}
