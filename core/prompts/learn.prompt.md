---
name: learn
description: Extract instinct candidates from the session journal — reinforce repeats, decay contradictions, expire stale ones. Writes .berserqir/memory/instincts.json.
---

# /learn — Instinct Extraction

The rules live in `core/protocols/instincts.md` — load it first. Nothing here relaxes it.

## Process

1. **Read sources (read-only):** `memory-short.md` §Journal + §Errors & learnings · recent archives in `.berserqir/memory/compressions/` · current `.berserqir/memory/instincts.json`.
2. **Extract candidates** — patterns that repeat, or corrections the human made. Apply the quality bar: one line · imperative · project-specific · ≥ 1 evidence ref. Generic best practices → reject (skills own those). Guardrail territory → reject (already law).
3. **Dedupe against existing instincts** — same pattern already tracked → **reinforce** (+0.2, append evidence, update `lastReinforced`) instead of duplicating. Counter-evidence against an existing instinct → **decay** (−0.3, note why).
4. **Expire** — unreinforced for 30 days or confidence < 0.1 → `status: expired`. Never delete — provenance stays.
5. **Write** `instincts.json` (the memory-validate hook enforces the schema) and report:

   | id | statement | confidence | Δ | status |
   |----|-----------|------------|---|--------|

End the report with: which instincts are now ≥ 0.7 (injectable) and any cluster of ≥ 3 that is `/evolve`-ready.

## Never

- Invent evidence — every instinct cites a journal entry / anchor / date.
- Jump a single occurrence to `active` — repetition earns confidence, severity does not.
- Touch anything other than `instincts.json` (not memory-long, not guardrails, not skills).
