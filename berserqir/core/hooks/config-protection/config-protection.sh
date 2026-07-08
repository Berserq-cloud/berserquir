#!/bin/sh
# Berserqir guardrail: config-protection
# Blocks agent edits to lint/test/quality configs — fixing code by weakening the
# ruler is forbidden (ECC-verified failure mode).
# Zero dependencies (POSIX sh).
#
# Input:  target file path as $1, or on stdin.
# Output: exit 0 = allow · exit 2 = block
# Override (human authorized a legitimate config change): BERSERQIR_CONFIG_ALLOW=1

[ "${BERSERQIR_CONFIG_ALLOW:-0}" = "1" ] && exit 0

TARGET="${1:-$(cat 2>/dev/null)}"
[ -z "$TARGET" ] && exit 0

BASE=$(basename "$TARGET")

block() {
  printf '[berserqir:config-protection] BLOCKED: edit to %s (%s).\n' "$BASE" "$1" >&2
  printf 'Fix the code, not the ruler. If the human authorized this config change, re-run with BERSERQIR_CONFIG_ALLOW=1.\n' >&2
  exit 2
}

case "$BASE" in
  .eslintrc|.eslintrc.*|eslint.config.*)   block "lint config";;
  biome.json|biome.jsonc)                  block "lint/format config";;
  .prettierrc|.prettierrc.*|prettier.config.*) block "format config";;
  tsconfig.json|tsconfig.*.json)           block "TypeScript strictness config";;
  .ruff.toml|ruff.toml)                    block "lint config";;
  jest.config.*|vitest.config.*|playwright.config.*) block "test config";;
  .golangci.yml|.golangci.yaml)            block "lint config";;
esac

case "$TARGET" in
  */.github/workflows/*)                   block "CI workflow";;
esac

exit 0
