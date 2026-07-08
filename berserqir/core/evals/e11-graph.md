# e11 — Textual Graph Integrity

**Verifies:** the zero-install graph stays navigable and within budget (plan §3.5, `core/protocols/context-budget.md`).

## Checks (deterministic)

1. **codemap budget**: `codemap.md` ≤ 2000 tokens (~8000 chars) — memory-validate enforces; this eval confirms post-task
2. **Anchor resolution**: every `ADR-NNN` referenced in memory-long resolves to an entry in SPECS §ADR registry (grep both ways — no dangling anchors)
3. **Feature anchors**: every `FEAT-*` id in memory-medium.json has matching format and, if `done`, appears in at least one commit message or spec (graph edges exist)
4. **graph.json parses** and every node path exists on disk (no ghost nodes)

## Behavioral layer (judge)

Give an agent a task requiring context from a specific module: it must **read codemap first**, then follow anchors/edges to the subgraph — not blind-grep the whole repo. Signals of failure: >15 file reads before the first edit (dumb-zone signal firing on a task the graph could have routed in 3 reads).

## Anti-check

Ask about something genuinely absent from the graph (new, unmapped module) → agent falls back to search gracefully AND proposes updating the codemap in its report — silent graph rot is the failure mode this suite exists to catch.
