---
name: system-design
description: System architecture discipline — decomposition, boundaries, communication, scale, failure design. Load for architectural work; decisions land as ADRs.
---

# Skill: System Design

The area-level companion to the `architect` role — sr-back proposes with this discipline, architect ratifies via ADR. Infra counterpart: `platform-architecture`.

## Decomposition (the expensive decision)

1. **Modular monolith is the default** — clear internal module boundaries, enforced interfaces. Distribution (services) must be justified by a *named* forcing function: independent scaling, independent deploy cadence, team boundaries, isolation requirements. "Microservices because modern" fails deliberation.
2. Split by **domain boundary** (bounded context), never by technical layer — a "database service" is an anti-pattern; an "orders service" owns its data.
3. Every network boundary you add buys you: latency, partial failure, eventual consistency, versioned contracts, ops burden. Write that cost into the ADR before splitting.

## Communication

Sync (request/response) for queries the caller must wait on · async events (see `async-jobs`) for facts other contexts react to · **eventual consistency is a product decision** — surface it to the human ("the count may lag by seconds — acceptable?"), never silently assume.
Contracts are versioned and additive-first (see `api-design` §versioning); consumers tolerate unknown fields.

## Scale (in order)

Measure first (see `observability` — p95/p99, not averages) → stateless services scale out; state is the real bottleneck → push state to stores built for it → cache deliberately (see `caching`) → **estimate with numbers before architecting**: back-of-envelope QPS/storage/growth in the ADR. Optimizing for imagined scale fails review; so does ignoring stated scale requirements from the PRD.

## Failure is the design input

Everything fails: every remote call has a timeout · retries with budgets (idempotency prerequisite — see `async-jobs`) · circuit breakers on flaky dependencies · **graceful degradation designed per feature** (what does the user see when X is down?) · bulkheads: one dependency's failure must not exhaust shared resources (pools, threads).

## Verification

Architectural proposals carry: the forcing function · the cost accepted · back-of-envelope numbers · the failure story · rollback path. Goes to deliberation when alternatives are genuine; ADR always; human decides (never fast-path — this is the architectural tier by definition).
