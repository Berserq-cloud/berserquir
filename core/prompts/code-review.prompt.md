---
name: code-review
description: Structured code review against the project's installed disciplines, conventions and active ADRs. Runs read-only.
agent: qa
---

# /code-review — Structured Review

Read-only review of a change set. Scope (in order of preference): the diff the user points at · staged changes · current branch vs main. State the scope before reviewing.

## Step 1 — Load the ruler

1. `memory-long.md` §conventions + §constraints and active ADRs — the constitution outranks personal taste.
2. The **instructions** matching the touched paths (they are the always-on rules the author was bound by).
3. The **skills** for the touched areas — review against the discipline, don't restate it: front → `component-patterns`, `styling-discipline`, `accessibility`, `anti-slop`, `ux-writing` · back → `api-design`, `data-safety`, `observability`, `async-jobs`, `caching` · infra → `state-discipline`, `network-design`, `infra-security`, `resilience` · all → `testing-discipline`, `git-workflow`.

## Step 2 — Universal checks (every diff, any stack)

- **Boundary validation**: new inputs cross a schema before logic
- **Error paths**: failure cases handled AND tested — not just the happy path
- **Tests**: acceptance criteria covered; refactors don't break behavior-based tests; no `.skip`/`.only` left behind
- **Secrets/PII**: nothing sensitive in code, logs or fixtures
- **Scope discipline**: the diff does what the task says — flag drive-by changes (even good ones) as separate work
- **Anchors**: commits/branch reference the right `FEAT-*`/`ADR-*`/`DEBT-*` (graph edges — see `git-workflow`)
- **Conventions**: naming/structure per memory-long, not per the author's habit

## Step 3 — Verdict (structured, always)

| Severity | Meaning |
|---|---|
| 🔴 Blocker | Violates constitution/ADR/guardrail, missing tests on changed behavior, security issue → **do not merge** |
| 🟡 Major | Discipline violation with real cost — fix before or immediately after merge (tracked as DEBT-*) |
| 🔵 Minor | Improvement worth doing, author's call |
| ⚪ Nit | Taste — explicitly droppable |

End with: verdict (approve / approve-with-majors / request-changes) · one-line rationale · anything that belongs in memory (new pattern observed, debt created). Review is a **gate**: never fix the code yourself — report, the implementer fixes (see sub-agent-report protocol).
