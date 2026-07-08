---
name: resilience
description: DR/HA discipline — RTO/RPO as requirements, DR tiers, backup verification, failover design. Cloud-agnostic.
---

# Skill: Resilience (DR/HA)

Availability is bought, not wished for. Vendor primitives from `memory-long §stack`; the economics and discipline are universal.

## RTO/RPO come first (and from humans)

**RTO** (how long down) and **RPO** (how much data lost) are *business requirements with price tags* — the human sets them via ALIGN, architecture follows. Designing HA without stated RTO/RPO is over- or under-engineering by luck.

## DR tiers (cost ladder — pick deliberately)

| Tier | RTO | Cost |
|---|---|---|
| Backup & restore | hours-days | $ |
| Pilot light (data replicated, compute off) | tens of minutes | $$ |
| Warm standby (scaled-down live copy) | minutes | $$$ |
| Active-active (multi-region) | ~zero | $$$$ + complexity tax |

Multi-AZ is the **floor** for production. Multi-region is a cost/complexity decision that goes through architect + fin-ops with numbers.

## The backup law

**A backup that has never been restored does not exist.** Restore drills are scheduled work (calendar, not intention) · backups live in a different failure domain than the source (account/region) · retention matches compliance, verified by policy · state files and databases both count.

## Failover design

Health checks probe **real dependency chains** (DB query, not TCP port) · failover automated, **failback manual** (flapping is worse than a controlled recovery) · timeouts/retries/circuit breakers at every external dependency — map what happens when each dependency dies · single-instance anything in prod = documented, accepted risk with an owner.

## Verification

Every resilience claim has a test: kill an instance, drop an AZ (game day when maturity allows) · DR runbook exists, is versioned, and names humans · report residual risk honestly (what we do NOT survive).
