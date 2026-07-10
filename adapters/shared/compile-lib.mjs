// Berserqir adapters — shared compiler library (zero dependencies).
// Extracted from the three per-harness compilers once the rule of three was
// reached (copilot → claude-code → cursor): every function here was previously
// duplicated byte-for-byte (serMeta is the copilot superset — safe everywhere,
// object lists never reach the other harnesses' frontmatter whitelists).
//
// What stays IN each adapter (the part that genuinely varies per harness):
// frontmatter whitelists, BODY_SECTIONS, tool mapping shape, emit layout,
// hooks wiring, templates, manifest. What lives here is the invariant machine:
// parsing, composition, path rewriting, overlays/tier map, hub vendoring.
//
// NOTE: hook-adapter.mjs files must stay self-contained — they are vendored as
// single files into installed projects. This lib is compile-time only.

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  existsSync,
  cpSync,
  statSync,
} from 'node:fs'
import { join, basename, relative } from 'node:path'

// ---------- args ----------
export function parseArgs(argv) {
  const args = argv.slice(2)
  const argOf = (f, d) => {
    const i = args.indexOf(f)
    return i === -1 ? d : args[i + 1]
  }
  const ROOT = argOf('--root', '.')
  const OUT = argOf('--out', '.')
  const PROFILES = (argOf('--profiles', 'front') || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && s !== 'core') // 'core' = explicit core-only (no area profiles)
    .flatMap((p) =>
      p === 'full' || p === 'stack' || p === 'all'
        ? ['front', 'back', 'ops', 'infra']
        : [p],
    )
    .flatMap((p) =>
      p === 'ops'
        ? ['ops/dev', 'ops/sec', 'ops/fin', 'ops/ia'].filter((s) =>
            existsSync(join(ROOT, 'profiles', s, 'agents')),
          )
        : [p],
    )
  return { argOf, ROOT, OUT, PROFILES }
}

