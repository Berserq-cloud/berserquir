#!/usr/bin/env node
// Berserqir guardrail: commit-quality (zero deps, cross-platform — Node, no sh)
// Pre-commit checks on staged changes. Exit 0 = ok · exit 1 = block (with reasons).
//
// Activate as a native git hook (works on ANY harness/OS — Git runs hooks via its
// bundled sh, which honors this wrapper):
//   printf '#!/bin/sh\nexec node .berserqir/hooks/commit-quality/commit-quality.mjs "$@"\n' > .git/hooks/pre-commit
//   chmod +x .git/hooks/pre-commit   (POSIX only; Git for Windows needs no chmod)
// Or call directly: node .berserqir/hooks/commit-quality/commit-quality.mjs
//
// Checks:
//   1. debug leftovers in staged code (console.log/debugger/binding.pry/pdb/dd()) — warn
//   2. secrets in staged diff (same patterns as secret-scan) — block
//   3. oversized files (>1MB staged, likely accidental) — block
//   4. commit message format (conventional commit + optional anchor) — checked
//      only when message file is passed as argv[2] (commit-msg hook mode)
// Override (human-only): BERSERQIR_COMMIT_ALLOW=1

import { readFileSync, statSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

if (process.env.BERSERQIR_COMMIT_ALLOW === '1') process.exit(0)

const git = (...args) =>
  spawnSync('git', args, { encoding: 'utf8' }).stdout ?? ''

let fail = false
const stagedFiles = git('diff', '--cached', '--name-only', '--diff-filter=ACM')
  .split('\n')
  .filter(Boolean)
if (stagedFiles.length === 0) process.exit(0)

const addedLines = git('diff', '--cached', '-U0')
  .split('\n')
  .filter((l) => l.startsWith('+'))

// 1) debug leftovers (warn — not every echo is a crime, but say it)
const DEBUG_RE =
  /console\.(log|debug)\(|debugger;|binding\.pry|import pdb|pdb\.set_trace|\bdd\(/
const debugHits = addedLines.filter((l) => DEBUG_RE.test(l)).length
if (debugHits > 0)
  process.stderr.write(
    `[berserqir:commit-quality] WARN: ${debugHits} debug statement(s) in staged diff — intended?\n`,
  )

// 2) secrets in the staged diff (block) — same patterns as secret-scan
const SECRET_RE =
  /sk-[A-Za-z0-9]{20,}|gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|postgres(ql)?:\/\/[^:]+:[^@]+@|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\./
if (addedLines.some((l) => SECRET_RE.test(l))) {
  process.stderr.write(
    '[berserqir:commit-quality] BLOCKED: possible secret in staged diff (pattern match — value not printed)\n',
  )
  fail = true
}

// 3) oversized staged files (block — usually an accident)
for (const f of stagedFiles) {
  try {
    if (statSync(f).size > 1048576) {
      process.stderr.write(
        `[berserqir:commit-quality] BLOCKED: ${f} is >1MB — accidental? (git lfs or .gitignore it)\n`,
      )
      fail = true
    }
  } catch {
    /* deleted/renamed since staging — not our problem */
  }
}

// 4) commit message (only in commit-msg mode: argv[2] = message file)
const msgFile = process.argv[2]
if (msgFile && existsSync(msgFile)) {
  const firstLine = readFileSync(msgFile, 'utf8').split('\n')[0]
  if (
    !/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9./-]+\))?!?: .+/.test(
      firstLine,
    )
  ) {
    process.stderr.write(
      `[berserqir:commit-quality] BLOCKED: message is not a conventional commit: "${firstLine}"\n` +
        '  format: type(scope): subject — anchors (FEAT-*/ADR-*/DEBT-*) welcome in body\n',
    )
    fail = true
  }
}

if (fail) {
  process.stderr.write(
    '  human override: BERSERQIR_COMMIT_ALLOW=1 git commit ...\n',
  )
  process.exit(1)
}
process.exit(0)
