#!/usr/bin/env node
// Vendors canonical sources (core/, profiles/, adapters/) into the installer package
// at pack time, so the published tarball is self-contained. Removed after pack.
// Zero dependencies.
import { cpSync, rmSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const pkgRoot = join(here, '..') // installer/
const monoRoot = join(pkgRoot, '..') // berserqir/ (monorepo)
const DIRS = ['core', 'profiles', 'adapters']

const mode = process.argv[2]
if (mode === 'vendor') {
  for (const d of DIRS) {
    const src = join(monoRoot, d)
    if (!existsSync(src)) {
      console.error(`[pack] missing ${src} — must pack from the monorepo`)
      process.exit(1)
    }
    rmSync(join(pkgRoot, d), { recursive: true, force: true })
    cpSync(src, join(pkgRoot, d), { recursive: true })
  }
  console.log(`[pack] vendored: ${DIRS.join(', ')}`)
} else if (mode === 'clean') {
  for (const d of DIRS)
    rmSync(join(pkgRoot, d), { recursive: true, force: true })
  console.log(`[pack] cleaned: ${DIRS.join(', ')}`)
} else {
  console.error('usage: node scripts/pack.mjs vendor|clean')
  process.exit(1)
}
