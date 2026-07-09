---
name: model-lifecycle
description: ML/LLM operations discipline — versioned model/prompt artifacts, eval gates, drift and cost monitoring. Minimal MVP scope (expands in F4).
---

# Skill: Model Lifecycle

MLOps/LLMOps discipline, deliberately minimal (D6). Platform tooling from `memory-long §stack`.

## Everything is a versioned artifact

**Models, prompts, datasets, eval sets — all versioned, all reproducible**: a prompt in production has a version and a changelog exactly like code (a prompt edit is a deploy) · training/fine-tune runs record data version + params + code sha — "we can't reproduce the model" is a SEV-grade statement · model/prompt + config pinned together (temperature changes behavior as much as wording).

## Eval gates (promotion discipline)

**No model/prompt reaches production without passing its eval set** — same philosophy as the harness's own evals: behavioral checks + anti-checks (does it refuse what it should refuse?) · eval sets are versioned and grow from production failures (a bad output becomes a test case — the ICL anti-example pattern) · A/B or shadow comparisons for meaningful changes; "it looks better" is not a promotion criterion.

## Production monitoring (the drift trio)

**Quality drift**: output quality sampled and scored on a schedule, not just at launch · **data drift**: input distribution shifts silently — monitor feature/prompt-length/language distributions · **cost & latency**: per-inference cost and p95 latency are budgets (coordinate with `cost-discipline` — LLM spend is the fastest-growing waste category); caching and model-tier routing are the levers.

## Safety rails

PII in training/prompt data follows `data-safety` classification · user inputs are hostile by default — prompt injection surface documented per integration · model outputs that trigger actions (tool calls, writes) go through the same guardrails as human-authored actions, no exemptions.

## Verification

Rollback for models/prompts = redeploy previous version (artifacts make it one command — see `release-engineering`) · report includes eval delta vs current production · incidents follow `incident-response` with the model version in the timeline.
