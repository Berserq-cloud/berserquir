# Protocol: Instincts (continuous learning)

An **instinct** is a one-line, project-specific behavioral pattern learned from evidence — never a universal best practice (those belong to skills). This pipeline turns the deterministic journal into reflexes the squad loads before acting.

## Lifecycle

journal entries (raw, hook-written) → **candidate** (extracted by `/learn` or during `/compress`) → **active** (confidence ≥ 0.7 — injectable) → **promoted** (clustered into a generated skill via `/evolve`) or **expired** (unreinforced/contradicted).

Store: `.berserqir/memory/instincts.json` (schema: `core/memory/schemas/instincts.schema.json`). TTL mapping: short = observation · medium = instinct · long = skill / ICL demo.

## Confidence mechanics (deterministic — no judgment calls)

- Born at **0.3** (candidate)
- Reinforced (same pattern observed again — evidence appended): **+0.2**, cap 1.0
- Contradicted (counter-evidence or a human correction): **−0.3**
- **30 days** without reinforcement, or confidence < 0.1 → `expired` (kept in the file for provenance, never injected)

## Injection rule

At memory-sync ritual step 1 ("read before acting"): load `active` instincts with confidence ≥ 0.7, **max 6**, highest confidence first, scoped to the task's area plus `project`-wide ones. Harnesses with session hooks (e.g. Claude Code SessionStart) automate this; everywhere else the ritual carries it.

## Quality bar (extraction)

- One line, imperative, testable. Good: *"migrations in this repo always ship a rollback script — CI checks for it"*. Bad: *"write good migrations"*.
- **Project-specific.** Generic best practices are rejected — skills own those.
- Every instinct cites ≥ 1 evidence entry (journal date / anchor). No evidence, no instinct.
- Guardrails never become instincts — they are already law (hooks).
- Repetition earns confidence, severity does not: one dramatic error seen once is still a 0.3 candidate.

## Automation (two layers — hooks detect, agents think)

Deterministic triggers, zero LLM: memory-validate **blocks** oversized memory (forcing `/compress`, whose step 2 runs extraction) · the journal hook suggests `/compress` every 40 entries and flags **evolve-ready clusters** whenever `instincts.json` is written · `npx berserqir doctor` reports evolve-readiness. Semantic work (extraction, drafting) always runs agent-side via `/learn` and `/evolve` — and the human OK on promotion is **never** automated away. Harnesses with session hooks (e.g. Claude Code) automate injection and end-of-session extraction natively; elsewhere the ritual and these nudges carry it.

## Promotion (`/evolve`)

≥ 3 related `active` instincts (≥ 0.7) cluster into a **generated skill**, drafted in SKILL.md format. **Dual calibration:** the project shapes the content (instincts as provenance), the human shapes the depth (`human-profile.md` — didactic for Learn mode, dense for Productivity). Gate: the draft passes a derived eval (pass@3) **and** gets an explicit human OK (ALIGN). Failure → ICL anti-example. Promoted instincts keep `status: promoted` + `promotedTo` — the audit trail survives.
