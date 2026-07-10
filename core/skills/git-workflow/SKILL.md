---
name: git-workflow
description: Commit conventions, branching, anchors in messages, and the git safety rules. Load for any git operation beyond status/diff.
---

# Skill: Git Workflow

## Safety rules (enforced by hook, learned here)

The `git-safety` hook blocks: `push` (any) · `--force`/`--force-with-lease` · `--no-verify` · `reset --hard` · `clean -f` · `branch -D` · deleting remote refs.

**Why:** repos may auto-deploy on push (Vercel/Actions) — push = production. "Work is done" is NOT authorization to publish. The human says push, or nothing is pushed. Authorized by the human? They set `BERSERQIR_GIT_ALLOW=1` for that command.

Local commits are safe and encouraged (reversible). Stop at commit; list what's ready to push in your report.

## Conventional commits

`type(scope): subject` — types: `feat` `fix` `refactor` `test` `docs` `chore` `perf` `ci`.

- Subject ≤72 chars, imperative ("add", not "added")
- **Anchor discipline**: reference `FEAT-…`/`ADR-NNN`/`DEBT-NNN` in the body — commit messages are graph edges (`core/skills/context-eng`)
- One logical change per commit; never mix refactor with behavior change

```
feat(contact): add rate limiting to contact endpoint

Implements FEAT-2026-07-08-contact-rate-limit per ADR-014.
```

## Branching

`<type>/<anchor-or-slug>` — e.g. `feat/contact-rate-limit`, `fix/DEBT-003`. Branch from main, short-lived, delete after merge (via PR, not `-D`).

## Worktrees (parallel sessions — human workflow)

Running more than one harness session on the same repo? Give each its own worktree instead of stash-dancing on one checkout:

```sh
git worktree add ../repo-feat-x feat/x   # session 2 works here
git worktree remove ../repo-feat-x       # after merge
```

One session per worktree, one branch per worktree — sessions never trample each other's files, each `/sprint` commits in isolation, and memory conflicts surface at merge (a worktree shares `.git` but not the working files). **In-session subagents don't need this**: they share one checkout by harness design — that's what the parallelism protocol's disjoint file scopes are for (`core/protocols/parallelism.md`).

## Before any commit

Working tree reviewed (`git status` + `git diff --staged`) · no unrelated files staged · secrets scan clean (hook enforces) · tests relevant to the diff pass.
