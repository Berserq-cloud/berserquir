#!/usr/bin/env node
// Berserqir advisory: back-quality
// Deterministic quality signals over edited back-end/source files — the
// symmetric counterpart of front-quality. Debug leftovers, swallowed errors,
// hardcoded endpoints: the tells that pass compilation but fail review.
//
// ADVISORY BY DESIGN — always exit 0. These are signals, not law: a CLI tool
// prints, a script sleeps. Agents (and humans) judge; commit-quality and the
// QA gate hold the hard line.
//
// Input:   edited file path as argv[2]
// Output:  findings on stderr (capped) · exit 0 always
// Opt-out: BERSERQIR_BACK_QUALITY=0

import { readFileSync } from 'node:fs'
import { basename, extname } from 'node:path'

if (process.env.BERSERQIR_BACK_QUALITY === '0') process.exit(0)

const target = process.argv[2]
if (!target) process.exit(0)

const EXT = new Set([
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.mts',
  '.cts',
  '.py',
  '.go',
  '.rb',
  '.php',
  '.java',
  '.cs',
  '.kt',
  '.rs',
])
const ext = extname(target).toLowerCase()
if (!EXT.has(ext)) process.exit(0)

// tests, fixtures and scripts have their own rules — console/print/sleep are legit there
const posix = target.replaceAll('\\', '/')
const base = basename(posix)
if (
  /\.(test|spec)\.|^test_|_test\.|\.stories\./.test(base) ||
  /\/(tests?|__tests__|__mocks__|fixtures|scripts|examples?)\//.test(posix)
)
  process.exit(0)

let src = ''
try {
  src = readFileSync(target, 'utf8')
} catch {
  process.exit(0) // deleted/unreadable — nothing to advise
}

const findings = []
const flag = (rule, hint) => findings.push(`${rule} — ${hint}`)
const JS = new Set(['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts'])

// ── debug leftovers ─────────────────────────────────────────────────────────
if (JS.has(ext)) {
  const consoles = src.match(/\bconsole\.(log|debug|trace)\(/g)
  if (consoles)
    flag(
      'console leftovers',
      `${consoles.length}× console.log/debug/trace — structured logger or removal before review`,
    )
} else if (ext === '.py') {
  const prints = src.match(/^\s*print\(/gm)
  if (prints && prints.length >= 3)
    flag(
      'print leftovers',
      `${prints.length}× print() — the logging module carries levels and structure`,
    )
}

if (/\bdebugger\b;?/.test(src) && JS.has(ext))
  flag('debugger statement', 'never ships — remove')

// ── swallowed errors ────────────────────────────────────────────────────────
if (/catch\s*(\([^)]*\))?\s*\{\s*\}/.test(src))
  flag(
    'empty catch',
    'a swallowed error is a silent outage — log it, rethrow it, or comment why not',
  )
if (ext === '.py' && /except[^:]*:\s*\n\s*pass\b/.test(src))
  flag(
    'except: pass',
    'a swallowed exception is a silent outage — log, re-raise, or comment why not',
  )

// ── hardcoded endpoints ─────────────────────────────────────────────────────
if (
  /["'`]https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/.test(src) ||
  /["'`]https?:\/\/[a-z0-9.-]+\.[a-z]{2,}(:\d{2,5})[/"'`]/.test(src)
)
  flag(
    'hardcoded endpoint',
    'localhost/port literals belong in config or env, not code',
  )

// ── blocking sleeps ─────────────────────────────────────────────────────────
if (
  /\b(time\.sleep|Thread\.sleep|std::thread::sleep|sleep)\s*\(\s*\d/i.test(src)
)
  flag(
    'sleep in code',
    'fixed sleeps hide race conditions — poll with timeout, await the event, or document why',
  )

// ── type discipline (TS) ────────────────────────────────────────────────────
if (['.ts', '.mts', '.cts'].includes(ext)) {
  const anys = src.match(/:\s*any\b|as\s+any\b/g)
  if (anys && anys.length >= 3)
    flag(
      '`any` accumulation',
      `${anys.length}× any — the type checker cannot protect what it cannot see`,
    )
}

// ── commented-out code blocks ───────────────────────────────────────────────
{
  const lines = src.split('\n')
  let run = 0
  let codey = 0
  for (const l of lines) {
    const c = l.match(/^\s*(\/\/|#)\s?(.*)$/)
    if (c) {
      run++
      if (/[;{}=()]|\breturn\b|\bif\b|\bdef\b|\bfunc\b/.test(c[2])) codey++
    } else {
      if (run >= 6 && codey >= 4) {
        flag(
          'commented-out code block',
          `${run} consecutive commented lines that look like code — git history remembers; delete it`,
        )
        break
      }
      run = 0
      codey = 0
    }
  }
}

if (findings.length) {
  process.stderr.write(
    `[berserqir:back-quality] advisory (${target}):\n` +
      findings
        .slice(0, 8)
        .map((f) => `  · ${f}`)
        .join('\n') +
      '\n  Signals, not law — judge each one. This never blocks.\n',
  )
}
process.exit(0)
