# ⚔️ Berserqir

**The agent legion harness.** Spec-driven development + hierarchical memory + an agentic loop with human alignment gates + behavioral evals — installed into your repo as a disciplined squad of AI agents, portable across GitHub Copilot, Claude Code and Cursor.

```bash
cd your-repo
npx berserqir install        # detects your stack, proposes areas, installs
# then, in your harness chat:
/init                        # interview (greenfield) or codebase scan (brownfield)
```

> *Berserqir* — Old Norse plural of *berserkr*: a legion of bear-warriors under one command.

## What you get

- **18 agents in a real hierarchy** — orchestrator, architect, product, senior/mid/junior squads per area, plus read-only QA and security gates. Juniors fast-path trivial work; anything touching auth, payments, migrations or IAM escalates. Panels of 3 deliberate genuine alternatives; humans decide architecture.
- **36 discipline skills, zero framework lock-in** — API design, data safety, observability, async jobs, caching, design patterns, system design, anti-slop UI, accessibility, SEO, networking (BGP/OSPF), DR/HA, GitOps, containers, Kubernetes, incident response, FinOps and more. Your stack's idioms come from **your project memory**, not from the package.
- **Hierarchical memory with TTLs** — `memory-long.md` (constitution) · `memory-medium.json` (sprint tracker) · `memory-short.md` (session journal, hook-appended) · `codemap.md` + `graph.json` (textual repo graph: grep an anchor like `ADR-012` and it resolves — no embeddings, no database; see *Context is a knowledge graph* below).
- **Guardrail hooks (deterministic, zero-LLM)** — git-safety (no push/force/reset without a human), secret-scan, config-protection ("fix the code, not the ruler"), memory validation, commit quality.
- **12 behavioral evals with anti-checks** — including the ones that catch over-ceremony, not just under-performance. `/run-evals` smoke-tests your installed harness.
- **Commands** — `/berserqir init | compress | learn | evolve | evals | review | checkpoint | status`, plus `npx berserqir doctor` for a deterministic health score of the installation itself. `/learn` extracts **instincts** (project-specific patterns, confidence-scored, evidence-backed) from the session journal; `/evolve` clusters mature instincts into generated skills — eval-gated and human-approved.

## How it works

Canonical sources (`core/` protocols + `profiles/` per area) are **compiled** into your harness's native format at install time — agents materialize complete, the knowledge hub lands in `.berserqir/`. Everything is vendored: no runtime dependency on npm, works in a Terraform-only repo without a `package.json`.

```bash
npx berserqir install --profiles full   # everything
npx berserqir install --profiles front  # one area + invariant core
npx berserqir update                    # new version; your edits are never overwritten silently
npx berserqir doctor                    # health check: install, memory, graph, guardrails
```

Updates are hash-aware: files you modified are kept unless you `--force`. Your model roster (set during `/init`) survives updates and drives recompilation.

## Context is a knowledge graph (KAG, the lite way)

Berserqir's context layer is a deliberate lightweight take on **KAG — Knowledge Augmented Generation**: retrieval routed through a knowledge graph instead of similarity search over document chunks (RAG). Each heavy KAG component has a deterministic, zero-infrastructure equivalent:

| KAG pillar | Berserqir equivalent |
|---|---|
| LLM-friendly knowledge representation | Typed graph — nodes `file/module/adr/feature/debt`, edges `implements/depends/supersedes` (`graph.json` + JSON schema) |
| Mutual indexing (graph ↔ source text) | Canonical anchors (`ADR-012`, `FEAT-2026-…`, `DEBT-007`) exist in the graph **and** in specs, memory and commit messages — `grep` resolves them both ways, O(1) |
| Guided reasoning (logical-form solver) | Agentic traversal — read `codemap.md` (always-loaded index, ≤2k tokens), follow edges, grep the anchor. The LLM is the planner; multi-hop = walking `depends`/`supersedes` |
| Knowledge alignment | Deterministic — memory-sync ritual + validation hooks + eval `e11` (ghost nodes, dangling anchors, silent graph rot) |

The trick that makes "lite" viable: **canonical IDs design away entity linking and disambiguation** — the most expensive parts of full KAG. No embeddings, no vector store, no extraction pipeline. `/init` builds the graph (human-confirmed, block by block, on brownfield), the memory-sync ritual keeps it alive, and `e11` fails loudly when it rots.

## Philosophy

1. **Discipline over templates** — skills teach the universal rules (the *why*); your codebase's conventions live in memory, seeded by `/init` and refined as the harness learns your project.
2. **The human is the apex** — architectural decisions go through ALIGN gates and land as ADRs. Guardrails never relax, not even mid-incident.
3. **Everything is testable** — every behavior has an eval, every eval has an anti-check, every guardrail has a human override that gets logged.

## Status

`0.1.x` — GitHub Copilot target complete. Claude Code and Cursor adapters in progress. MIT.
