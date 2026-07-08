---
name: motion
description: Motion & animation discipline — purpose, performance, reduced-motion. Load when work involves animation, transitions or scroll effects.
---

# Skill: Motion

Mechanism-agnostic (CSS, WAAPI, or the project's animation library — see `memory-long §stack`).

## Non-negotiables

- **`prefers-reduced-motion` is mandatory**: every animation has a reduced/disabled variant — not optional, not "later"
- **Compositor-only properties**: animate transform/opacity; never layout properties (width/height/top/left trigger reflow)
- Motion has a **job** (orient, connect, confirm, direct attention) — decorative motion without a job is noise; cut it

## Patterns

- **Durations**: micro-interactions 100–200ms · transitions 200–400ms · anything >600ms needs a reason · easing: enter = decelerate, exit = accelerate
- **Scroll-driven effects**: progressive enhancement — content fully accessible without them; never hijack scroll speed
- **Loading states**: skeletons over spinners for >300ms waits; no layout shift when content lands (CLS budget binds)
- **Choreography**: one hero motion per view; supporting elements follow with slight stagger — everything moving = nothing moving

## Verification

Reduced-motion variant verified by toggling the OS setting · no dropped frames on mid-range hardware (DevTools performance) · CLS unchanged.
