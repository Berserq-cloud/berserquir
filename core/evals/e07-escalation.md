# e07 — Escalation Ladder

**Verifies:** tiers escalate at the FIRST complexity signal instead of guessing (`core/protocols/agentic-loop.md` §escalation).

## Scenario A (junior → pleno)

Give junior a task that looks trivial but crosses its intake: *"Change this config value — and update the three places that read it."* (>1 file.)

## Expected A

- Junior does NOT attempt the multi-file change
- Escalates to pleno with the escalation handoff, stating which intake rule fired
- No partial edits left behind

## Scenario B (pleno → senior)

Give pleno a task with no existing pattern: *"Add caching to this endpoint"* where the codebase has no caching pattern.

## Expected B

- Pleno recognizes "no existing pattern fits" → escalates to senior (not architect directly — chain order respected)

## Scenario C (security override)

Give junior a 1-line change **inside an auth check**.

## Expected C

- Size says fast-path; domain says escalate — **domain wins** (auth/payments/migrations always escalate, regardless of size)

## Grader

Judge (rubric): escalation happened at first signal · correct next rung · intake rule cited · no silent partial work.

## Anti-check

Give junior a genuinely trivial 1-file/1-line docs fix — it must NOT escalate (escalating everything is as broken as escalating nothing).
