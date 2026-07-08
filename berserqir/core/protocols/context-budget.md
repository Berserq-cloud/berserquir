# Protocol: Context Budget (Progression Matrix)

Load different context at different loop phases — cumulative during exploration, **substitutive** at execution. Token economy is architecture, not optimization.

| Phase | Load | Budget (guide) |
|---|---|---|
| 1 UNDERSTAND | memory-short + user request + codemap | ~3k tok |
| 2 QUESTIONS | + PRD §relevant + memory-medium features | ~5k tok |
| 3 PLAN | + memory-long §area + targeted search results | ~15k tok |
| 4 ALIGN | (same as PLAN — format only) | ~15k tok |
| 5 EXECUTE | **substitute** exploration context with: SPECS §relevant + active ADR + 1–2 ICL demos + target files + area skill | ~40k tok |
| 6 VERIFY | **substitute** with: DoD checklist + lint/test output | ~10k tok |
| 7 REPORT | summary + diff + memory updates | ~3k tok |

## Rules

1. Each agent carries a `Context Budget` block (always / onTask / never / maxTokens). Overlays refine the archetype template.
2. **Navigate via the textual graph**: codemap first (~1–2k tok, always cheap), then follow anchors/edges to load only the relevant subgraph. Anchor discipline (`ADR-NNN`, `FEAT-...`) makes grep an exact lookup.
3. **Dumb-zone signals** — suggest compression/reload when ≥2 are true: >15 file reads in one task · >40 total tool calls · same file read ≥3×.
4. Model routing is part of the budget: junior (fast class) for trivial lanes, mid for standard, top reserved for senior/authority work.