// ---------- tiny YAML frontmatter (flat keys + block lists + lists of flat objects) ----------
export function parseDoc(raw) {
  if (!raw.startsWith('---\n')) return { meta: {}, body: raw }
  const end = raw.indexOf('\n---', 4)
  if (end === -1) return { meta: {}, body: raw }
  return {
    meta: parseYaml(raw.slice(4, end)),
    body: raw.slice(raw.indexOf('\n', end + 1) + 1),
  }
}
export function parseYaml(src) {
  const meta = {}
  const lines = src.split('\n')
  let i = 0
  while (i < lines.length) {
    const m = lines[i].match(/^([A-Za-z][\w-]*):\s*(.*)$/)
    if (!m) {
      i++
      continue
    }
    const key = m[1],
      rest = m[2].trim()
    if (rest !== '') {
      meta[key] = parseVal(rest)
      i++
      continue
    }
    const items = [] // block list
    i++
    while (i < lines.length && /^\s+\S/.test(lines[i])) {
      const im = lines[i].match(/^\s+-\s+(.*)$/)
      if (!im) {
        i++
        continue
      }
      const om = im[1].trim().match(/^([A-Za-z][\w-]*):\s*(.*)$/)
      if (om) {
        // object item (label/agent/prompt/send)
        const obj = { [om[1]]: parseVal(om[2]) }
        i++
        while (
          i < lines.length &&
          /^\s+[A-Za-z][\w-]*:/.test(lines[i]) &&
          !/^\s+-\s/.test(lines[i])
        ) {
          const km = lines[i].trim().match(/^([A-Za-z][\w-]*):\s*(.*)$/)
          if (km) obj[km[1]] = parseVal(km[2])
          i++
        }
        items.push(obj)
      } else {
        items.push(parseVal(im[1].trim()))
        i++
      }
    }
    meta[key] = items
  }
  return meta
}
export const parseVal = (v) => {
  v = v.trim()
  if (v === 'true') return true
  if (v === 'false') return false
  if (/^\[.*\]$/.test(v))
    return v
      .slice(1, -1)
      .split(',')
      .map((s) => s.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean)
  return v.replace(/^["']|["']$/g, '')
}
export const q = (v) =>
  typeof v === 'string' && (/[:#"]/.test(v) || /^[*&!>|%@`\[\{]/.test(v))
    ? `"${v.replaceAll('"', '\\"')}"`
    : String(v)
export function serMeta(meta) {
  const out = []
  for (const [k, v] of Object.entries(meta)) {
    if (Array.isArray(v) && v.length === 0) continue
    if (Array.isArray(v) && typeof v[0] === 'object') {
      // list of objects (handoffs)
      out.push(`${k}:`)
      for (const obj of v)
        Object.entries(obj).forEach(([ok, ov], idx) =>
          out.push(`${idx === 0 ? '  - ' : '    '}${ok}: ${q(ov)}`),
        )
    } else if (Array.isArray(v)) {
      // block list (tools, agents)
      out.push(`${k}:`)
      for (const item of v) out.push(`  - ${item}`)
    } else out.push(`${k}: ${q(v)}`)
  }
  return out.join('\n')
}
export const toArr = (v) => (v == null ? [] : Array.isArray(v) ? v : [v])

// ---------- path rewriting (canonical → installed layout) ----------
// Common hub rewrites first, then harness-specific rules (string pair or
// [regex, replacement]) applied in the order given.
export function makeRewritePaths(harnessRules) {
  return (text) => {
    let t = text
      .replaceAll('core/protocols/', '.berserqir/protocols/')
      .replaceAll('core/templates/', '.berserqir/templates/')
      .replaceAll('core/memory/', '.berserqir/memory/')
      .replaceAll('core/hooks/', '.berserqir/hooks/')
      .replaceAll('core/evals/', '.berserqir/evals/')
      .replaceAll('core/skills-resources/', '.berserqir/skills-resources/')
    for (const [from, to] of harnessRules)
      t = from instanceof RegExp ? t.replace(from, to) : t.replaceAll(from, to)
    return t
  }
}

// ---------- canonical sources ----------
export function loadArchetypes(ROOT) {
  const archetypes = {}
  for (const f of readdirSync(join(ROOT, 'core/agents')).filter((f) =>
    f.endsWith('.md'),
  )) {
    const doc = parseDoc(readFileSync(join(ROOT, 'core/agents', f), 'utf8'))
    archetypes[doc.meta.name ?? basename(f, '.md')] = doc
  }
  return archetypes
}

// overlays FIRST → tier map (area squads replace generic execution archetypes)
export function loadOverlays(ROOT, PROFILES, archetypes, harness) {
  const overlayDocs = []
  const tierMap = {} // generic archetype name (== tier) → [area agent names]
  for (const prof of PROFILES) {
    const dir = join(ROOT, 'profiles', prof, 'agents')
    if (!existsSync(dir)) {
      console.error(
        `[berserqir:${harness}] error: unknown profile "${prof}" (no ${relative(process.cwd(), dir)})`,
      )
      process.exit(1)
    }
    for (const f of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const doc = parseDoc(readFileSync(join(dir, f), 'utf8'))
      overlayDocs.push({ doc, prof, src: `profiles/${prof}/agents/${f}` })
      const tier = doc.meta.tier ?? archetypes[doc.meta.extends]?.meta.tier
      if (tier) (tierMap[tier] ??= []).push(doc.meta.name)
    }
  }
  return { overlayDocs, tierMap }
}

// rewrite generic execution references (agents lists + handoff targets) to area agents
export function makeSubstituteRefs(tierMap) {
  return (meta) => {
    if (Array.isArray(meta.agents))
      meta.agents = meta.agents.flatMap((n) =>
        tierMap[n]?.length ? tierMap[n] : [n],
      )
    if (Array.isArray(meta.handoffs) && typeof meta.handoffs[0] === 'object')
      meta.handoffs = meta.handoffs.flatMap((h) => {
        const subs = tierMap[h.agent]
        if (!subs?.length) return [h]
        return subs.length === 1
          ? [{ ...h, agent: subs[0] }]
          : subs.map((s) => ({ ...h, agent: s, label: `${h.label} — ${s}` }))
      })
  }
}

// ---------- composition (archetype ⊕ overlay; overlay wins, `never` unions) ----------
export function composeAgent(doc, archetypes, source) {
  let meta = { ...doc.meta }
  const bodies = []
  if (meta.extends) {
    const arch = archetypes[meta.extends]
    if (!arch) throw new Error(`${source}: unknown archetype "${meta.extends}"`)
    const never = [
      ...new Set([...toArr(arch.meta.never), ...toArr(meta.never)]),
    ]
    meta = { ...arch.meta, ...meta } // overlay wins (lists replace)
    if (never.length) meta.never = never // except `never`: union
    delete meta.extends
    bodies.push(arch.body.trim())
  }
  bodies.push(doc.body.trim())
  return { meta, bodies }
}

// model resolution: agent override > profile×class > class > omit (harness default — plan-safe)
export function resolveModel(MODELS, meta, profile, overrideKey = meta.name) {
  const resolved =
    MODELS.overrides?.[overrideKey] ||
    (profile && MODELS.profiles?.[profile]?.[meta.model]) ||
    MODELS[meta.model] ||
    ''
  if (resolved) meta.model = resolved
  else delete meta.model
}

// ---------- emit ----------
export function makeWriter(OUT) {
  const emitted = []
  const write = (rel, content) => {
    const p = join(OUT, rel)
    mkdirSync(join(p, '..'), { recursive: true })
    writeFileSync(p, content)
    emitted.push(rel)
  }
  return { write, emitted }
}

export function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

// vendor the hub (.berserqir/) with path rewriting inside .md/.mjs files
export function vendorHub(ROOT, OUT, rewritePaths, emitted) {
  for (const [src, dst] of [
    ['core/protocols', '.berserqir/protocols'],
    ['core/templates', '.berserqir/templates'],
    ['core/memory/templates', '.berserqir/memory/templates'],
    ['core/memory/schemas', '.berserqir/memory/schemas'],
    ['core/hooks', '.berserqir/hooks'],
    ['core/evals', '.berserqir/evals'],
    ['core/skills-resources', '.berserqir/skills-resources'],
  ]) {
    const from = join(ROOT, src)
    if (!existsSync(from)) continue
    cpSync(from, join(OUT, dst), { recursive: true })
    for (const f of walk(join(OUT, dst))) {
      if (f.endsWith('.md') || f.endsWith('.mjs'))
        writeFileSync(f, rewritePaths(readFileSync(f, 'utf8')))
      emitted.push(relative(OUT, f))
    }
  }
}
