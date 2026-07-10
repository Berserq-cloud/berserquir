#!/usr/bin/env node
// Berserqir smoke suite — the deterministic battery, codified (zero deps).
// Run locally: node scripts/smoke.mjs · CI runs it on every push/PR and before publish.
// Exit 0 = all green · exit 1 = failure (message says which).

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  existsSync,
  readdirSync,
  statSync,
  cpSync,
} from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TMP = join(tmpdir(), `bq-smoke-${process.pid}`)
mkdirSync(TMP, { recursive: true })

let failures = 0
const check = (name, ok, detail = '') => {
  console.log(
    `  ${ok ? '✓' : '✗'} ${name}${ok || !detail ? '' : ` — ${detail}`}`,
  )
  if (!ok) failures++
}
const run = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { encoding: 'utf8', ...opts })
const node = (args, opts = {}) => run(process.execPath, args, opts)
const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })

// ---------- 1) syntax: every .mjs parses ----------
console.log('\n[1/5] syntax')
const mjsFiles = ['core', 'adapters', 'installer'].flatMap((d) =>
  walk(join(ROOT, d)).filter((f) => f.endsWith('.mjs')),
)
for (const f of mjsFiles) {
  const r = node(['--check', f])
  if (r.status !== 0) check(`node --check ${f}`, false, r.stderr.trim())
}
check(`${mjsFiles.length} .mjs files parse`, true)

// ---------- 2) guardrail behavior matrix ----------
console.log('\n[2/5] guardrails')
const hook = (name, args, env = {}) =>
  node([join(ROOT, `core/hooks/${name}`), ...args], {
    env: { ...process.env, ...env },
  }).status
check(
  'git-safety blocks push',
  hook('git-safety/git-safety.mjs', ['git push origin main']) === 2,
)
check(
  'git-safety allows status',
  hook('git-safety/git-safety.mjs', ['git status']) === 0,
)
check(
  'git-safety override works',
  hook('git-safety/git-safety.mjs', ['git push'], {
    BERSERQIR_GIT_ALLOW: '1',
  }) === 0,
)
check(
  'config-protection blocks .eslintrc',
  hook('config-protection/config-protection.mjs', ['.eslintrc.json']) === 2,
)
check(
  'config-protection blocks win-path workflow',
  hook('config-protection/config-protection.mjs', [
    'a\\.github\\workflows\\ci.yml',
  ]) === 2,
)
check(
  'config-protection allows app code',
  hook('config-protection/config-protection.mjs', ['src/app.js']) === 0,
)
check(
  'secret-scan blocks sk- key',
  hook('secret-scan/secret-scan.mjs', ['key=sk-abcdefghij0123456789XYZ']) === 2,
)
check(
  'secret-scan blocks Stripe live key',
  hook('secret-scan/secret-scan.mjs', [
    'STRIPE=sk_live_abcdefghij0123456789',
  ]) === 2,
)
check(
  'secret-scan blocks Google API key',
  hook('secret-scan/secret-scan.mjs', [
    'AIzaSyA1234567890abcdefghijklmnopqrstuvw',
  ]) === 2,
)
check(
  'secret-scan allows clean text',
  hook('secret-scan/secret-scan.mjs', ['hello world']) === 0,
)
check(
  'cmd-safety blocks rm -rf',
  hook('cmd-safety/cmd-safety.mjs', ['rm -rf src']) === 2,
)
check(
  'cmd-safety allows tmp-scoped rm',
  hook('cmd-safety/cmd-safety.mjs', ['rm -rf /tmp/bq-scratch']) === 0,
)
check(
  'cmd-safety blocks terraform destroy',
  hook('cmd-safety/cmd-safety.mjs', ['terraform destroy -auto-approve']) === 2,
)
check(
  'cmd-safety blocks npm publish',
  hook('cmd-safety/cmd-safety.mjs', ['npm publish']) === 2,
)
check(
  'cmd-safety override works',
  hook('cmd-safety/cmd-safety.mjs', ['rm -rf src'], {
    BERSERQIR_CMD_ALLOW: '1',
  }) === 0,
)
// advisories: exit 0 ALWAYS — findings go to stderr, never block
{
  const slop = join(TMP, 'Hero.tsx')
  writeFileSync(
    slop,
    '<h1 className="bg-clip-text">Streamline your world-class workflow</h1>',
  )
  const r = node([
    join(ROOT, 'core/hooks/front-quality/front-quality.mjs'),
    slop,
  ])
  check(
    'front-quality flags slop but exits 0 (advisory by design)',
    r.status === 0 && r.stderr.includes('front-quality'),
  )
  const clean = join(TMP, 'Clean.tsx')
  writeFileSync(clean, '<p>Send message</p>')
  const rc = node([
    join(ROOT, 'core/hooks/front-quality/front-quality.mjs'),
    clean,
  ])
  check('front-quality silent on clean file', rc.status === 0 && !rc.stderr)
  const a11y = join(TMP, 'Gallery.html')
  writeFileSync(a11y, '<html><body><img src="x.png"></body></html>')
  const ra = node([
    join(ROOT, 'core/hooks/front-quality/front-quality.mjs'),
    a11y,
  ])
  check(
    'front-quality flags img-without-alt + missing lang',
    ra.status === 0 &&
      ra.stderr.includes('img without alt') &&
      ra.stderr.includes('html without lang'),
  )
  const dirty = join(TMP, 'service.ts')
  writeFileSync(
    dirty,
    'try { x() } catch (e) {}\nconsole.log(1)\nconsole.log(2)\nfetch("http://localhost:3000/api")\n',
  )
  const rb = node([
    join(ROOT, 'core/hooks/back-quality/back-quality.mjs'),
    dirty,
  ])
  check(
    'back-quality flags leftovers but exits 0 (advisory by design)',
    rb.status === 0 &&
      rb.stderr.includes('console leftovers') &&
      rb.stderr.includes('empty catch') &&
      rb.stderr.includes('hardcoded endpoint'),
  )
  const cleanTs = join(TMP, 'clean-service.ts')
  writeFileSync(cleanTs, 'export const add = (a: number, b: number) => a + b\n')
  const rbc = node([
    join(ROOT, 'core/hooks/back-quality/back-quality.mjs'),
    cleanTs,
  ])
  check('back-quality silent on clean file', rbc.status === 0 && !rbc.stderr)
  const testFile = join(TMP, 'service.test.ts')
  writeFileSync(testFile, 'console.log("debugging in tests is fine")\n')
  const rt = node([
    join(ROOT, 'core/hooks/back-quality/back-quality.mjs'),
    testFile,
  ])
  check('back-quality skips test files', rt.status === 0 && !rt.stderr)
  const sd = node([
    join(ROOT, 'core/hooks/stray-doc/stray-doc.mjs'),
    'NOTES.md',
  ])
  check(
    'stray-doc warns on root NOTES.md but exits 0',
    sd.status === 0 && sd.stderr.includes('stray-doc'),
  )
  const sdok = node([
    join(ROOT, 'core/hooks/stray-doc/stray-doc.mjs'),
    'README.md',
  ])
  check(
    'stray-doc silent on canonical README.md',
    sdok.status === 0 && !sdok.stderr,
  )
}

