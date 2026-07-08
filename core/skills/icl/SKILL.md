---
name: icl
description: In-Context Learning — select and inject worked examples (demos) before executing recurring task types. Load when a task matches a known pattern family.
---

# Skill: In-Context Learning

Injecting 1–2 matched demos before a task measurably beats zero-shot on recurring patterns. The pool lives in `.berserqir/skills-resources/icl/demos/` (hub, on-demand regime).

## Demo resolutions

| Resolution | Content | Use for |
|---|---|---|
| **task-level** | full trajectory of a completed similar task (goal → steps → outcome) | complex multi-step tasks |
| **step-level** | snippet of one recurring step (e.g., "update memory-medium after task") | protocol steps agents get wrong |

## Selection (before EXECUTE phase)

1. Match by frontmatter **tags** (area, pattern family) + task similarity.
2. Inject **1–2 demos maximum** — more dilutes; budget lives in `core/protocols/context-budget.md`.
3. No match ≥ threshold? Inject nothing. A wrong demo is worse than zero-shot.

## Demo format

```markdown
---
tags: [area, pattern-family]
outcome: success | anti-example
source: manual | promoted-instinct | eval-failure
---
# Goal
# Trajectory (condensed ReAct: thought → action → observation)
# Outcome & verification
```

## Anti-examples

Eval failures and recurring errors become `outcome: anti-example` demos — injected alongside a success demo when the task family has a known failure mode ("this looks right but fails because…").

## Provenance

Demos enter the pool by: manual curation · instinct promotion (confidence ≥ threshold + eval pass — see plan F4) · eval failure capture. Every demo carries `source`.
