---
description: CI/CD area rules — auto-applied when editing pipelines, container builds and release configs. Tool-agnostic; specifics from memory-long §stack.
applyTo: "**/.github/workflows/**,**/Dockerfile*,**/*.dockerfile,**/docker-compose*,**/compose.*.yml,**/Jenkinsfile,**/.gitlab-ci.yml,**/.circleci/**"
---

# CI/CD Rules (always-on for matching files)

1. ⛔ **Never weaken a quality gate to make a pipeline green** — fix the pipeline or the code, not the gate. Removing/skipping tests, lowering coverage thresholds or adding `continue-on-error` to gates requires human sign-off.
2. Workflow files are **protected by config-protection** — edits require the human-authorized override (`BERSERQIR_CONFIG_ALLOW=1`), keeping the audit trail.
3. Secrets via the platform's secret store only — never inline in pipeline files, never echoed in logs. Least-privilege tokens (scope job permissions explicitly).
4. Pin action/image versions (digest or exact tag) — no floating `latest` in anything that deploys.
5. Production deploy triggers: **propose, never execute without explicit human OK** (same spirit as git-safety).
6. Containers: multi-stage builds, non-root user, no secrets in layers or build args that persist.
7. Every pipeline change states its verification: dry-run result, or which gate proves it works (coordinate with qa via dev-ops handoff).
8. Deploy/rollback paths documented next to the workflow — a deploy without a rollback note fails review.