// ---------- 3) memory-validate cases ----------
console.log('\n[3/5] memory-validate')
const mv = (name, content) => {
  const p = join(TMP, name)
  writeFileSync(p, content)
  return node([join(ROOT, 'core/hooks/memory-validate/memory-validate.mjs'), p])
    .status
}
check(
  'valid instincts.json passes',
  mv('instincts.json', '{"updatedAt":"2026-01-01","instincts":[]}') === 0,
)
check(
  'active <0.7 instinct blocks',
  mv(
    'instincts.json',
    '{"updatedAt":"x","instincts":[{"id":"INST-a","statement":"s","scope":"back","confidence":0.4,"status":"active","evidence":["e"],"firstSeen":"x","lastReinforced":"x"}]}',
  ) === 2,
)
check(
  'mcp-map without purpose blocks',
  mv('mcp-map.json', '{"servers":[{"name":"x"}]}') === 2,
)
check(
  'DESIGN.md over budget blocks',
  mv(
    'DESIGN.md',
    '## Visual identity\n## Design tokens\n## Component inventory\n' +
      'x'.repeat(13000),
  ) === 2,
)
// journal auto-rotate: over-budget §Journal is archived, agent sections kept
{
  const memDir = join(TMP, 'mem-rotate')
  mkdirSync(memDir, { recursive: true })
  const bigJournal = Array.from(
    { length: 400 },
    (_, i) => `- 2026-07-10T00:00:00Z · agent · edit · src/file-${i}.ts`,
  ).join('\n')
  writeFileSync(
    join(memDir, 'memory-short.md'),
    `# memory-short\n\n## Focus\n\nkeep me\n\n## Journal\n\n${bigJournal}\n\n## Errors & learnings\n\n-\n\n## Open threads\n\n- keep me too\n`,
  )
  const jr = node(
    [
      join(ROOT, 'core/hooks/memory-journal/memory-journal.mjs'),
      'agent',
      'edit',
      'src/x.ts',
    ],
    { env: { ...process.env, BERSERQIR_MEMORY_DIR: memDir } },
  )
  const after = readFileSync(join(memDir, 'memory-short.md'), 'utf8')
  check(
    'journal auto-rotates over-budget memory-short',
    jr.status === 0 &&
      jr.stderr.includes('auto-archived') &&
      after.length <= 2500 * 4 &&
      after.includes('keep me') &&
      after.includes('keep me too') &&
      existsSync(join(memDir, 'compressions')),
  )
  const validate = node([
    join(ROOT, 'core/hooks/memory-validate/memory-validate.mjs'),
    join(memDir, 'memory-short.md'),
  ])
  check('rotated memory-short passes the budget gate', validate.status === 0)
}

