---
name: accessibility
description: Accessibility discipline (WCAG 2.1 AA floor) — semantics, keyboard, contrast, screen readers. Load for any UI work.
---

# Skill: Accessibility

WCAG 2.1 AA is the **floor**, not the target. Mechanism-agnostic — applies to any UI stack.

## Non-negotiables

- **Semantic HTML first**: button = `<button>`, navigation = `<nav>` — ARIA is a repair tool, not a replacement (`no ARIA is better than bad ARIA`)
- **Keyboard parity**: everything clickable is focusable and operable via keyboard; focus order follows visual order; focus-visible styled; no traps
- **Contrast**: 4.5:1 text, 3:1 large text/UI components — verified against actual token values (Name ≠ Value)
- `prefers-reduced-motion` respected on all animation (shared rule with motion skill)

## Patterns

- Images: alt text meaningful or explicitly empty (`alt=""` for decorative) · Forms: label every input, errors linked via `aria-describedby`, never color-only signaling · Dynamic content: `aria-live` for async updates (polite unless critical) · Modals: focus captured, restored on close, Escape works · Touch targets ≥44×44px

## Verification

Keyboard-only walkthrough of the changed flow · automated scan (axe-class) clean on changed pages · zoom 200% doesn't break layout · screen-reader smoke on new interactive patterns.
