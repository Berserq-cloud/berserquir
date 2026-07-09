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
- **Hierarchical memory with TTLs** — `memory-long.md` (constitution) · `memory-medium.json` (sprint tracker) · `memory-short.md` (session journal, hook-appended) · `codemap.md` + `graph.json` (textual repo graph: grep an anchor like `ADR-012` and it resolves — no embeddings, no database).
- **Guardrail hooks (deterministic, zero-LLM)** — git-safety (no push/force/reset without a human), secret-scan, config-protection ("fix the code, not the ruler"), memory validation, commit quality.
- **12 behavioral evals with anti-checks** — including the ones that catch over-ceremony, not just under-performance. `/run-evals` smoke-tests your installed harness.
- **Commands** — `/berserqir init | compress | evals | review | checkpoint | status`, plus `npx berserqir doctor` for a deterministic health score of the installation itself.

## How it works

Canonical sources (`core/` protocols + `profiles/` per area) are **compiled** into your harness's native format at install time — agents materialize complete, the knowledge hub lands in `.berserqir/`. Everything is vendored: no runtime dependency on npm, works in a Terraform-only repo without a `package.json`.

```bash
npx berserqir install --profiles full   # everything
npx berserqir install --profiles front  # one area + invariant core
npx berserqir update                    # new version; your edits are never overwritten silently
npx berserqir doctor                    # health check: install, memory, graph, guardrails
```

Updates are hash-aware: files you modified are kept unless you `--force`. Your model roster (set during `/init`) survives updates and drives recompilation.

## Philosophy

1. **Discipline over templates** — skills teach the universal rules (the *why*); your codebase's conventions live in memory, seeded by `/init` and refined as the harness learns your project.
2. **The human is the apex** — architectural decisions go through ALIGN gates and land as ADRs. Guardrails never relax, not even mid-incident.
3. **Everything is testable** — every behavior has an eval, every eval has an anti-check, every guardrail has a human override that gets logged.

## Status

`0.1.x` — GitHub Copilot target complete. Claude Code and Cursor adapters in progress. MIT.
