---
name: pipeline-discipline
description: CI/CD discipline — pipeline structure, credentials, debugging methodology, gates. Tool-agnostic; the CI platform comes from memory-long §stack.
---

# Skill: Pipeline Discipline

Tool-agnostic (GitHub Actions, GitLab CI, Jenkins — from `memory-long §stack`). Complements `ops-dev` instructions (always-on rules); this is the deep-dive.

## Pipeline structure (canonical stages)

`validate` (lint/format/types, fast-fail) → `build/plan` (artifacts or IaC plan) → `gate` (tests, security scan, human approval where required) → `apply/deploy` → `verify` (smoke, health). Each stage fails the pipeline honestly — no `continue-on-error` on gates.

## Credentials

1. **Short-lived identity over static secrets** — OIDC/workload identity federation wherever the platform supports it; static keys are the fallback, not the default.
2. Job permissions declared explicitly and least-privilege (`contents: read` unless proven otherwise).
3. Secrets scoped to the environment that needs them; production secrets never available to PR-triggered runs from forks.

## Debugging methodology (in order)

Pipeline auth failures are almost always one of, in this order: ① missing job **permissions** declaration · ② wrong role/identity ARN or audience · ③ trust condition not matching the repo/branch pattern (verify the exact `sub` claim format) · ④ backend/state store unreachable or under-permissioned. Check the boring things first — read the error, not the vibes.

## Performance & hygiene

Cache dependency stores keyed on lockfile hash · timeout every job (a hung job is a silent cost) · artifacts have retention policies · matrix builds only where variants genuinely differ · re-run flaky jobs is a diagnosis, not a fix — flakiness gets an issue.

## Non-negotiables (mirror of ops-dev instructions)

Never weaken a gate to go green · pin action/image versions · deploy triggers propose, human executes · every pipeline change states its verification (dry-run or which gate proves it).
