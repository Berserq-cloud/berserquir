---
name: incident-response
description: Incident discipline — severity, containment-first, comms, blameless postmortems. Load when production is (or might be) on fire.
---

# Skill: Incident Response

Universal discipline; paging/tooling from `memory-long §stack`. The agent's role in incidents: **assist diagnosis, propose actions — destructive/prod mutations remain human-executed** (guardrails do not relax under pressure; that's when they matter most).

## Severity first (30 seconds, not a debate)

**SEV1** users down/data at risk — all hands, comms cadence · **SEV2** degraded with workaround — owner + updates · **SEV3** contained annoyance — ticket it. When unsure between two levels, pick the higher — downgrading is cheap, upgrading late is not.

## The order of operations

**Contain → diagnose → fix → learn.** Stop the bleeding first (rollback, kill switch, scale, failover — this is why `release-engineering` rollbacks are one command) · diagnosis uses telemetry (correlation IDs earn their keep now — see `observability`), not guesswork restarts · **no fix without a hypothesis** — "restart and hope" without a theory destroys the evidence.

## During

One **incident commander** (decisions), one scribe (timeline — timestamps of actions/observations, raw and unpolished) · comms on a cadence (even "no update yet" at the promised time) · changes during incident are minimal and reversible — the heroic 500-line hotfix at 3am is tomorrow's SEV1.

## Blameless postmortem (SEV1/2 always)

Within days, not weeks · timeline → contributing factors (plural — single root cause is almost always a simplification) → **action items with owners and dates** · blameless means systems-focused: "the deploy lacked a canary" not "X deployed carelessly" · every postmortem feeds the harness: new guardrail/hook candidate, eval anti-check, or memory-long constraint — an incident that doesn't harden the system will repeat.

## Verification

Runbooks exist for the top failure modes and are tested (game days — see `resilience`) · postmortem action items tracked as DEBT-*/FEAT-* anchors, not lost in docs · incident metrics honest: MTTR trends, repeat-incident rate.
