---
name: data-safety
description: Data layer discipline — migrations, transactions, integrity, query safety. Load for any schema or data-access work.
---

# Skill: Data Safety

Datastore-agnostic — engine and ORM/driver come from `memory-long §stack`.

## Non-negotiables

- **Migrations are forward-only and reversible**: every migration ships with a tested rollback; destructive migrations (drop/rename) use expand-contract (add new → migrate data → remove old, separate deploys)
- **Transactions around invariants**: multi-write operations that must succeed together are transactional — partial state is corruption
- **No data deletion without explicit human sign-off** — soft-delete by default; hard deletes are migrations with rollback plans
- Parameterized queries only — string-built queries are injection (security gate blocks)

## Patterns

- **N+1 vigilance**: loops issuing queries → batch/join/preload per the stack's idiom
- **Indexes follow queries**: new query patterns on large tables come with index analysis in the report
- **Constraints in the database**, not only in app code — the DB is the last line of integrity (FKs, unique, checks)
- **PII discipline**: fields classified at schema time; PII never in logs; retention rules from memory-long §constraints

## Verification

Migration up+down tested against realistic data volume · transaction boundaries reviewed on multi-write paths · query plans checked for new hot-path queries.
