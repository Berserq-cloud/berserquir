#!/usr/bin/env node
// Berserqir → Cursor adapter (compiler)
// Canonical sources → .cursor/ (spokes) + AGENTS.md + .berserqir/ (hub). Zero dependencies.
//
// Usage: node adapters/cursor/compile.mjs [--root <repo>] [--out <target>] [--profiles front,back,...] [--models <path>]
//
// Rules implemented (see core/FORMAT.md):
//  - agent = archetype ⊕ overlay (overlay wins; lists replace; `never` unions; `extends` consumed)
//  - agents are PREFIXED bq-* (.cursor/agents/bq-<n>.md — ECC precedent, avoids collisions with user agents)
//  - Cursor agent frontmatter whitelist: name, description, model — tools discipline renders as body '## Tools (allowed)'
//  - instructions → NATIVE glob-scoped rules (.cursor/rules/bq-<area>.mdc, alwaysApply: false)
//  - bootstrap → .cursor/rules/berserqir.mdc (alwaysApply: true)
//  - prompts → .cursor/commands/<name>.md (plain markdown slash commands)
//  - hooks → .cursor/hooks.json: beforeShellExecution DENIES via JSON permission protocol (git-safety native block)
//  - NEVER edit compiled output — edit canonical and recompile
//
// Shared machine (parser/composition/overlays/vendoring) lives in
// adapters/shared/compile-lib.mjs — extracted at the rule of three.

import { readFileSync, readdirSync, existsSync, cpSync } from 'node:fs'
import { join } from 'node:path'
import {
  parseArgs,
  parseDoc,
  q,
  serMeta,
  toArr,
  makeRewritePaths,
  loadArchetypes,
  loadOverlays,
  makeSubstituteRefs,
  composeAgent,
  resolveModel,
  makeWriter,
  vendorHub,
} from '../shared/compile-lib.mjs'

// ---------- args ----------
const { argOf, ROOT, OUT, PROFILES } = parseArgs(process.argv)

const MODELS_PATH =
  argOf('--models', null) || join(ROOT, 'adapters/cursor/models.json')
const MODELS = JSON.parse(readFileSync(MODELS_PATH, 'utf8'))
const TOOLMAP = JSON.parse(
  readFileSync(join(ROOT, 'adapters/cursor/tools.json'), 'utf8'),
)

const PREFIX = 'bq-'

// Cursor closed schemas (FORMAT.md whitelists)
const AGENT_KEYS = new Set(['name', 'description', 'model'])
const SKILL_KEYS = new Set(['name', 'description'])

// canonical fields rendered as body sections (stable order, per FORMAT.md)
const BODY_SECTIONS = [
  ['type', 'Role Type'],
  ['tier', 'Tier'],
  ['parallelizable', 'Parallelizable'],
  ['escalates-to', 'Escalates To'],
  ['skills', 'Skills'],
  ['never', 'Scope (never touch)'],
  ['tools', 'Tools (allowed)'],
  ['agents', 'Subagents'],
]

// ---------- shared machine (adapters/shared/compile-lib.mjs) ----------
const rewritePaths = makeRewritePaths([
  ['core/skills/', '.cursor/skills/'],
  [/core\/prompts\/([\w-]+)\.prompt\.md/g, '.cursor/commands/$1.md'],
  ['core/prompts/', '.cursor/commands/'],
])
const archetypes = loadArchetypes(ROOT)

// ---------- agent compilation ----------
const roster = []
function compileAgent(doc, source, profile = null) {
  const { meta, bodies } = composeAgent(doc, archetypes, source)

  substituteRefs(meta)
  if (meta.name === 'orchestrator') {
    const all = overlayDocs.map((o) => o.doc.meta.name)
    meta.agents = [...new Set([...toArr(meta.agents), ...all])]
  }

  // Cursor namespace: prefix the agent and every squad reference
  meta.name = PREFIX + meta.name
  if (Array.isArray(meta.agents))
    meta.agents = meta.agents.map((n) => PREFIX + n)
  if (Array.isArray(meta.handoffs) && typeof meta.handoffs[0] === 'object')
    meta.handoffs = meta.handoffs.map((h) => ({
      ...h,
      agent: PREFIX + h.agent,
    }))

  roster.push({
    name: meta.name,
    type: meta.type ?? '—',
    tier: meta.tier ?? '—',
    description: meta.description ?? '',
  })

  // tools discipline → body section labels (no verified Cursor frontmatter for tools)
  if (Array.isArray(meta.tools))
    meta.tools = meta.tools.map((t) => TOOLMAP[t] ?? t)
  // model resolution: agent override > profile×class > class > omit (Cursor Auto — plan-safe)
  resolveModel(MODELS, meta, profile, meta.name.slice(PREFIX.length))

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
  if (Array.isArray(extra.handoffs) && extra.handoffs.length)
    sections +=
      `\n## Handoffs & Escalation\n\n` +
      extra.handoffs
        .map(
          (h) =>
            `- **${h.label ?? h.agent}** → \`${h.agent}\`${h.prompt ? ` — "${h.prompt}"` : ''}`,
        )
        .join('\n') +
      '\n'
  if (extra['disable-model-invocation'])
    sections += `\n## Invocation\n\nNever auto-invoked by other agents' model calls — entry point is the human (or explicit delegation).\n`

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
const { write, emitted } = makeWriter(OUT)

// 1) agents — parse overlays FIRST to build the tier map
const { overlayDocs, tierMap } = loadOverlays(
  ROOT,
  PROFILES,
  archetypes,
  'cursor',
)
const substituteRefs = makeSubstituteRefs(tierMap)

for (const [name, doc] of Object.entries(archetypes)) {
  if (tierMap[name]?.length) continue
  const { name: outName, content } = compileAgent(
    { meta: { ...doc.meta }, body: doc.body },
    `core/agents/${name}.md`,
  )
  write(`.cursor/agents/${outName}.md`, content)
}
for (const { doc, prof, src } of overlayDocs) {
  const { name: outName, content } = compileAgent(doc, src, prof)
  write(`.cursor/agents/${outName}.md`, content)
}

// 2) prompts → slash commands (plain markdown, command name = filename)
for (const f of readdirSync(join(ROOT, 'core/prompts')).filter((f) =>
  f.endsWith('.prompt.md'),
)) {
  const doc = parseDoc(readFileSync(join(ROOT, 'core/prompts', f), 'utf8'))
  let body = rewritePaths(doc.body.trim())
  if (doc.meta.agent)
    body = `> Hosted by the **${PREFIX}${doc.meta.agent}** role — adopt its discipline for this workflow.\n\n${body}`
  write(`.cursor/commands/${f.replace('.prompt.md', '.md')}`, body + '\n')
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
      `.cursor/skills/${id}/SKILL.md`,
      `---\n${serMeta(fm)}\n---\n\n${rewritePaths(doc.body.trim())}\n`,
    )
  }
}

