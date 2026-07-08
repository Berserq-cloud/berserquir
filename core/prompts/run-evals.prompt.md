---
name: run-evals
description: Run the behavioral eval suite (all or a single eval) with pass@3 majority grading and recorded results.
agent: qa
---

# /run-evals — Behavioral Eval Runner

Usage: `/run-evals all` · `/run-evals e02` · `/run-evals e01 e04 e05`

## Process

1. **Load** the eval spec(s) from the installed suite (`core/evals/eNN-*.md`).
2. **Run each scenario 3×** against the currently installed configuration (agents, instructions, protocols as compiled). Each run is independent — no shared state between runs.
3. **Grade** per the eval's grader: deterministic checks are mechanical (schema, exit codes, header greps); LLM-judge checks follow the rubric in the eval file, no improvisation.
4. **Run the anti-check** — an eval without its anti-check is half-run (a harness that fast-paths everything passes e01's main check and fails its purpose).
5. **Verdict:** majority 2/3. Record per-run results, not just the verdict.

## Recording

Append to `.berserqir/evals/results/YYYY-MM-DD.md`:

```markdown
| eval | run1 | run2 | run3 | anti-check | verdict | notes |
|------|------|------|------|-----------|---------|-------|
| e02  | pass | pass | fail | pass      | PASS    | run3: ALIGN missing "Will NOT do" |
```

## After failures

A failed eval means the **harness config** regressed, not the code: diff recent changes to agents/instructions against the failing behavior · record the failing trajectory as an ICL anti-example · fix config → re-run the single eval → only then re-run `all`.
