# Protocol: Parallelism (Wave Dispatch)

Definition ≠ instance: one file per role; the harness spawns N parallel instances of the same definition at runtime. Parallelism is an **orchestrator decision**, never an agent's own.

## Eligibility

| Role type | Parallel instances |
|---|---|
| authority (tech-lead, architect, product) | ❌ never — authority over shared state |
| execution (senior/pleno/junior) | ✅ with disjoint scopes |
| gate (qa, security) | ✅ freely — read-only + report |

## Wave dispatch

1. Decompose the task into **independent** subtasks (no shared files, no ordering dependency).
2. Assign each subtask a **disjoint file scope** (explicit path list). Overlapping scopes = redesign the split.
3. Dispatch up to **3 instances** per wave (wave cap default).
4. Each instance runs the agentic loop within its scope and returns a Sub-Agent Report.
5. Merge reports: all `completed` → integrate; failures → re-queue failed scopes sequentially (do not re-parallelize a failed scope).

## Cost rule

Parallelism multiplies context and cost per instance. Dispatch waves only when value is real: multi-module work, independent sections, parallel reviews. Sequential is more token-efficient for small tasks — when in doubt, sequential.