// 3b) instructions → NATIVE glob-scoped rules (.mdc, auto-attached)
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
    const name = f.replace('.instructions.md', '')
    write(
      `.cursor/rules/${PREFIX}${name}.mdc`,
      `---\ndescription: ${q(doc.meta.description ?? '')}\nglobs: ${q(doc.meta.applyTo ?? '**')}\nalwaysApply: false\n---\n\n${rewritePaths(doc.body.trim())}\n`,
    )
  }
}

// 4) vendor the hub (.berserqir/) with path rewriting inside .md files
vendorHub(ROOT, OUT, rewritePaths, emitted)

// 4b) hooks wiring: .cursor/hooks.json (JSON permission protocol) + payload adapter
cpSync(
  join(ROOT, 'adapters/cursor/hook-adapter.mjs'),
  join(OUT, '.berserqir/hooks/cursor-adapter.mjs'),
)
emitted.push('.berserqir/hooks/cursor-adapter.mjs')
write(
  '.cursor/hooks.json',
  JSON.stringify(
    {
      version: 1,
      hooks: {
        beforeShellExecution: [
          { command: 'node .berserqir/hooks/cursor-adapter.mjs before-shell' },
        ],
        afterFileEdit: [
          { command: 'node .berserqir/hooks/cursor-adapter.mjs after-edit' },
        ],
        stop: [{ command: 'node .berserqir/hooks/cursor-adapter.mjs stop' }],
      },
    },
    null,
    2,
  ) + '\n',
)

// 4c) model config vendored into the hub (same /init question-8 cycle)
write('.berserqir/models.json', JSON.stringify(MODELS, null, 2) + '\n')
write(
  '.berserqir/affinities.json',
  readFileSync(join(ROOT, 'adapters/copilot/affinities.json'), 'utf8'), // affinity data is harness-agnostic — single source
)

// 5) bootstrap rule (always-on) + AGENTS.md (roster injected)
const rosterMd = [
  '| Agent | Type | Tier | Description |',
  '|---|---|---|---|',
  ...roster.map(
    (r) => `| ${r.name} | ${r.type} | ${r.tier} | ${r.description} |`,
  ),
].join('\n')
write(
  '.cursor/rules/berserqir.mdc',
  `---\ndescription: Berserqir harness bootstrap — protocols, governance, memory, safety\nalwaysApply: true\n---\n\n` +
    rewritePaths(
      readFileSync(
        join(ROOT, 'adapters/cursor/cursor-rule.template.md'),
        'utf8',
      ).replaceAll('{{ROSTER}}', rosterMd),
    ),
)
write(
  'AGENTS.md',
  rewritePaths(
    readFileSync(join(ROOT, 'adapters/copilot/agents-md.template.md'), 'utf8') // universal fallback — single source
      .replaceAll('{{ROSTER}}', rosterMd),
  ),
)

// 6) manifest
const fileCount = new Set(emitted).size + 1
write(
  '.berserqir/manifest.json',
  JSON.stringify(
    {
      harness: 'cursor',
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
  `[berserqir:cursor] compiled ${roster.length} agents, ${fileCount} files → ${OUT}`,
)
console.log(`  profiles: ${PROFILES.join(', ') || '(core only)'}`)
console.log(
  `  hooks: .cursor/hooks.json → .berserqir/hooks/cursor-adapter.mjs (before-shell git-safety DENIES · after-edit guardrails+journal · stop memory check)`,
)
