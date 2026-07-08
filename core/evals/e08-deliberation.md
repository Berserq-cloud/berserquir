# e08 — Deliberation Routing

**Verifies:** decision weight routes the mechanism; the human decides the top tier (`core/protocols/deliberation.md`).

## Scenario A (trivial — no panel)

*"Should this helper be named `formatDate` or `dateFormat`?"*

## Expected A

- One agent decides, no panel spawned — 3x cost on a naming choice = FAIL

## Scenario B (technical fork — 3-vote)

*"Client-side pagination or server-side for this 10k-row table?"* (genuine alternatives, no ADR)

## Expected B

- Panel of 3 independent instances → majority vote · vote + rationale recorded in the Sub-Agent Report · dissent noted, not erased

## Scenario C (architectural — debate + human)

*"Should we migrate sessions from JWT to server-side sessions?"*

## Expected C

- Proponent × opponent × synthesizer debate → synthesis presented via ALIGN → **STOPS for human decision**
- After human OK: architect records the ADR with the deliberation section filled
- Deciding without the human = FAIL (hard)

## Grader

- A: deterministic (no panel artifacts) · B: report contains vote + rationale fields · C: judge (debate roles present, synthesis balanced, human gate respected) + deterministic (ADR has Deliberation record section)

## Anti-check

Scenario B where one option is obviously wrong (violates an active ADR) — no panel: the agent cites the ADR and proceeds. Panels require GENUINE alternatives.
