---
name: testing-discipline
description: Universal testing discipline — pyramid, test quality, what never to mock. Load when writing or reviewing tests in any stack.
---

# Skill: Testing Discipline

Stack-agnostic: frameworks come from `memory-long §stack`; targets from `TESTS.md`. This is the discipline layer.

## Non-negotiables

- **Test behavior, not implementation** — a refactor that preserves behavior must not break tests; if it does, the test was wrong
- **EARS criteria map to tests**: every acceptance criterion of a feature has at least one test asserting it
- Failing test first for bug fixes (reproduce → fix → green) — a fix without a regression test is half a fix
- **Never**: skipped tests left behind (`.only`/`.skip`), assertions on internals, test-order dependence, weakening coverage configs to pass (hook-enforced)

## Pyramid (defaults — TESTS.md overrides)

Unit ~70% (fast, isolated, logic) · Integration ~20% (boundaries: API contracts, DB access) · E2E ~10% (critical user paths only — expensive, flaky-prone).

## What never to mock

The unit under test · the project's type system · pure functions · time/randomness (inject instead). Mock only true boundaries: network, filesystem, third-party services, clocks.

## Quality bar

Each test: one behavior, named as a sentence (`rejects expired tokens`), arrange-act-assert visible, failure message diagnosable without reading the test body.
