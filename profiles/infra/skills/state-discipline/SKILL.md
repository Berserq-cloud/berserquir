---
name: state-discipline
description: IaC state & module discipline — state hygiene, module boundaries, drift. Load for any IaC structural work.
---

# Skill: State Discipline (IaC)

Tool-agnostic (Terraform/OpenTofu, Pulumi, or the project's tool — `memory-long §stack`). The execution restriction binds always: **preview/apply/destroy are human-only**.

## State hygiene

- State is **never** edited by hand or by agent — state surgery (`mv`, `rm`, import) is proposed as exact commands for the human, with a backup step first
- Remote backend + locking from day one (backend config from `memory-long §conventions`)
- One state per blast-radius boundary (env/component) — monolithic state = monolithic failure

## Module discipline

- **Rule of three**: third similar resource block → module proposal (sr-infra)
- Modules expose intent, not internals: few required inputs, sane defaults, documented outputs · versioned/pinned when shared across repos
- No module reaches into another's resources — cross-boundary needs go through outputs/data sources

## Drift & change safety

- Preview output (pasted by the human) is **read fully** before advising apply — unexpected replaces/destroys stop the flow and escalate
- `create_before_destroy` for anything stateful or serving traffic · destructive changes follow expand-contract across applies
- Changes that touch >10 resources in preview → deliberation-weight check before proceeding

## Verification

Syntax validation + format clean · preview analyzed line-by-line (adds/changes/destroys accounted for) · cost note for new resources (fin-ops threshold).
