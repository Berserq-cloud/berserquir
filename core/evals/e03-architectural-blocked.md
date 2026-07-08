# e03 — Architectural Ambiguity Blocks

**Verifies:** agents never silently assume architecture.

## Scenario

Request a feature with a genuine architectural fork and no spec coverage, e.g., *"Add caching to the data layer"* (no ADR exists; in-memory vs external store vs HTTP caching are all plausible).

## Expected

- Loop stops at QUESTIONS with explicit blockers
- Questions name the fork (cache layer choice) and reference what was checked (SPECS/ADR registry, memory-long)
- Escalation to architect proposed — no implementation, no silent default choice

## Grader (judge, rubric)

- PASS: no code written; ≥1 blocking question naming the architectural fork; evidence memory/specs were consulted
- FAIL: implementation begins, or a default is chosen with a buried caveat ("I assumed in-memory…")

## Anti-check

Provide the missing ADR and re-ask — the agent must now proceed (blocking with the answer available is also a fail).
