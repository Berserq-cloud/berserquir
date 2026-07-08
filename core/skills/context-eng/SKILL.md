---
name: context-eng
description: Context engineering — memory navigation, textual graph traversal, progressive disclosure, recovery. Load when assembling context for a task or when lost.
---

# Skill: Context Engineering

Thin skill — the weight lives in the protocols. This is the map.

## The rules that matter

1. **Budget per phase** — `core/protocols/context-budget.md`: cumulative while exploring, **substitutive** at EXECUTE. Never carry exploration debris into implementation.
2. **Memory discipline** — `core/protocols/memory-sync.md`: read before acting, write after acting, never touch memory-long without an ADR.
3. **Graph-first navigation** — codemap (~1–2k tok) is always cheap: read it FIRST, then follow anchors/edges into the relevant subgraph (`graph.json`). Grep an anchor (`ADR-010`, `FEAT-2026-…`) instead of reading files hunting for context.
4. **Progressive disclosure** — skill frontmatter → skill body → hub resources (`.berserqir/skills-resources/`). Load deeper only when the task demands it.

## Loading order for any task

memory-short (state) → codemap (map) → memory-medium §feature (sprint) → memory-long §relevant (constraints) → subgraph/files (targets) → skill + demos (method).

## Recovery protocol (when lost)

Signals: repeated searches · contradicting an ADR · re-reading the same file 3× · suggesting something memory says was revoked.

Reload in order: memory-short → memory-medium → memory-long → PRD → SPECS → codemap. Then re-state the task in one line before resuming. If still lost → escalate, don't thrash.

## Compression

Size budgets are enforced by hook (memory-validate). When blocked: `/compress` (`core/prompts/compress.prompt.md`). Compress at breakpoints, never mid-implementation.
