# PROJECT RULES — Shift Handover System

Paste alongside the build prompt. These override any conflicting instinct. When a rule and a convenience collide, the rule wins.

---

## A. Non-negotiables (violating any of these fails the problem statement)

1. **Every number in the UI is computed in Python.** The language model never emits a digit. It references values only as `{{TOKEN}}` placeholders, substituted after validation.
2. **Unproven statements are labelled as hypotheses.** No sentence may assert causation unless it is arithmetically derived from the data. Banned in hypothesis text: `caused by`, `because of`, `due to`, `is the reason`, `resulted from`.
3. **No safety-critical alarm and no mandatory maintenance task may be dropped.** Coverage is verified programmatically, not by prompt instruction. Missing items are force-injected and reported.
4. **Every assertion carries evidence IDs.** Zero-evidence claims are rejected before they reach the frontend.
5. **The system must run fully offline.** `LLM_PROVIDER=mock` produces a complete, valid brief with no network.

---

## B. Data rules

- Seed all randomness at 42. Regenerating the dataset must produce byte-identical files.
- Anomaly baselines come from the trailing 7-day window for that specific machine and metric. Never compare a machine against a different machine.
- If a baseline window has fewer than 20 samples, mark the anomaly `confidence: low` and say so rather than flagging aggressively.
- A shift with no anomalies must produce an explicit "no abnormal behaviour detected" result. Never manufacture a finding to fill space.
- Correlation is reported as a candidate relationship with its `r` value and sample size. It is never described as a cause.
- Timestamps are ISO 8601 with timezone. Shift boundaries are explicit, never inferred from row order.

## C. Backend rules

- All API responses are Pydantic models. No raw dicts cross the route boundary.
- `data_engine.py` is pure: DataFrames in, dataclasses out, no I/O, no LLM calls, no globals. This is what makes it testable.
- No business logic in `app.py`. Routes orchestrate and return.
- Failures return structured errors with an actionable message, never a bare 500 or a stack trace.
- Log the LLM prompt, raw response, validation result and retry count for every generation. Judges will ask what the model actually received.
- Processing must complete in under 10 seconds for a single shift. If the LLM is slow, stream KPIs and anomalies first and let the narrative arrive second.

## D. LLM rules

- Temperature 0.2. Never higher.
- Structured JSON output enforced at the API level, not requested politely in prose.
- Exactly one retry on validation failure, with the specific violation appended to the prompt. Second failure falls back to the deterministic template narrative and sets `narrative_source: "fallback"` in the payload. The UI shows that state honestly.
- The model receives: the fact ledger, the evidence table, and the operator notes. It does not receive raw CSVs.
- Prompt and system message live in `prompts/` as versioned text files, not inline string literals.

## E. Frontend rules

- Follow the token file. No ad-hoc hex values in components.
- Glass is for secondary surfaces only. **Critical Alerts is solid, opaque, high contrast — always.** Same rule applies to any error or safety state.
- Contrast floor is WCAG AA. Translucency must be tested against the busiest background in the app, not a blank page.
- Facts and hypotheses must be visually distinguishable at a glance, by more than colour alone — different rule style, different surface weight, a persistent text chip.
- Numbers use tabular figures. No monospace face for data labels.
- No all-caps labels, no single-word colour accents in headings, no eyebrow labels above every heading, no arrows appended to button text.
- Numbered markers only where content is genuinely a sequence.
- Motion answers user action. No scroll-reveal animations, no hover lift on every card.
- Every interactive element has a visible keyboard focus state. `prefers-reduced-motion` is respected.
- Empty and error states give direction, not mood: say what happened and what to do next.
- Responsive to 375px. A supervisor may open this on a phone on the floor.

## F. Copy rules

- Plain operator language. "Machine 3 stopped for 45 minutes", not "downtime event registered on asset M3".
- Sentence case. Active voice. An action keeps the same name from button to confirmation.
- Never soften a critical alarm's wording. Never pad a summary to sound thorough.

## G. Testing rules

- Six fixture scenarios, committed, with expected outputs asserted — not snapshot-approved after the fact.
- Guardrail tests must include an adversarial case where the narrative deliberately omits a critical alarm.
- Narrative integrity test must include a model response containing a bare digit, and assert rejection.
- `make test` prints a readable pass summary suitable for showing on screen.

## H. Never do these

- Do not let the LLM rank, score, or decide severity.
- Do not cache a narrative across different shift inputs.
- Do not collapse, truncate or paginate the critical alerts section.
- Do not add auth, multi-tenancy, Docker, CI, or a component library. Out of scope.
- Do not silently drop rows that fail parsing — surface a data-quality count in the payload.
- Do not present a hypothesis without its disconfirming check.
