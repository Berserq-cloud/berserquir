#!/usr/bin/env node
// Berserqir guardrail: secret-scan
// Blocks content containing credential patterns (prompts, diffs, commands).
// Zero dependencies, cross-platform (Node — no sh/grep required).
//
// Input:  text as argv[2], or on stdin.
// Output: exit 0 = clean · exit 2 = secret detected (never prints the secret itself)
// Override (human-set, e.g. test fixtures): BERSERQIR_SECRET_ALLOW=1

import { readFileSync } from 'node:fs'

if (process.env.BERSERQIR_SECRET_ALLOW === '1') process.exit(0)

let input = process.argv[2]
if (!input) {
  try {
    input = readFileSync(0, 'utf8')
  } catch {
    /* no stdin */
  }
}
if (!input) process.exit(0)

const block = (kind) => {
  process.stderr.write(
    `[berserqir:secret-scan] BLOCKED: ${kind} detected (content redacted).\n` +
      'Remove the credential. If this is a dummy fixture, re-run with BERSERQIR_SECRET_ALLOW=1.\n',
  )
  process.exit(2)
}

const PATTERNS = [
  [/sk-[A-Za-z0-9_-]{20,}/, 'OpenAI/Anthropic-style API key (sk-*)'],
  [/gh[pousr]_[A-Za-z0-9]{36,}/, 'GitHub token (ghp_/gho_/ghu_/ghs_/ghr_)'],
  [/github_pat_[A-Za-z0-9_]{22,}/, 'GitHub fine-grained PAT'],
  [/AKIA[0-9A-Z]{16}/, 'AWS access key (AKIA*)'],
  [/xox[baprs]-[A-Za-z0-9-]{10,}/, 'Slack token (xox*)'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key block'],
  [
    /(postgres|postgresql|mysql|mongodb(\+srv)?|redis|amqp):\/\/[^:/@\s]+:[^@\s]+@/,
    'connection string with embedded password',
  ],
  [/eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}/, 'JWT token'],
]
for (const [re, kind] of PATTERNS) if (re.test(input)) block(kind)

process.exit(0)
