---
name: component-patterns
description: Framework-agnostic component discipline — typed contracts, composition, environment safety, cleanup. Load for any UI component work.
---

# Skill: Component Patterns

**Stack-agnostic by design.** Framework idioms (how to declare props, extract logic, guard environments) come from `memory-long §stack` and the codebase's existing patterns — this skill defines the discipline that applies to all of them.

## Non-negotiables

- **Typed contracts**: component inputs/outputs fully typed in the project's type system — no untyped or `any` boundaries
- **Environment safety**: browser-only APIs (`window`, `document`, observers) only behind the framework's client-side guards — components must not break server/static rendering
- **Cleanup mirrors setup**: every listener/observer/timer/subscription registered gets torn down in the framework's unmount/dispose phase
- **Data down, events up**: never mutate inputs; communicate upward through the framework's event/callback idiom

## Patterns

- **Single responsibility**: >~150 lines of markup or >3 concerns → decompose (section → blocks → atoms)
- **Logic extraction**: logic touching >1 lifecycle phase or shared by ≥2 components → extract to the framework's reuse unit (composable/hook/store per stack)
- **State locality**: local state first; app-wide state additions need an ADR
- **Composition over configuration**: prefer slots/children for content variation; props carry data, not markup

## Verification

Project's type-check passes clean · server/static render produces no environment errors or hydration mismatches · interactive elements are focusable with semantic markup (a11y floor).
