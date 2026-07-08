---
name: performance-cwv
description: Core Web Vitals budgets and frontend performance discipline. Load when work affects rendering, assets or interactivity.
---

# Skill: Performance (Core Web Vitals)

## Budgets (defaults — memory-long §constraints overrides)

| Metric | Budget | Owner action on breach |
|---|---|---|
| LCP | ≤ 2.5s | block merge, investigate |
| INP | ≤ 200ms | block merge |
| CLS | ≤ 0.1 | block merge |
| JS bundle (route) | ≤ 170KB gz | justify or split |

Budget changes are ADRs (architect) — an agent never relaxes a budget to pass.

## Patterns

- **Images**: explicit width/height (CLS) · modern formats · lazy-load below the fold, eager+preload the LCP element
- **JS**: dynamic import for below-fold/interaction-gated components · no polyfills for evergreen targets · third-party scripts deferred and justified
- **Fonts**: `font-display: swap` + preload critical faces + subset
- **Animations**: transform/opacity only (compositor) — never animate layout properties; `prefers-reduced-motion` is mandatory, not optional
- **Rendering**: prefer server/static rendering where the stack offers it; lazy/deferred hydration for interactive widgets

## Verification

Lighthouse CI against budgets on changed routes · no long tasks >50ms introduced · bundle diff reviewed when deps change.
