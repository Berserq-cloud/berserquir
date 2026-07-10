#!/usr/bin/env node
// Berserqir advisory: front-quality
// Deterministic anti-slop + quality signals over edited front-end source files,
// plus color-drift detection against the project's DESIGN.md tokens.
//
// ADVISORY BY DESIGN — always exit 0. Design is judgment: hooks surface signals,
// agents (and humans) decide. A blocking design cop would train agents to game
// the regex instead of exercising taste (the anti-slop skill holds the law).
//
// Rules distilled from Impeccable (https://github.com/pbakaus/impeccable),
// Apache 2.0 © Paul Bakaus — regex/source-engine subset only (zero-deps; the
// jsdom/puppeteer engines stay in Impeccable, use it as a companion for
// rendered-page audits).
//
// Input:   edited file path as argv[2]
// Output:  findings on stderr (capped) · exit 0 always
// Opt-out: BERSERQIR_FRONT_QUALITY=0

import { readFileSync, existsSync } from 'node:fs'
import { extname, join } from 'node:path'

if (process.env.BERSERQIR_FRONT_QUALITY === '0') process.exit(0)

const target = process.argv[2]
if (!target) process.exit(0)

const STYLE_EXT = new Set(['.css', '.scss', '.sass', '.less'])
const MARKUP_EXT = new Set(['.html', '.jsx', '.tsx', '.vue', '.svelte', '.astro', '.mdx'])
const ext = extname(target).toLowerCase()
if (!STYLE_EXT.has(ext) && !MARKUP_EXT.has(ext)) process.exit(0)

let src = ''
try {
  src = readFileSync(target, 'utf8')
} catch {
  process.exit(0) // deleted/unreadable — nothing to advise
}

const findings = []
const flag = (rule, hint) => findings.push(`${rule} — ${hint}`)

// ── slop tells (CSS-in-source) ──────────────────────────────────────────────
if (/(-webkit-)?background-clip:\s*text|\bbg-clip-text\b/.test(src))
  flag('gradient-text', 'solid color; emphasis via weight/size')

if (/border-left:\s*[2-9]px\s+solid|\bborder-l-[2-9]\b/.test(src))
  flag('side-stripe accent', 'the #1 AI tell — full border, bg tint, or nothing')

if (
  /linear-gradient\([^)]*\b(purple|violet|indigo|fuchsia)\b/i.test(src) ||
  /linear-gradient\([^)]*#(8b5cf6|7c3aed|a855f7|9333ea|6d28d9)/i.test(src)
)
  flag('AI color palette', 'purple/violet gradients are the training-data reflex')

// cubic-bezier overshoot (y1/y2 outside [0,1] = bounce/elastic feel)
for (const m of src.matchAll(/cubic-bezier\(\s*([^)]+)\)/g)) {
  const args = m[1].split(',').map((n) => parseFloat(n))
  if (args.length === 4 && (args[1] < 0 || args[1] > 1 || args[3] < 0 || args[3] > 1)) {
    flag('bounce/elastic easing', 'real objects decelerate — use ease-out quart/quint/expo')
    break
  }
}

if (/transition[^;{}]*\b(width|height|top|left|margin|padding)\b/.test(src))
  flag('layout-property transition', 'animate transform/opacity — layout props thrash')

// ── quality signals ─────────────────────────────────────────────────────────
for (const m of src.matchAll(/font-size:\s*(\d+)px|\btext-\[(\d+)px\]/g)) {
  const px = parseInt(m[1] ?? m[2], 10)
  if (px > 0 && px < 12) {
    flag('tiny text', `${px}px body text — 14px minimum, 16px ideal`)
    break
  }
}

for (const m of src.matchAll(/line-height:\s*(0?\.\d+|1\.[0-2])\b(?!\d)/g)) {
  if (parseFloat(m[1]) < 1.3) {
    flag('tight leading', 'line-height <1.3 — body text needs 1.5–1.7')
    break
  }
}

// ── copy tells (markup files only) ──────────────────────────────────────────
if (MARKUP_EXT.has(ext)) {
  if ((src.match(/—/g) ?? []).length > 2)
    flag('em-dash overuse', '>2 em-dashes reads as AI cadence — commas/colons/periods')

  const buzz = src.match(
    /\b(streamline|empower|supercharge|world-class|enterprise-grade|next-generation|cutting-edge|best-in-class|game-chang\w*)\b/gi,
  )
  if (buzz && buzz.length >= 2)
    flag('marketing buzzwords', `${[...new Set(buzz.map((b) => b.toLowerCase()))].join(', ')} — say what it literally does`)
}

// ── DESIGN.md color drift (the project's own law, when it exists) ──────────
const designPath = join(process.cwd(), 'DESIGN.md')
if (existsSync(designPath)) {
  try {
    const design = readFileSync(designPath, 'utf8')
    const tokens = new Set(
      [...design.matchAll(/#([0-9a-f]{3}|[0-9a-f]{6})\b/gi)].map((m) =>
        m[0].toLowerCase(),
      ),
    )
    if (tokens.size >= 3) {
      // only enforce once the palette is actually documented
      const drift = [
        ...new Set(
          [...src.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi)].map((m) =>
            m[0].toLowerCase(),
          ),
        ),
      ].filter((c) => !tokens.has(c))
      if (drift.length)
        flag(
          'color outside DESIGN.md',
          `${drift.slice(0, 4).join(', ')}${drift.length > 4 ? '…' : ''} — use a documented token or update DESIGN.md deliberately`,
        )
    }
  } catch {
    /* malformed DESIGN.md is memory-validate's job */
  }
}

if (findings.length) {
  process.stderr.write(
    `[berserqir:front-quality] advisory (${target}):\n` +
      findings
        .slice(0, 8)
        .map((f) => `  · ${f}`)
        .join('\n') +
      '\n  Judgment beats regex — see the anti-slop skill and DESIGN.md. This never blocks.\n',
  )
}
process.exit(0)
