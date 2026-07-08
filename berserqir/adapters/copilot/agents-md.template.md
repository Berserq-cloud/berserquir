# AGENTS.md

<!-- Compiled by Berserqir (universal fallback — read by Codex, Gemini CLI, OpenCode and any agents.md-aware tool). DO NOT EDIT. -->

This repository is operated by the **Berserqir** agent harness: SDD (PRD → SPECS → TESTS) + hierarchical memory + a 7-phase agentic loop + behavioral evals.

## Where things live

- **Protocols (execution discipline):** `.berserqir/protocols/` — start with `agentic-loop.md`
- **Memory:** `.berserqir/memory/` — long (constitution) / medium (sprint, JSON) / short (session) / codemap (repo map)
- **Specs:** `PRD.md` (what/why) · `SPECS.md` (how + ADR registry) · `TESTS.md` (verify)
- **Skills:** `.github/skills/` · **Prompts:** `.github/prompts/` · **Evals:** `.berserqir/evals/`

## Non-negotiable rules

1. Follow the agentic loop — ALIGN before non-trivial changes, await explicit OK
2. Architectural ambiguity → ask, never assume (escalate to architect/human)
3. Memory sync: read before acting, write after acting; memory-long only changes via ADR
4. Git safety: **no push, force, --no-verify, or hard reset without explicit human authorization**
5. Never weaken lint/test/CI configs to make checks pass
6. Delegated work returns a JSON Sub-Agent Report (`.berserqir/protocols/sub-agent-report.md`)

## Agent roster

{{ROSTER}}

## Harnesses without subagent/hook support

Follow the protocols directly as instructions. Guardrails become manual checklist items — the rules above still bind.
