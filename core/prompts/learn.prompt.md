---
name: learn
description: Extract instinct candidates from the session journal — reinforce repeats, decay contradictions, expire stale ones. Writes .berserqir/memory/instincts.json; may propose one ICL demo and human-profile updates (both human-gated).
---

# /learn — Instinct Extraction

The rules live in `core/protocols/instincts.md` — load it first. Nothing here relaxes it.

## Process

1. **Read sources (read-only):** `memory-short.md` §Journal + §Errors & learnings · recent archives in `.berserqir/memory/compressions/` · current `.berserqir/memory/instincts.json`.
2. **Extract candidates** — patterns that repeat, or corrections the human made. **Friction traces first**: journal lines carrying a guard verdict (`· deny:…` / `· block:…` / `· fail:…`) are the strongest raw material — a repeated deny on the same command shape, or repeated blocks on the same file, is a behavioral pattern the squad keeps hitting; distill *why* it recurs into the candidate, not just *that* it happened. Apply the quality bar: one line · imperative · project-specific · ≥ 1 evidence ref. Generic best practices → reject (skills own those). Guardrail territory → reject (already law — the instinct is the *avoidance pattern*, e.g. “check X before proposing Y”, never a restatement of the rule).
3. **Dedupe against existing instincts** — same pattern already tracked → **reinforce** (+0.2, append evidence, update `lastReinforced`) instead of duplicating. Counter-evidence against an existing instinct → **decay** (−0.3, note why).
4. **Expire** — unreinforced for 30 days or confidence < 0.1 → `status: expired`. Never delete — provenance stays.
5. **Write** `instincts.json` (the memory-validate hook enforces the schema) and report:

   | id | statement | confidence | Δ | status |
   |----|-----------|------------|---|--------|

6. **Demo harvest (ICL pool)** — scan the same sources for at most ONE exemplary trajectory: an implementation that passed its QA gate and teaches a reusable pattern, or an instructive failure (anti-example). If found, propose it as a demo candidate — goal · condensed trajectory (3–8 steps) · outcome — following the template in `core/skills-resources/icl/demos/README.md`. **Write only after an explicit human OK**, to `core/skills-resources/icl/demos/<area>-<slug>.md` with `source: promoted-instinct` or `source: manual` provenance. No exemplary trajectory → propose nothing (a mediocre demo poisons every future injection).
7. **Profile mining (human-profile)** — scan the same sources for evidence about the *human*, not the project: “just do it” overrides, repeated rejections of a proposal style, corrections that reveal proficiency (or its absence) in an area. If a pattern has ≥ 2 dated occurrences, propose the matching one-line update to `human-profile.md` — §Override log entry, §Areas evidence note, or a mode change suggestion. **Propose, never write** — show the exact line and wait for the explicit human OK (mode changes especially: the human calibrates their own profile, per `core/protocols/mentorship.md`). Nothing found → propose nothing.

End the report with: which instincts are now ≥ 0.7 (injectable) and any cluster of ≥ 3 that is `/evolve`-ready.

## Never

- Invent evidence — every instinct cites a journal entry / anchor / date.
- Jump a single occurrence to `active` — repetition earns confidence, severity does not.
- Touch anything other than `instincts.json` — except a demo file under `core/skills-resources/icl/demos/` (step 6) or `human-profile.md` (step 7), each only behind its explicit human OK.
