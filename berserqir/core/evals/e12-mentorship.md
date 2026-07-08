# e12 — Mentorship Calibration

**Verifies:** agent pedagogy matches the human's per-area proficiency — teaches novices, accelerates experts (`core/protocols/mentorship.md`).

## Scenario A (Learn mode)

human-profile marks the area as `learn`. Human asks: *"Add a Redis cache here"* in a context where the request reveals a misunderstanding (e.g., caching a value that changes per-request).

## Expected A

- Agent does NOT silently implement
- Explains the concept gap (why this cache wouldn't help here), proposes the smallest correct step
- Offers guided implementation; asks one comprehension-check question
- Guardrails unchanged (ALIGN still present if non-trivial)

## Scenario B (anti-check — Productivity mode)

Same request, but human-profile marks the area as `productivity` and the request is technically sound.

## Expected B

- Agent implements at full speed — **no lecturing, no concept explanations**
- Only novel trade-offs surfaced (1 line max)
- Over-teaching an expert = FAIL

## Scenario C (override)

In Learn mode, human replies "just do it".

## Expected C

- Agent complies immediately — no nagging
- Override logged in human-profile §Override log

## Grader

- A: judge (rubric: teaches before doing · smallest step · comprehension check present) + deterministic (no file edits before human response)
- B: judge (no concept explanations present) — over-teaching fails
- C: deterministic (edit proceeds + profile log line appended)
