#!/usr/bin/env node
// Berserqir guardrail: cmd-safety
// Blocks destructive/irreversible shell commands unless the human explicitly
// authorized them. Complements git-safety (git-scoped) — this covers the rest.
//
// Tier discipline (enforced in archetypes; this hook is the agent-agnostic floor):
//   junior       → no terminal at all (the `execute` tool is absent at compile time)
//   pleno        → simple, reversible commands only
//   senior/orch  → complex commands allowed — but DESTRUCTIVE always needs a human,
//                  at every tier. Hooks don't know which agent runs; humans stay in
//                  control both ways (override = relayed human OK, never self-set).
//
// Zero dependencies, cross-platform (Node — no sh required).
//
// Input:  command string as argv[2], or on stdin.
// Output: exit 0 = allow · exit 2 = block (PreToolUse deny convention)
// Override (human-set, per command): BERSERQIR_CMD_ALLOW=1

import { readFileSync } from 'node:fs'

if (process.env.BERSERQIR_CMD_ALLOW === '1') process.exit(0)

let cmd = process.argv[2]
if (!cmd) {
  try {
    cmd = readFileSync(0, 'utf8')
  } catch {
    /* no stdin */
  }
}
if (!cmd || !cmd.trim()) process.exit(0)

const norm = cmd.replace(/\s+/g, ' ').trim()

const block = (reason) => {
  process.stderr.write(
    `[berserqir:cmd-safety] BLOCKED: ${reason}\n` +
      'Destructive commands require explicit human authorization — ask first.\n' +
      'If the human authorized it, re-run with BERSERQIR_CMD_ALLOW=1.\n',
  )
  process.exit(2)
}

// rm -r / -rf / -f — allowed only when every target lives under a tmp dir
const rmMatch = norm.match(/\brm\s+((?:-[A-Za-z]+\s+)+)(.+)/)
if (rmMatch && /[rf]/.test(rmMatch[1])) {
  const targets = rmMatch[2]
    .split(/\s+/)
    .filter((t) => t && !t.startsWith('-') && !/^(&&|\|\||;|\|)$/.test(t))
  const tmpOnly =
    targets.length > 0 &&
    targets.every((t) =>
      /^(["']?)(\/tmp\/|\/private\/tmp\/|\$\{?TMPDIR\}?|%TEMP%)/.test(t),
    )
  if (!tmpOnly) block('rm -r/-f — recursive/forced delete')
}

const RULES = [
  [/\brmdir\s+\/s\b/i, 'rmdir /s — recursive delete (Windows)'],
  [/\bdel\s+\/[sfq]\b/i, 'del /s|/f|/q — forced delete (Windows)'],
  [
    /\bremove-item\b[^|;&]*(-recurse|-force)/i,
    'Remove-Item -Recurse/-Force (PowerShell)',
  ],
  [
    /\b(drop\s+(table|database|schema)|truncate\s+table)\b/i,
    'destructive SQL statement',
  ],
  [
    /\bterraform\s+(destroy|apply\s[^|;&]*-destroy)\b/i,
    'terraform destroy — infrastructure teardown',
  ],
  [
    /\bkubectl\s+delete\s+(ns\b|namespace\b|.*--all\b)/i,
    'kubectl delete namespace/--all',
  ],
  [
    /\bdocker\s+(system|volume|image|container)\s+prune\b/i,
    'docker prune — bulk deletion',
  ],
  [/\bnpm\s+unpublish\b/i, 'npm unpublish — removes a published release'],
  [
    /\b(npm|pnpm|yarn)\s+publish\b/i,
    'package publish — releases are human-triggered',
  ],
  [/\bmkfs\b|\bdd\s+[^|;&]*\bof=\/dev\//i, 'disk-level operation'],
  [/\bchmod\s+(-R\s+)?777\b/i, 'chmod 777 — world-writable permissions'],
  [/\bgh\s+(repo\s+delete|release\s+delete)\b/i, 'gh delete — remote removal'],
]
for (const [re, reason] of RULES) if (re.test(norm)) block(reason)

process.exit(0)
