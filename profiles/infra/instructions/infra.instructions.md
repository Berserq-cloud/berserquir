---
description: Infrastructure area rules — auto-applied when editing IaC files. Tool-agnostic; specifics from memory-long §stack.
applyTo: "**/*.tf,**/*.tfvars,**/k8s/**,**/helm/**,**/*.yaml,**/*.bicep,**/Pulumi.*"
---

# Infrastructure Rules (always-on for matching files)

1. ⛔ **Agents run syntax validation/formatting/init ONLY. Preview/apply/destroy operations (e.g., `terraform plan|apply|destroy`, `pulumi preview|up`) are human-only** — write IaC, ask the human to run the preview, analyze pasted output.
2. Org conventions (naming, tagging, backends) come from **memory-long §conventions** — check before creating any resource; never invent names.
3. Every resource tagged per the project's tagging strategy; untagged resources fail review.
4. State is sacred: never edit state files, never suggest force flags, backend config changes need architect sign-off. State access = secret access.
5. IAM/network exposure/encryption/deletion changes: **never fast-path** — full loop + security gate, regardless of diff size.
6. Modules over copy-paste: third similar resource block → propose a module (via sr-infra). Consume modules by pinned version.
7. Costs surfaced: new resources include an estimated monthly cost note in the report (coordinate with fin-ops when significant).
8. Network deny-by-default, both directions — every allow rule names its purpose; workloads never carry public IPs directly; egress is allowlisted, not open.
9. Encryption at rest and in transit are **defaults, not features** — an unencrypted resource fails review.
10. Least privilege as a process: never `*` permissions "to fix later" · roles/identities over long-lived keys · service identities per-service, never shared.
11. Production floor is multi-AZ; any single-instance prod resource is a documented, owned risk. Multi-region = architect + fin-ops decision with numbers.
12. A backup that has never been restored does not exist — restore verification is scheduled work, and backups live in a different failure domain.
13. Structural changes (new account/region, backend migration, breaking module bump) = architectural tier: ADR + architect, never unilateral.

Deep dives on demand: `.github/skills/state-discipline`, `network-design`, `infra-security`, `resilience`, `platform-architecture`.
