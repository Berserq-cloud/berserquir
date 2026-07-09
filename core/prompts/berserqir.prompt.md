---
name: berserqir
description: Berserqir command hub — dispatch /berserqir <command> to the harness workflows (init, compress, evals, review, checkpoint, status).
argument-hint: "init | compress | evals | review | checkpoint | status | help"
---

# /berserqir — Command Hub

The text after `/berserqir` is the **subcommand** (plus optional arguments). Match it against the table below and follow the routed instructions exactly. No subcommand or an unknown one → show **help**.

| Subcommand | Action |
|---|---|
| `init` | Read `core/prompts/init.prompt.md` and follow it end-to-end (bootstrap is hosted by the **product** role — adopt its discipline). |
| `compress` | Read `core/prompts/compress.prompt.md` and follow it end-to-end. |
| `evals` (or `run-evals`) | Read `core/prompts/run-evals.prompt.md` and follow it end-to-end. Pass any trailing arguments (e.g. an eval id like `e07`) through. |
| `review` (or `code-review`) | Read `core/prompts/code-review.prompt.md` and follow it end-to-end (hosted by the **qa** gate — read-only). |
| `checkpoint` | Run the memory-sync ritual §write-after-acting manually: update `memory-short.md` (§Focus, §Open threads, §Errors & learnings) and `memory-medium.json` if a feature moved; then suggest a conventional commit (with anchors) for the work in progress. Nothing is pushed. |
| `status` | Report harness state — see below. |
| `help` | List this table with one-line descriptions and point to `AGENTS.md` for the roster. |

## `status` — harness state report

Read (do not modify) and summarize in a short table:

1. `.berserqir/manifest.json` — version, harness, profiles, compiledAt/installedAt, file count.
2. Memory presence: `.berserqir/memory/memory-long.md`, `memory-medium.json`, `memory-short.md`, `codemap.md`, `human-profile.md` — exists ✓ / missing ✗. All missing → recommend `/berserqir init`.
3. SDD presence: `PRD.md`, `SPECS.md`, `TESTS.md` at repo root — exists ✓ / missing ✗.
4. Latest eval results in `.berserqir/evals/results/` if any (most recent file, pass/fail counts).

End with **one** recommended next action (e.g. "run `/berserqir init`" if memory is missing).

## Rules

- Routed workflows keep ALL their own guardrails (confirmation gates, nothing-written-without-OK, pass@3). Dispatching through the hub never relaxes them.
- Unknown subcommand: do NOT guess or improvise a workflow — show help.
- The dedicated slash commands (`/init`, `/compress`, `/run-evals`) remain available and are equivalent; this hub is a convenience entry point.
