---
name: compress
description: Compress memory-short when it exceeds its size budget — archive full journal, carry forward what matters.
---

# /compress — Memory Compression

Trigger: memory-validate blocks on size budget, dumb-zone signals fire (≥2 of: >15 file reads, >40 tool calls, same file read 3×), or manual call at a logical breakpoint.

## Process

1. **Archive first** — copy the current `memory-short.md` verbatim to `.berserqir/memory/compressions/<ISO-timestamp>.md`. Never compress without the archive.
2. **Extract what survives** (semantic triage):
   - Open threads → carried forward verbatim
   - Unresolved errors → carried forward verbatim
   - Recurring patterns in §Errors & learnings → run the `/learn` extraction pass (`core/prompts/learn.prompt.md`): write/reinforce candidates in `.berserqir/memory/instincts.json` per `core/protocols/instincts.md`
   - §Journal → reduced to a 3-5 line summary ("session touched X files across Y modules, ran Z test cycles")
3. **Rewrite** `memory-short.md` from the template: fresh §Journal, condensed §Focus (1 line: where we are), carried threads and errors.
4. **Verify** — run memory-validate on the result; must pass headings + budget.

## Never lose

Open threads · unresolved errors · candidate instincts · the last 3 journal entries (recency context). When in doubt whether something matters: it goes to the archive either way — archives are grep-able (anchors survive).

Good compression points: after research before implementation · after a milestone · after a failed approach, before the next one. **Never mid-implementation** (loses variable names, file paths, partial state).
