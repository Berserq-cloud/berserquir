#!/usr/bin/env node
// Berserqir: memory-journal (deterministic memory layer — zero LLM)
// PostToolUse hook: appends a journal line to memory-short.md §Journal.
// Zero dependencies. Silently no-ops if memory is not installed.
//
// Input (stdin JSON, harness adapters normalize): { "agent": "...", "tool": "...", "target": "..." }
//   or args: memory-journal.mjs <agent> <tool> <target>
// Env: BERSERQIR_MEMORY_DIR (default: .berserqir/memory)

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const MEMORY_DIR = process.env.BERSERQIR_MEMORY_DIR || '.berserqir/memory'
const FILE = join(MEMORY_DIR, 'memory-short.md')
if (!existsSync(FILE)) process.exit(0)

let evt = {}
if (process.argv[2]) {
  evt = {
    agent: process.argv[2],
    tool: process.argv[3] ?? '?',
    target: process.argv[4] ?? '',
  }
} else {
  try {
    evt = JSON.parse(readFileSync(0, 'utf8'))
  } catch {
    process.exit(0)
  }
}

const ts = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
const line =
  `- ${ts} · ${evt.agent ?? '?'} · ${evt.tool ?? '?'} · ${evt.target ?? ''}`.trimEnd()

const raw = readFileSync(FILE, 'utf8')
const marker = '## Journal'
const idx = raw.indexOf(marker)
if (idx === -1) process.exit(0) // template violated — memory-validate's job, not ours

// insert after the §Journal heading block (skip the comment line if present)
const insertAt = (() => {
  const afterHeading = raw.indexOf('\n', idx) + 1
  const rest = raw.slice(afterHeading)
  const m = rest.match(/^\s*<!--[\s\S]*?-->\s*\n/)
  return afterHeading + (m ? m[0].length : 0)
})()

writeFileSync(FILE, raw.slice(0, insertAt) + line + '\n' + raw.slice(insertAt))

// auto-rotate (deterministic half of /compress): the journal is hook-written
// and unbounded — when memory-short blows its size budget, archive the whole
// file verbatim and reset ONLY §Journal. Agent-owned sections (§Focus,
// §Errors & learnings, §Open threads) carry over untouched; nothing is lost
// (the archive is verbatim). The semantic distillation stays agent work
// (/compress), nudged below — hooks detect, agents think.
const BUDGET_CHARS = 2500 * 4 // mirrors memory-validate (sizeBudget × CHARS_PER_TOKEN)
const grown = readFileSync(FILE, 'utf8')
if (grown.length > BUDGET_CHARS) {
  const jIdx = grown.indexOf(marker)
  const headingEnd = grown.indexOf('\n', jIdx) + 1
  const comment = grown.slice(headingEnd).match(/^\s*<!--[\s\S]*?-->\s*\n/)
  const nextSection = grown.indexOf('\n## ', headingEnd)
  const tail = nextSection === -1 ? '' : grown.slice(nextSection)
  const pointer = `- ${ts} · system · autocompact · journal archived to compressions/`
  const kept =
    grown.slice(0, headingEnd) + (comment ? comment[0] : '') + pointer + tail
  if (kept.length <= BUDGET_CHARS) {
    // journal is the bulk — rotate it
    const dir = join(MEMORY_DIR, 'compressions')
    mkdirSync(dir, { recursive: true })
    const stamp = ts.replace(/[:.]/g, '-')
    const archiveName = `${stamp}-autocompact.md`
    writeFileSync(join(dir, archiveName), grown)
    writeFileSync(
      FILE,
      grown.slice(0, headingEnd) +
        (comment ? comment[0] : '') +
        pointer.replace('compressions/', `compressions/${archiveName}`) +
        '\n' +
        tail,
    )
    console.error(
      `[berserqir:memory-journal] memory-short.md exceeded its size budget — journal auto-archived to compressions/${archiveName} (agent sections kept). Run /berserqir compress to distill learnings when convenient.`,
    )
  } else {
    // the agent-owned sections are the bulk — rotation won't fix it; only the
    // semantic pass can distill them. No archive spam, just the nudge.
    console.error(
      '[berserqir:memory-journal] memory-short.md is over budget and the bulk is in agent sections (§Focus/§Errors/§Open threads) — run /berserqir compress.',
    )
  }
}

// strategic compact (ECC pattern, stateless): when the journal grows long,
// suggest /compress proactively instead of waiting for the size budget to blow.
const journalLines = (raw.slice(idx).match(/^- \d{4}-/gm) || []).length + 1
if (journalLines > 0 && journalLines % 40 === 0)
  console.error(
    `[berserqir:memory-journal] journal has ${journalLines} entries — consider /berserqir compress at the next logical break`,
  )

// evolve-readiness (stateless): when instincts.json is written (e.g. by /learn),
// flag mature clusters at the natural moment — detection is deterministic,
// promotion stays agent-side (/evolve) behind its human ALIGN gate.
if ((evt.target ?? '').endsWith('instincts.json')) {
  try {
    const inst = JSON.parse(
      readFileSync(join(MEMORY_DIR, 'instincts.json'), 'utf8'),
    )
    const byScope = {}
    for (const i of inst.instincts ?? [])
      if (i.status === 'active' && i.confidence >= 0.7)
        byScope[i.scope] = (byScope[i.scope] ?? 0) + 1
    const ready = Object.entries(byScope).filter(([, n]) => n >= 3)
    if (ready.length)
      console.error(
        `[berserqir:memory-journal] evolve-ready instinct cluster(s): ${ready
          .map(([s, n]) => `${s} (${n})`)
          .join(', ')} — run /berserqir evolve (human OK still required)`,
      )
  } catch {
    // malformed instincts.json is memory-validate's job, not ours
  }
}
process.exit(0)
