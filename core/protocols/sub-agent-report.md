# Protocol: Sub-Agent Report

Every delegated task returns a **structured JSON report**, not narrative text. The orchestrator auto-rejects results without a valid report — vague completion claims are protocol violations.

## Schema

```json
{
  "task": "task id or 1-line description",
  "agent": "compiled agent name",
  "status": "completed | partial | failed",
  "verification": {
    "criterion-1": true,
    "criterion-2": false
  },
  "output": ["files created or modified"],
  "decisions": ["non-obvious choices made, if any — including graph gaps discovered (unmapped module, dangling anchor) with the suggested codemap/graph entry"],
  "nextAction": "if partial/failed: what remains and why",
  "memorySync": true
}
```

## Rules

1. `verification` keys MUST mirror the completion criteria from PLAN — one boolean per criterion. No criteria invented post-hoc.
2. `status: completed` requires ALL verification values `true`. Anything else is `partial`.
3. `memorySync: true` asserts the memory-sync ritual ran (`core/protocols/memory-sync.md`). Orchestrator spot-checks.
4. Parallel waves: one report per instance; the dispatcher merges reports and re-queues failed scopes (`core/protocols/parallelism.md`).
5. Panel votes (`core/protocols/deliberation.md`) attach `vote` and `rationale` fields.

## Orchestrator validation

On receiving a report: parse JSON → validate schema → check `verification` completeness against the delegated criteria → accept, or re-delegate with the rejection reason. Two consecutive schema rejections from the same agent → escalate to human.
