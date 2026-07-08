---
name: sdd
description: Spec-Driven Development — the PRD/SPECS/TESTS triangle, EARS criteria, governance hierarchy. Load when creating or changing specs, features, or ADRs.
---

# Skill: Spec-Driven Development

Three layers, three owners, one triangle:

| Layer | File | Answers | Owner |
|---|---|---|---|
| WHAT & WHY | `PRD.md` | product intent, personas, principles | product |
| HOW | `SPECS.md` (+ §ADR registry) | architecture, interfaces, decisions | architect |
| VERIFY | `TESTS.md` | pyramid, coverage targets, conventions | qa (definition), execution tiers (authoring) |

## Governance hierarchy (conflict resolution — top wins)

1. `memory-long.md` + active ADRs — the constitution
2. `PRD.md` — requirements
3. `SPECS.md` — architecture
4. `memory-medium.json` — sprint state
5. Skills, then instructions

An agent finding a contradiction between levels stops and escalates — it never picks silently.

## EARS acceptance criteria (every feature)

- `WHEN <event> THE SYSTEM SHALL <behavior>`
- `WHILE <state> THE SYSTEM SHALL <behavior>`
- `IF <condition> THEN THE SYSTEM SHALL <behavior>`

These criteria become the `verification` keys of Sub-Agent Reports downstream — write them checkable.

## Feature specs

New feature → instantiate `core/templates/spec-kit.md` (What / Why / EARS criteria / Dependencies) → register in `memory-medium.json` with `FEAT-YYYY-MM-DD-slug` id.

## ADR flow

Structural decision → architect drafts from `core/templates/adr.template.md` → deliberation if weight demands (`core/protocols/deliberation.md`) → human OK → registry in SPECS §ADR + one-line ref in memory-long. Anchors (`ADR-NNN`) are graph edges — always reference them in commits and specs.
