#!/usr/bin/env node
// Berserqir: session-verify (deterministic backstop — zero LLM)
// Stop-time batch verification: the journal already records every file the
// session touched; instead of paying typecheck/lint per edit, run the
// PROJECT'S OWN tooling once, when the session ends (ECC pattern, adapted).
//
// What runs (first match per category, never invented):
//   typecheck: package.json scripts.typecheck → `npm run --silent typecheck`
//              else tsconfig.json present     → `npx --no-install tsc --noEmit`
//   lint:      package.json scripts.lint      → `npm run --silent lint`
//
// Only fires when the session touched at least one JS/TS file (per journal).
// Failures → exit 2 with bounded output (the harness Stop gate makes the agent
// fix before finishing). Timeouts and missing tooling → exit 0, silent: a
// verification hook must never hang a session or fail-open into noise.
//
// Env: BERSERQIR_MEMORY_DIR (default .berserqir/memory)
// Opt-out: BERSERQIR_SESSION_VERIFY=0

import { readFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

if (process.env.BERSERQIR_SESSION_VERIFY === '0') process.exit(0)

const MEMORY_DIR = process.env.BERSERQIR_MEMORY_DIR || '.berserqir/memory'
const shortPath = join(MEMORY_DIR, 'memory-short.md')
if (!existsSync(shortPath)) process.exit(0)

// ---- did this session touch JS/TS? (journal lines: `- ts · agent · tool · target[ · outcome]`)
const raw = readFileSync(shortPath, 'utf8')
const jIdx = raw.indexOf('## Journal')
if (jIdx === -1) process.exit(0)
const journal = raw.slice(jIdx, raw.indexOf('\n## ', jIdx + 1))
const touched = new Set()
for (const m of journal.matchAll(
  /^- .+? · .+? · .+? · (.+?)(?: · (?:ok|deny|block|warn|fail)\S*)?$/gm,
)) {
  const t = m[1].trim()
  if (/\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/.test(t) && existsSync(t))
    touched.add(t)
}
if (touched.size === 0) process.exit(0)

// ---- resolve the project's own commands (never invent tooling)
let pkg = null
try {
  pkg = JSON.parse(readFileSync('package.json', 'utf8'))
} catch {
  /* no package.json — nothing to run */
}
const commands = []
if (pkg?.scripts?.typecheck)
  commands.push(['typecheck', ['npm', 'run', '--silent', 'typecheck']])
else if (existsSync('tsconfig.json'))
  commands.push(['typecheck', ['npx', '--no-install', 'tsc', '--noEmit']])
if (pkg?.scripts?.lint)
  commands.push(['lint', ['npm', 'run', '--silent', 'lint']])
if (commands.length === 0) process.exit(0)

const failures = []
for (const [label, [cmd, ...args]] of commands) {
  const r = spawnSync(cmd, args, {
    encoding: 'utf8',
    timeout: 120_000,
    shell: process.platform === 'win32', // npm/npx are .cmd shims on Windows
  })
  if (r.error || r.signal) continue // timeout / tooling missing — never hang or guess
  if (r.status !== 0) {
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim()
    failures.push(`▶ ${label} failed:\n${out.slice(-2000)}`)
  }
}

if (failures.length) {
  process.stderr.write(
    `[berserqir:session-verify] this session touched ${touched.size} JS/TS file(s) and the project's own checks fail:\n` +
      failures.join('\n') +
      '\nFix before finishing — or the human can opt out with BERSERQIR_SESSION_VERIFY=0.\n',
  )
  process.exit(2)
}
process.exit(0)
