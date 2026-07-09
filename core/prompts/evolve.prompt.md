---
name: evolve
description: Cluster mature instincts (≥3 related, confidence ≥0.7) into a generated project skill — eval-gated, human-approved (ALIGN).
---

# /evolve — Instinct → Skill Promotion

Rules: `core/protocols/instincts.md` §Promotion. This is where the harness grows skills from YOUR codebase.

## Process

1. **Cluster** — read `.berserqir/memory/instincts.json`; group related `active` instincts (≥ 0.7) by scope/theme. A cluster needs **≥ 3**; fewer → report "not ready" with what's missing, write nothing, stop.
2. **Draft** — write the skill in SKILL.md format: name, description, dense body rules citing the source instincts as provenance. **Dual calibration:** the instincts shape the content (the project), `human-profile.md` shapes the depth (Learn mode = didactic with the why, Productivity = dense rules only).
3. **Eval gate** — derive a scenario eval from the cluster (what behavior must change?) and run it pass@3 against the draft. Fail → record the draft as an ICL anti-example (`core/skills-resources/icl/demos/`), report, stop.
4. **ALIGN** — present the draft + eval results to the human. **Nothing is written without an explicit OK.**
5. **Materialize** — on OK: write `core/skills/<id>/SKILL.md` with a provenance header (`<!-- grown from INST-… by /evolve on YYYY-MM-DD -->`) · mark source instincts `status: promoted` + `promotedTo` · suggest wiring (which agents should list the new skill).

## Never

- Skip the human OK — step 4 is a hard gate, same as any ALIGN.
- Promote guardrail-overlapping content — guardrails are law, not skills.
- Delete source instincts — `promoted` keeps the audit trail.
- Ship a generic-best-practice skill — if it isn't specific to this project, it doesn't come from instincts.
