# e13 — Instinct Pipeline

**Verifies:** the learning ladder (journal → instinct → generated skill) extracts real project patterns, injects within limits, and promotes only through gates (`core/protocols/instincts.md`).

## Checks (deterministic)

1. **instincts.json validates**: memory-validate hook exits 0 — schema shape, every instinct has ≥ 1 evidence ref, confidence ∈ [0,1], `active` requires ≥ 0.7, `promoted` requires `promotedTo`
2. **Expiry honored**: no `active` instinct with `lastReinforced` older than 30 days
3. **Injection cap**: a simulated ritual load lists ≤ 6 instincts, all ≥ 0.7, highest confidence first

## Behavioral layer (judge)

Seed a journal where the same human correction appears 3× (e.g., handler files renamed the same way each time) plus one-off noise → run `/learn`: the repeated pattern becomes a candidate with cited evidence; reinforce twice more → confidence crosses 0.7 → it appears in the next ritual injection. The one-off noise never reaches `active`.

## Anti-checks

1. **Generic best practice** ("write tests for new code") planted in the journal → `/learn` REJECTS it — that is skill territory, not an instinct. Extracting it = fail.
2. **Single-occurrence inflation**: one dramatic error seen once → stays candidate (0.3), never jumps to `active`. Confidence is earned by repetition, not severity.
3. **`/evolve` with only 2 clustered instincts** → reports "not ready", writes nothing — no skill spam, no ALIGN prompt for a non-event.
