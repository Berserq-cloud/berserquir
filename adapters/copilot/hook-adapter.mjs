#!/usr/bin/env node
// Berserqir → Copilot hook adapter (DRY pattern: normalize harness payload,
// delegate to canonical zero-deps hooks). Vendored to .berserqir/hooks/.
//
// Wired via .github/hooks/berserqir.json (postToolUse: edit|create|apply_patch).
// Defensive: unknown payload shapes → exit 0 silently (never break the harness).

import { readFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HOOKS_DIR = dirname(fileURLToPath(import.meta.url))

// ---- read + normalize event (tolerant to schema variations) ----
let evt = {}
try {
  evt = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  /* no/invalid stdin */
}

const paths = [
  evt.tool_input?.file_path,
  evt.tool_input?.filePath,
  evt.file_path,
  evt.filePath,
  evt.path,
  ...(Array.isArray(evt.files) ? evt.files : []),
].filter(Boolean)
const tool = evt.tool_name ?? evt.tool ?? 'edit'
const agent = evt.agent ?? evt.agent_name ?? 'copilot'

// Read-only tools never gate and never journal — a read is not a mutation.
// The berserqir.json matcher filters to edit|create|apply_patch, but payload
// shapes vary across Copilot builds; this is defense in depth after a real
// incident where a read of an over-budget memory file blocked the chat
// (deadlocking the very /compress that would fix it).
if (/read|grep|search|list|fetch|glob|usage|semantic|dir/i.test(tool))
  process.exit(0)

if (paths.length === 0) process.exit(0)

// ---- run canonical guardrails per path ----
let blocked = null
for (const p of paths) {
  // journal FIRST (best-effort, never blocks) — its auto-rotate archives an
  // over-budget §Journal before memory-validate gates on the same budget
  const journal = join(HOOKS_DIR, 'memory-journal/memory-journal.mjs')
  if (existsSync(journal)) {
    const j = spawnSync(process.execPath, [journal, agent, tool, p], {
      encoding: 'utf8',
    })
    if (j.stderr) process.stderr.write(j.stderr)
  }

  const cp = spawnSync(
    process.execPath,
    [join(HOOKS_DIR, 'config-protection/config-protection.mjs'), p],
    { encoding: 'utf8' },
  )
  if (cp.status === 2) blocked = cp.stderr

  const mv = spawnSync(
    process.execPath,
    [join(HOOKS_DIR, 'memory-validate/memory-validate.mjs'), p],
    { encoding: 'utf8' },
  )
  if (mv.status === 2) blocked = (blocked ?? '') + mv.stderr

  // advisories (stray root docs, front slop/DESIGN drift) — surface, never block
  for (const adv of [
    'stray-doc/stray-doc.mjs',
    'front-quality/front-quality.mjs',
    'back-quality/back-quality.mjs',
  ]) {
    const a = join(HOOKS_DIR, adv)
    if (!existsSync(a)) continue
    const r = spawnSync(process.execPath, [a, p], { encoding: 'utf8' })
    if (r.stderr) process.stderr.write(r.stderr)
  }
}

// update nudge (best-effort, throttled to once/day inside the hook)
const upd = join(HOOKS_DIR, 'update-check/update-check.mjs')
if (existsSync(upd)) {
  const u = spawnSync(process.execPath, [upd], { encoding: 'utf8' })
  if (u.stderr) process.stderr.write(u.stderr)
}

if (blocked) {
  process.stderr.write(blocked)
  process.exit(2)
}
process.exit(0)
