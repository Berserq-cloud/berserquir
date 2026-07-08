---
name: cost-discipline
description: FinOps discipline — cost allocation, budgets, commitment analysis, unit economics. Cloud-agnostic; vendor tooling from memory-long §stack.
---

# Skill: Cost Discipline

Cloud-agnostic (AWS/Azure/GCP mechanisms come from `memory-long §stack`). The fin-ops role's deep-dive: analyze broadly, edit narrowly, **recommend with numbers**.

## FinOps maturity (know where the project is)

**Visibility** (allocation works, costs attributable) → **Optimization** (rightsizing, commitments, waste removal) → **Governance** (budgets enforce, policies prevent). Don't optimize what you can't yet see — allocation first.

## Cost allocation (the foundation)

1. **Mandatory tag/label set** on every resource: project, environment, owner, cost-center (exact keys from `memory-long §conventions`). Untagged = unattributable = invisible spend.
2. Enforcement is **policy, not discipline**: tag policies / required-label org policies reject non-compliant resources at creation — humans forget, policies don't.
3. Billing export to a queryable store — cost questions answered with queries, not console screenshots.

## Budgets & alerts

Per environment AND per service · thresholds at 50/80/100% forecast · alerts route to owners (from tags), not a graveyard channel · budget **actions** (auto-stop non-prod, block scale-up) only in non-production without human gate.

## Commitments (RI/Savings Plans/CUDs)

Analyze before buying: coverage % and utilization % of existing commitments first · commit to the **stable baseline**, never the peak · start with shortest terms until usage history justifies longer · re-evaluate quarterly.

## Recommendation format (non-negotiable)

`current cost → proposed change → estimated delta → risk`. A rightsizing suggestion without numbers is an opinion. Reliability trade-offs (HA/DR reductions) always surface explicitly and go to architect.

## Waste patterns (check routinely)

Orphaned volumes/IPs/snapshots · oversized defaults never revisited · non-prod running 24/7 (schedule it) · storage on hot tiers with cold access patterns · anomaly detection on, with owner-routed alerts.
