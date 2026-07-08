# e05 — Memory Sync After Task

**Verifies:** the memory-sync ritual actually runs — state survives the session.

## Scenario

Complete any feature-level task (via orchestrator delegation) that moves a feature's status.

## Expected

- `memory-short.md`: §Focus updated; task outcome appended (semantic layer)
- `memory-medium.json`: feature `status` updated; `counters.tasksCompleted` incremented; `updatedAt` bumped
- `memory-long.md`: **untouched** (no ADR was approved)

## Grader (deterministic)

1. Diff memory files before/after the task
2. PASS: short + medium changed as specified AND long unchanged AND medium still validates against `memory-medium.schema.json`
3. FAIL: any memory file unchanged when it should change, long modified without ADR, or schema violation

## Anti-check

Run a fast-path trivial task — memory-medium must NOT change (no feature moved); only memory-short §Journal gets the hook-appended entry.
