#!/usr/bin/env node
// Berserqir → GitHub Copilot adapter (compiler)
// Canonical sources → .github/ (spokes) + .berserqir/ (hub). Zero dependencies.
//
// Usage: node adapters/copilot/compile.mjs [--root <repo>] [--out <target>] [--profiles front,back,...]
//
// Rules implemented (see core/FORMAT.md):
//  - agent = archetype ⊕ overlay (overlay wins; lists replace; `never` unions; `extends` consumed)
//  - Copilot .agent.md frontmatter is a CLOSED schema — unsupported fields render as body sections
//  - `model: top|mid|fast` translates via models.json
//  - body path references rewritten: core/* → .berserqir/* or .github/*
//  - NEVER edit compiled output — edit canonical and recompile

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
const args = process.argv.slice(2)
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
          existsSync(join(argOf('--root', '.'), 'profiles', s, 'agents')),
        )
      : [p],
  )

const MODELS_PATH =
  argOf('--models', null) || join(ROOT, 'adapters/copilot/models.json')
const MODELS = JSON.parse(readFileSync(MODELS_PATH, 'utf8'))
const TOOLMAP = JSON.parse(
  readFileSync(join(ROOT, 'adapters/copilot/tools.json'), 'utf8'),
)

// Copilot closed schemas
const AGENT_KEYS = new Set([
  'name',
  'description',
  'model',
  'tools',
  'agents',
  'handoffs',
  'user-invocable',
  'disable-model-invocation',
  'target',
  'github',
  'argument-hint',
])
const PROMPT_KEYS = new Set([
  'description',
  'agent',
  'model',
  'tools',
  'argument-hint',
])
const SKILL_KEYS = new Set(['name', 'description'])

// canonical fields rendered as body sections (stable order, per FORMAT.md)
const BODY_SECTIONS = [
  ['type', 'Role Type'],
  ['tier', 'Tier'],
  ['parallelizable', 'Parallelizable'],
  ['escalates-to', 'Escalates To'],
  ['skills', 'Skills'],
  ['never', 'Scope (never touch)'],
]

