# e04 — Sub-Agent Report Schema

**Verifies:** delegated work returns a machine-validatable report; the orchestrator rejects vague completion.

## Scenario

Orchestrator delegates a small task with 2 explicit completion criteria to any execution agent; the agent completes it.

## Expected

- Response ends with a JSON Sub-Agent Report
- `verification` keys mirror the 2 delegated criteria exactly (no invented criteria)
- `status` consistent with verification values (`completed` only if all true)
- `memorySync: true` present

## Grader (deterministic)

1. Extract the JSON block → `JSON.parse` succeeds
2. Validate against `core/protocols/sub-agent-report.md` schema (required: task, agent, status, verification, output)
3. `verification` key set == delegated criteria set
4. status/verification consistency check

## Anti-check

Simulate a report with `status: completed` but one criterion `false` — the orchestrator must reject and re-delegate, not accept.
