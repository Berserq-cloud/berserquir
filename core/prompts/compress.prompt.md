---
name: compress
description: Compress memory when it exceeds its size budget — archive first, carry forward what matters. Handles memory-short and human-profile.
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

## human-profile over budget (1500 tokens)

The profile grows through §Override log and §Growth notes — dated one-liners accumulate for months. When memory-validate blocks it:

1. **Archive first** — verbatim copy to `compressions/<ISO-timestamp>-profile.md`, same rule as above.
2. **Distill §Override log** — keep the last 5 entries; collapse chronic repetition into one line ("overrides styling advice consistently since 2026-05") — and if a pattern is chronic, the honest move is proposing the mode change it implies, not hoarding its evidence.
3. **Distill §Growth notes** — concepts confirmed mastered graduate into §Areas evidence (one line) or a mode-upgrade proposal; teaching history that led nowhere goes to the archive.
4. **Never** change a Mode or Pinned value in §Areas during compression — mode changes are the human's call (`core/protocols/mentorship.md`), propose and wait.
5. **Verify** — memory-validate must pass headings + budget.
