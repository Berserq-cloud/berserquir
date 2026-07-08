---
name: api-design
description: REST/API conventions — resource design, status codes, error shapes, validation-at-boundary. Load for any endpoint work.
---

# Skill: API Design

## Non-negotiables

- **Validation at the boundary**: every input crosses a schema (using the project's validator — see memory-long §stack) before touching logic — body, params, query, headers. Types derive FROM schemas, never parallel to them
- **Consistent error shape** project-wide: `{ error: { code, message, details? } }` — codes stable (machine-readable), messages human-readable, internals never leaked
- Secrets/config via env, never inline; authz checked per route, not per router

## Conventions

- **Resources**: plural nouns (`/users/:id/orders`), verbs only for true actions (`/auth/login`)
- **Status codes**: 200 read · 201 create (+Location) · 204 delete · 400 validation · 401 unauthenticated · 403 unauthorized · 404 not-found-or-hidden · 409 conflict · 422 semantic · 429 rate-limited
- **Pagination**: cursor-based by default; `limit` capped server-side; total counts only when cheap
- **Versioning/breaking changes**: additive changes free; removals/renames need deprecation window + ADR

## Verification

Contract documented (schema is the doc) · error paths tested, not just happy path · rate limits on public endpoints · idempotency on retryable mutations.