// ---------- 4) adapters compile cleanly ----------
console.log('\n[4/5] adapters')
const CANON =
  /core\/(protocols|templates|memory|hooks|evals|skills|prompts|skills-resources)\//
for (const a of ['copilot', 'claude-code', 'cursor']) {
  const out = join(TMP, `compile-${a}`)
  const r = node([
    join(ROOT, `adapters/${a}/compile.mjs`),
    '--root',
    ROOT,
    '--out',
    out,
    '--profiles',
    'front,back,ops,infra',
  ])
  check(`${a} compiles`, r.status === 0, r.stderr.trim().slice(0, 200))
  if (r.status !== 0) continue
  const dirty = walk(out).filter(
    (f) =>
      f.endsWith('.md') &&
      readFileSync(f, 'utf8')
        .split('\n')
        .some(
          (l) => CANON.test(l) && !/Compiled by Berserqir|canonical/.test(l),
        ),
  )
  check(
    `${a}: no unrewritten canonical refs`,
    dirty.length === 0,
    dirty.slice(0, 3).join(', '),
  )
}

// ---------- 5) installer e2e from the real tarball ----------
console.log('\n[5/5] installer e2e (npm pack)')
const pack = run('npm', ['pack', '--pack-destination', TMP], {
  cwd: join(ROOT, 'installer'),
  shell: process.platform === 'win32', // npm is npm.cmd on Windows — spawn needs a shell there
})
check('npm pack succeeds', pack.status === 0, pack.stderr.trim().slice(0, 200))
const tarball = (pack.stdout || '').trim().split('\n').pop()
const pkgDir = join(TMP, 'pkg')
mkdirSync(pkgDir, { recursive: true })
run('tar', ['xzf', join(TMP, tarball), '-C', pkgDir, '--strip-components=1'])
const WIRING = {
  copilot: '.github/hooks/berserqir.json',
  'claude-code': '.claude/settings.json',
  cursor: '.cursor/hooks.json',
}
for (const [h, wiring] of Object.entries(WIRING)) {
  const app = join(TMP, `app-${h}`)
  mkdirSync(join(app, 'src', 'components'), { recursive: true })
  writeFileSync(
    join(app, 'package.json'),
    '{"name":"smoke","dependencies":{"react":"18","express":"4"}}',
  )
  run('git', ['init', '-q'], { cwd: app })
  const inst = node(
    [join(pkgDir, 'bin/berserqir.js'), 'install', '--harness', h, '--yes'],
    { cwd: app },
  )
  check(
    `${h}: install succeeds`,
    inst.status === 0,
    (inst.stderr || inst.stdout).trim().slice(0, 200),
  )
  check(
    `${h}: manifest + wiring present`,
    existsSync(join(app, '.berserqir/manifest.json')) &&
      existsSync(join(app, wiring)),
  )
  // seed memory from templates so doctor's critical checks pass (pre-/init state is exit 1 by design)
  const tpl = join(app, '.berserqir/memory/templates')
  for (const [from, to] of [
    ['memory-long.template.md', 'memory-long.md'],
    ['memory-short.template.md', 'memory-short.md'],
    ['memory-medium.template.json', 'memory-medium.json'],
    ['codemap.template.md', 'codemap.md'],
    ['instincts.template.json', 'instincts.json'],
  ])
    cpSync(join(tpl, from), join(app, '.berserqir/memory', to))
  const doc = node([join(pkgDir, 'bin/berserqir.js'), 'doctor'], {
    cwd: app,
    env: { ...process.env, BERSERQIR_NO_UPDATE_CHECK: '1' },
  })
  check(
    `${h}: doctor exits 0 (no critical failures)`,
    doc.status === 0,
    (doc.stdout.match(/score:.*/) || [''])[0],
  )
}

rmSync(TMP, { recursive: true, force: true })
console.log(
  failures === 0 ? '\nSMOKE: all green ✓' : `\nSMOKE: ${failures} failure(s) ✗`,
)
process.exit(failures === 0 ? 0 : 1)
