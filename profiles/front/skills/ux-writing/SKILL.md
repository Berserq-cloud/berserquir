---
name: ux-writing
description: Microcopy discipline — buttons, errors, empty/loading/success states, alt text. Voice and tone come from the project's memory, not from this skill.
---

# Skill: UX Writing

The **discipline** of interface copy. The project's voice (tone, vocabulary, banned words) lives in `memory-long §conventions` — seeded by `/init`, refined by the humans. This skill is how to structure copy regardless of voice.

## Microcopy patterns

| Surface | Pattern | Never |
|---|---|---|
| Buttons/CTAs | `[imperative verb] [+ object if needed]` — "Send message" · primary CTAs ≤24 chars (one line at 320px) | "Submit", "Click here", exclamation marks |
| Form errors | `[specific cause]. [corrective action].` — "Invalid email. Check the format." | "Error", vague politeness ("Please fill correctly") |
| Empty states | `[context of emptiness] [+ next possible action]` | Dead ends ("Nothing here") |
| Loading | Say **what** is happening — "Validating email…" | "Loading…", "Please wait" |
| Success | `[concrete confirmation]. [next action or link].` — "Message sent. Reply within 48h." | "Success!" (zero context) |
| Alt text | Decorative → `alt=""` · Informative → describe what it **communicates**, not what it is | Inventing text for decorative images |
| ARIA labels | Expand context beyond visible text | Duplicating visible text |

## Rules

1. Every state a component can enter has copy designed for it (error/empty/loading/success are part of the component contract — see `component-patterns`).
2. Copy is content, not decoration: review it like code. A vague error message is a bug.
3. Generic marketing-speak is banned by default (the project's memory may extend the blacklist): "innovative", "seamless", "leverage", "unlock", "empower", "best-in-class", "next-gen".
4. If the project is bilingual, the primary language leads and the mirror follows the same patterns — never machine-translate microcopy without pattern review.
