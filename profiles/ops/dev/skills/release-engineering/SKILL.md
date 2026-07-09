---
name: release-engineering
description: Release discipline — versioning, feature flags, progressive delivery, rollback. The deploy-side counterpart to pipeline-discipline (CI-side).
---

# Skill: Release Engineering

`pipeline-discipline` gets code to deployable; this is how it reaches users without taking them down. Platform mechanisms from `memory-long §stack`.

## Versioning & artifacts

Every release is an **immutable, identified artifact** (semver or date+sha) — "deploy latest" is not a version · the artifact that passed the gates is the artifact that ships (rebuilding for prod invalidates the testing) · changelog generated from conventional commits (anchors make it free — see `git-workflow`).

## Progressive delivery (pick per risk)

**Rolling** (default, cheap) → **blue-green** (instant cutover + instant rollback, 2x cost during deploy) → **canary** (percentage-based, needs real observability to judge — see the RED metrics) · database changes decouple from code deploys via **expand-contract** (see `data-safety`) — a rollback that can't run against the new schema is not a rollback.

## Feature flags

Deploy ≠ release: ship dark, enable progressively · every flag has an **owner and an expiry** — flags without cleanup dates become permanent config nobody understands (flag debt = DEBT-*) · kill switches for risky paths are flags designed in advance, not hotfixes.

## Rollback (the non-negotiable)

**No deploy without a tested rollback story** — roll back the artifact, roll forward the data (expand-contract makes this possible) · rollback is a button/one command, not a runbook of manual steps · after any rollback: incident note + the gate that should have caught it (feeds `incident-response` postmortem).

## Verification

Release PRs state: strategy chosen + why · rollback command · flags involved + owners · prod deploy triggers remain propose-only, human executes (ops-dev instructions rule).
