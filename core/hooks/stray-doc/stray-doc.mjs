#!/usr/bin/env node
// Berserqir advisory: stray-doc
// Warns when an agent writes a root-level markdown file outside the project's
// canonical doc set (ECC-verified failure mode: agents scatter NOTES.md /
// SUMMARY.md / IMPLEMENTATION_PLAN.md instead of using memory + SDD artifacts).
//
// ADVISORY — always exit 0. Legitimate new root docs exist (a human may ask for
// one); the warning steers the default, the human overrides by simply saying so.
//
// Input:  edited file path as argv[2]
// Output: warning on stderr when a stray root doc is written · exit 0 always

import { basename, dirname, extname, relative, isAbsolute } from 'node:path'

const target = process.argv[2]
if (!target) process.exit(0)

const ext = extname(target).toLowerCase()
if (ext !== '.md' && ext !== '.mdx') process.exit(0)

// scope: repo-root files only (docs/ and nested dirs are deliberate placement)
const posix = target.replaceAll('\\', '/')
const rel = isAbsolute(posix) ? relative(process.cwd(), posix) : posix
if (dirname(rel) !== '.' || rel.startsWith('..')) process.exit(0)

const CANONICAL = new Set([
  'README',
  'PRD',
  'SPECS',
  'TESTS',
  'DESIGN',
  'AGENTS',
  'CLAUDE',
  'CONTRIBUTING',
  'CHANGELOG',
  'CODE_OF_CONDUCT',
  'SECURITY',
  'SUPPORT',
  'LICENSE',
])

const stem = basename(rel, extname(rel)).toUpperCase()
if (CANONICAL.has(stem)) process.exit(0)

process.stderr.write(
  `[berserqir:stray-doc] advisory: writing root-level ${basename(rel)} — ` +
    'session context belongs in .berserqir/memory/, decisions in SPECS.md (ADR), plans in the tracker. ' +
    'If the human asked for this doc, carry on; otherwise prefer docs/ or the memory system. This never blocks.\n',
)
process.exit(0)
