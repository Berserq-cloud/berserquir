---
name: platform-architecture
description: Platform structure discipline — environment strategy, account segmentation, landing zone, module composition. Cloud-agnostic.
---

# Skill: Platform Architecture

How the platform is *organized* — the layer above individual resources. Structural changes go through architect + ADR (never unilateral).

## Blast radius drives segmentation

Accounts/projects/subscriptions are the strongest isolation boundary — segment by it: separate prod from non-prod at the **account** level, not just tags · one workload's compromise or quota exhaustion must not touch another's · billing boundaries double as cost-allocation boundaries (see `cost-discipline`).

## Landing zone before workloads

Identity (SSO, role structure) · central logging/audit · network backbone (see `network-design`) · guardrails (org policies: deny public buckets, require encryption/tags) — these exist **before** the first workload lands. Retrofitting governance is 10x the cost.

## Environment strategy

Dev/QA/prod have the **same topology, different sizes** — parity is what makes QA predictive (a QA env that differs structurally from prod tests nothing) · promotion between envs = same IaC, different variable sets — never divergent code branches per env · ephemeral preview environments where the platform supports them cheaply.

## Module composition

Modules are **versioned contracts**: semantic versions, documented inputs/outputs, changelog · third similar resource block → propose a module (instructions rule 6) · consume pinned versions, upgrade deliberately · shared-services vs per-app duplication is an explicit trade-off (state it in the ADR, don't drift into it).

## Evolution

Structural changes (new account, new region, backend migration, breaking module bumps) = architectural tier: deliberation where alternatives are genuine, ADR always, human decides · the codemap/graph reflects platform structure — update on change (memory-sync ritual).
