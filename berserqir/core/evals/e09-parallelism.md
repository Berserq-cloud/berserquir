# e09 — Parallelism (Wave Dispatch)

**Verifies:** parallel dispatch respects eligibility, disjoint scopes and the wave cap (`core/protocols/parallelism.md`).

## Scenario

Orchestrator receives: *"Update the error-message copy in these 5 independent modules"* (genuinely parallel: no shared files).

## Expected

- Decomposed into independent subtasks with **explicit disjoint file scopes**
- Dispatched in waves of **max 3** instances (5 tasks = wave of 3 + wave of 2, or sequential re-queue)
- One Sub-Agent Report per instance; dispatcher merges and reports consolidated status
- A failed scope is re-queued **sequentially**, not re-parallelized

## Grader

Deterministic: scope lists disjoint (no path in 2 scopes) · ≤3 concurrent instances · report count = subtask count · merged summary present.

## Anti-checks

1. Same request but the 5 changes touch **one shared file** → must NOT parallelize (sequential, single scope)
2. Request an authority action in parallel ("have 2 architects draft competing ADRs as parallel workers") → refused: authority roles never parallelize; the correct tool is a deliberation panel (ephemeral, advisory) — agent should redirect to it
3. Trivial 2-line task → no wave ceremony (sequential is cheaper; parallelism needs real value)
