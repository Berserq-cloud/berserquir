---
description: Backend area rules — auto-applied when editing server routes, APIs and schemas.
applyTo: "**/server/**,**/api/**"
---

# Backend Rules (always-on for matching files)

1. Validation at the boundary: every input through a schema before logic; types derive from schemas.
2. Consistent error shape `{ error: { code, message } }` — internals never leak to responses.
3. Status codes per convention (see `api-design` skill); resources plural, verbs only for true actions.
4. Secrets via env only; authz per route; inputs treated as hostile by default.
5. Auth, payments, deletion, migrations: **never fast-path** — full loop + security gate, regardless of size.
6. Retryable mutations idempotent; public endpoints rate-limited.
7. Error paths tested, not just happy path.
8. Deep dive on demand: `.github/skills/api-design`.
