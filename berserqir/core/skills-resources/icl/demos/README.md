# ICL Demo Pool

Worked examples injected before recurring task types (see `.github/skills/icl/SKILL.md`).

**This pool starts EMPTY by design.** Demos are grown from YOUR project, not shipped generically:

1. **Manual curation** — after a task worth remembering, condense its trajectory here (template below)
2. **Instinct promotion** — recurring patterns from the session journal get promoted (with eval gate)
3. **Eval failures** — failed behaviors become `outcome: anti-example` demos

## Demo template

```markdown
---
tags: [area, pattern-family]
outcome: success | anti-example
source: manual | promoted-instinct | eval-failure
---
# Goal
<one line>
# Trajectory (condensed: thought → action → observation)
<3-8 steps max — resolution over completeness>
# Outcome & verification
<what proved it worked / why it failed (anti-example)>
```

## Rules

- 1–2 demos injected per task, matched by tags — no match ≥ threshold, inject nothing
- Anti-examples ride along when the task family has a known failure mode
- Prune demos that stop matching reality (stale demo = worse than none)
