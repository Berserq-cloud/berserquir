---
name: infra-security
description: Infrastructure security discipline — identity, encryption, secrets, audit. Perimeter/platform counterpart to security-hardening (app-side).
---

# Skill: Infrastructure Security

Platform-side security. App-side lives in `security-hardening` (ops/sec); the `security` gate reviews both. Vendor mechanisms from `memory-long §stack`.

## Identity is the perimeter

1. **Least privilege as a process, not an event**: start narrow, widen with justification — never start with `*` "to fix later" (later never comes; the hook-protected configs philosophy applies to IAM too).
2. Roles/identities over long-lived users and keys · short-lived credentials (OIDC/workload identity) wherever supported · human access via SSO+MFA, break-glass documented and alarmed.
3. Service identities are per-service, never shared — shared identity = unattributable audit trail.

## Encryption

At rest and in transit are **defaults, not features** — a resource created without encryption fails review · customer-managed keys where compliance requires (key rotation documented) · TLS termination point is a deliberate, documented choice.

## Secrets in infrastructure

Secret manager references in IaC, never literal values (secret-scan hook is the last line) · **state files contain secrets** — state access is secret access, scope it accordingly (see `state-discipline`) · rotation is automated or scheduled, never "when we remember".

## Audit & detection

Audit logging on, centralized, **immutable** (write-once storage or separate account) · logs of the security tooling itself are protected from the identities they watch · config drift on security resources = incident, not chore (alert, don't batch).

## Escalation triggers (never fast-path)

IAM policy changes · network exposure · encryption/key changes · audit logging changes — full loop + security gate regardless of diff size (mirrors infra instructions rule 5).