// ---------- tiny YAML frontmatter (flat keys + block lists + lists of flat objects) ----------
function parseDoc(raw) {
  if (!raw.startsWith('---\n')) return { meta: {}, body: raw }
  const end = raw.indexOf('\n---', 4)
  if (end === -1) return { meta: {}, body: raw }
  return {
    meta: parseYaml(raw.slice(4, end)),
    body: raw.slice(raw.indexOf('\n', end + 1) + 1),
  }
}
function parseYaml(src) {
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
const parseVal = (v) => {
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
const q = (v) =>
  typeof v === 'string' && (/[:#"]/.test(v) || /^[*&!>|%@`\[\{]/.test(v))
    ? `"${v.replaceAll('"', '\\"')}"`
    : String(v)
function serMeta(meta) {
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
const toArr = (v) => (v == null ? [] : Array.isArray(v) ? v : [v])

// ---------- path rewriting (canonical → installed layout) ----------
const rewritePaths = (text) =>
  text
    .replaceAll('core/protocols/', '.berserqir/protocols/')
    .replaceAll('core/templates/', '.berserqir/templates/')
    .replaceAll('core/memory/', '.berserqir/memory/')
    .replaceAll('core/hooks/', '.berserqir/hooks/')
    .replaceAll('core/evals/', '.berserqir/evals/')
    .replaceAll('core/skills-resources/', '.berserqir/skills-resources/')
    .replaceAll('core/skills/', '.github/skills/')
    .replaceAll('core/prompts/', '.github/prompts/')

// ---------- load archetypes ----------
const archetypes = {}
for (const f of readdirSync(join(ROOT, 'core/agents')).filter((f) =>
  f.endsWith('.md'),
)) {
  const doc = parseDoc(readFileSync(join(ROOT, 'core/agents', f), 'utf8'))
  archetypes[doc.meta.name ?? basename(f, '.md')] = doc
}

// ---------- agent compilation ----------
const roster = []
function compileAgent(doc, source, profile = null) {
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

  substituteRefs(meta) // generic execution refs → area squad (no-op when no overlays cover the tier)
  if (meta.name === 'orchestrator') {
    // orchestrator can route to the ENTIRE installed squad (incl. specialists)
    const all = overlayDocs.map((o) => o.doc.meta.name)
    meta.agents = [...new Set([...toArr(meta.agents), ...all])]
  }

  roster.push({
    name: meta.name,
    type: meta.type ?? '—',
    tier: meta.tier ?? '—',
    description: meta.description ?? '',
  })

  if (Array.isArray(meta.tools))
    meta.tools = meta.tools.map((t) => TOOLMAP[t] ?? t)
  // model resolution: agent override > profile×class > class > omit (harness default — free-plan safe)
  const resolved =
    MODELS.overrides?.[meta.name] ||
    (profile && MODELS.profiles?.[profile]?.[meta.model]) ||
    MODELS[meta.model] ||
    ''
  if (resolved) meta.model = resolved
  else delete meta.model

  const fm = {},
    extra = {}
  for (const [k, v] of Object.entries(meta))
    (AGENT_KEYS.has(k) ? fm : extra)[k] = v

  let sections = ''
  for (const [key, title] of BODY_SECTIONS) {
    if (!(key in extra)) continue
    const v = extra[key]
    sections += `\n## ${title}\n\n${Array.isArray(v) ? v.map((x) => `- ${x}`).join('\n') : String(v)}\n`
  }

  const content =
    `---\n${serMeta(fm)}\n---\n\n` +
    `<!-- Compiled by Berserqir from ${source}. DO NOT EDIT — edit canonical sources and recompile. -->\n` +
    sections +
    '\n' +
    bodies.join('\n\n---\n\n') +
    '\n'
  return { name: meta.name, content: rewritePaths(content) }
}

// ---------- emit helpers ----------
const write = (rel, content) => {
  const p = join(OUT, rel)
  mkdirSync(join(p, '..'), { recursive: true })
  writeFileSync(p, content)
  emitted.push(rel)
}
const emitted = []

// 1) agents — parse overlays FIRST to build the tier map (area squads replace generic execution archetypes)
const overlayDocs = []
const tierMap = {} // generic archetype name (== tier) → [area agent names]
for (const prof of PROFILES) {
  const dir = join(ROOT, 'profiles', prof, 'agents')
  if (!existsSync(dir)) {
    console.error(
      `[berserqir:copilot] error: unknown profile "${prof}" (no ${relative(process.cwd(), dir)})`,
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
// rewrite generic execution references (agents lists + handoff targets) to area agents
function substituteRefs(meta) {
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

// core archetypes: skip generic execution tiers covered by an area squad
for (const [name, doc] of Object.entries(archetypes)) {
  if (tierMap[name]?.length) continue // covered by overlay(s)
  const { content } = compileAgent(
    { meta: { ...doc.meta }, body: doc.body },
    `core/agents/${name}.md`,
  )
  write(`.github/agents/${name}.agent.md`, content)
}
for (const { doc, prof, src } of overlayDocs) {
  const { name, content } = compileAgent(doc, src, prof)
  write(`.github/agents/${name}.agent.md`, content)
}

// 2) prompts
for (const f of readdirSync(join(ROOT, 'core/prompts')).filter((f) =>
  f.endsWith('.prompt.md'),
)) {
  const doc = parseDoc(readFileSync(join(ROOT, 'core/prompts', f), 'utf8'))
  const fm = {}
  for (const [k, v] of Object.entries(doc.meta))
    if (PROMPT_KEYS.has(k)) fm[k] = v
  write(
    `.github/prompts/${f}`,
    `---\n${serMeta(fm)}\n---\n\n${rewritePaths(doc.body.trim())}\n`,
  )
}

// 3) skills: core + selected profiles
const skillDirs = [
  ['core/skills', null],
  ...PROFILES.map((p) => [`profiles/${p}/skills`, p]),
]
for (const [dirRel] of skillDirs) {
  const dir = join(ROOT, dirRel)
  if (!existsSync(dir)) continue
  for (const id of readdirSync(dir)) {
    const p = join(dir, id, 'SKILL.md')
    if (!existsSync(p)) continue
    const doc = parseDoc(readFileSync(p, 'utf8'))
    const fm = {}
    for (const [k, v] of Object.entries(doc.meta))
      if (SKILL_KEYS.has(k)) fm[k] = v
    write(
      `.github/skills/${id}/SKILL.md`,
      `---\n${serMeta(fm)}\n---\n\n${rewritePaths(doc.body.trim())}\n`,
    )
  }
}

// 3b) instructions: core + selected profiles → .github/instructions/ (applyTo preserved)
const INSTR_KEYS = new Set(['description', 'applyTo'])
const instrDirs = [
  'core/instructions',
  ...PROFILES.map((p) => `profiles/${p}/instructions`),
]
for (const dirRel of instrDirs) {
  const dir = join(ROOT, dirRel)
  if (!existsSync(dir)) continue
  for (const f of readdirSync(dir).filter((f) =>
    f.endsWith('.instructions.md'),
  )) {
    const doc = parseDoc(readFileSync(join(dir, f), 'utf8'))
    const fm = {}
    for (const [k, v] of Object.entries(doc.meta))
      if (INSTR_KEYS.has(k)) fm[k] = v
    write(
      `.github/instructions/${f}`,
      `---\n${serMeta(fm)}\n---\n\n${rewritePaths(doc.body.trim())}\n`,
    )
  }
}

// 4) vendor the hub (.berserqir/) with path rewriting inside .md files
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
function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

// 4b) hooks wiring: Copilot hooks JSON (schema verified against Setup 1) + payload adapter
cpSync(
  join(ROOT, 'adapters/copilot/hook-adapter.mjs'),
  join(OUT, '.berserqir/hooks/copilot-adapter.mjs'),
)
emitted.push('.berserqir/hooks/copilot-adapter.mjs')
// 4c) model config vendored into the hub — /init question 8 reads affinities and
// writes models; installer feeds .berserqir/models.json back into recompiles
write('.berserqir/models.json', JSON.stringify(MODELS, null, 2) + '\n')
write(
  '.berserqir/affinities.json',
  readFileSync(join(ROOT, 'adapters/copilot/affinities.json'), 'utf8'),
)
write(
  '.github/hooks/berserqir.json',
  JSON.stringify(
    {
      version: 1,
      hooks: {
        postToolUse: [
          {
            type: 'command',
            matcher: 'edit|create|apply_patch',
            bash: `node "$(git rev-parse --show-toplevel)/.berserqir/hooks/copilot-adapter.mjs"`,
            timeoutSec: 10,
          },
        ],
      },
    },
    null,
    2,
  ) + '\n',
)

// 5) copilot-instructions.md + AGENTS.md (roster injected)
const rosterMd = [
  '| Agent | Type | Tier | Description |',
  '|---|---|---|---|',
  ...roster.map(
    (r) => `| ${r.name} | ${r.type} | ${r.tier} | ${r.description} |`,
  ),
].join('\n')
for (const [tpl, dest] of [
  ['copilot-instructions.template.md', '.github/copilot-instructions.md'],
  ['agents-md.template.md', 'AGENTS.md'],
]) {
  const t = readFileSync(join(ROOT, 'adapters/copilot', tpl), 'utf8')
  write(dest, rewritePaths(t.replaceAll('{{ROSTER}}', rosterMd)))
}

// 6) manifest
const fileCount = new Set(emitted).size + 1 // +1 = manifest itself; Set dedupes stale files from prior compiles into the same OUT
write(
  '.berserqir/manifest.json',
  JSON.stringify(
    {
      harness: 'copilot',
      version: '0.0.1',
      compiledAt: new Date().toISOString(),
      profiles: PROFILES,
      agents: roster.map((r) => r.name),
      files: fileCount,
    },
    null,
    2,
  ) + '\n',
)

console.log(
  `[berserqir:copilot] compiled ${roster.length} agents, ${fileCount} files → ${OUT}`,
)
console.log(`  profiles: ${PROFILES.join(', ') || '(core only)'}`)
console.log(
  `  hooks: wired via .github/hooks/berserqir.json → .berserqir/hooks/copilot-adapter.mjs`,
)
