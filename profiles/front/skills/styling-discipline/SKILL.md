---
name: styling-discipline
description: Styling discipline for any mechanism (utility framework, CSS-in-JS, vanilla) — tokens, states, responsive, no ad-hoc values.
---

# Skill: Styling Discipline

**Mechanism-agnostic.** Whether the project uses a utility framework, CSS-in-JS or vanilla CSS custom properties (see `memory-long §stack`), the discipline is the same.

## Non-negotiables

- **Design tokens are the single source of truth** — colors, spacing, type scale come from the project's token system, never ad-hoc values
- **Name ≠ Value rule**: token names lie (a token named `accent-lime` may resolve to orange). ALWAYS verify the actual value in the token source before using — never trust the name
- **No one-off overrides**: an arbitrary value (`347px`, `#3a7bd5`) means a missing token — escalate to the design-system owner, don't inline it

## Patterns

- **Mobile-first**: base styles = smallest viewport, layer breakpoints upward; test at 375×812 minimum
- **Full state coverage**: interactive elements style hover + focus-visible + active + disabled — click/tap is primary, hover is progressive enhancement
- **Extraction threshold**: the same style combination repeated ≥3× → extract via the project's reuse mechanism (component, variant, utility class)
- **Dark mode / theming**: only through the token system's theming layer, never conditional literals

## Verification

Zero inline style attributes · zero style values not traceable to a token · contrast meets WCAG AA (4.5:1 text) · states verified by interaction, not assumption.
