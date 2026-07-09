---
name: design-patterns
description: Code structure discipline — layering, dependency direction, composition, when patterns earn their place. Load for any non-trivial backend structure decision.
---

# Skill: Design Patterns

Language idioms from `memory-long §stack`. The discipline: **patterns serve problems — a pattern without a named problem is decoration.**

## Layering (the default shape)

`boundary` (transport: routes/handlers/consumers — thin, validates, translates) → `domain/service` (business logic, no transport or storage details) → `data` (persistence, external clients). **Dependencies point inward only** — domain never imports transport or ORM specifics. A route handler with business logic in it fails review.

## Rules of construction

1. **Composition over inheritance** — inheritance for true is-a with stable contracts (rare); everything else is composition. Deep hierarchies are future rewrites.
2. **Inject dependencies** (constructor/params), don't reach for globals — this is what makes `testing-discipline`'s "mock only boundaries" possible.
3. **Small interfaces at the seams**: depend on the few methods you use, not the whole client. The seam is where you'll swap/fake later.
4. **Domain models own their invariants** — an entity that can be constructed in an invalid state is a bug factory; validate at construction, make illegal states unrepresentable where the type system allows.
5. Errors are part of the design: expected failures are values/typed results at domain level; exceptions/panics for the truly exceptional (boundary translates — see `api-design` error shape).

## The abstraction ledger (anti-pattern-itis)

- **Rule of three**: abstract on the third occurrence, not the first — premature abstraction costs more than duplication.
- A pattern must be nameable by the problem: "we need one instance coordinating access" → fine; "let's add a factory in case" → no.
- **Bans**: god objects/managers (`utils.ts` as a landfill counts) · circular dependencies (restructure, never hack around) · anemic domain + fat services when there IS domain logic · abstraction layers with exactly one implementation and no seam justification.

## Verification

New structure explained in one sentence naming the problem it solves · dependency direction check (imports flow inward) · reviewer can trace request → boundary → domain → data without jumping layers.
