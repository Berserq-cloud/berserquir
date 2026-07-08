---
description: Infrastructure area rules — auto-applied when editing IaC files. Tool-agnostic; specifics from memory-long §stack.
applyTo: "**/*.tf,**/*.tfvars,**/k8s/**,**/helm/**,**/*.yaml,**/*.bicep,**/Pulumi.*"
---

# Infrastructure Rules (always-on for matching files)

1. ⛔ **Agents run syntax validation/formatting/init ONLY. Preview/apply/destroy operations (e.g., `terraform plan|apply|destroy`, `pulumi preview|up`) are human-only** — write IaC, ask the human to run the preview, analyze pasted output.
2. Org conventions (naming, tagging, backends) come from **memory-long §conventions** — check before creating any resource; never invent names.
3. Every resource tagged per the project's tagging strategy; untagged resources fail review.
4. State is sacred: never edit state files, never suggest force flags, backend config changes need architect sign-off.
5. IAM/network/deletion changes: **never fast-path** — full loop + security gate, regardless of size.
6. Modules over copy-paste: third similar resource block → propose a module (via sr-infra).
7. Costs surfaced: new resources include an estimated monthly cost note in the report (coordinate with fin-ops when significant).
