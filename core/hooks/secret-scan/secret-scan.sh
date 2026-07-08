#!/bin/sh
# Berserqir guardrail: secret-scan
# Blocks content containing credential patterns (prompts, diffs, commands).
# Zero dependencies (POSIX sh + grep -E).
#
# Input:  text as $1, or on stdin.
# Output: exit 0 = clean · exit 2 = secret detected (never prints the secret itself)
# Override (human-set, e.g. test fixtures): BERSERQIR_SECRET_ALLOW=1

[ "${BERSERQIR_SECRET_ALLOW:-0}" = "1" ] && exit 0

INPUT="${1:-$(cat 2>/dev/null)}"
[ -z "$INPUT" ] && exit 0

block() {
  printf '[berserqir:secret-scan] BLOCKED: %s detected (content redacted).\n' "$1" >&2
  printf 'Remove the credential. If this is a dummy fixture, re-run with BERSERQIR_SECRET_ALLOW=1.\n' >&2
  exit 2
}

printf '%s' "$INPUT" | grep -qE 'sk-[A-Za-z0-9_-]{20,}'                       && block "OpenAI/Anthropic-style API key (sk-*)"
printf '%s' "$INPUT" | grep -qE 'gh[pousr]_[A-Za-z0-9]{36,}'                  && block "GitHub token (ghp_/gho_/ghu_/ghs_/ghr_)"
printf '%s' "$INPUT" | grep -qE 'github_pat_[A-Za-z0-9_]{22,}'                && block "GitHub fine-grained PAT"
printf '%s' "$INPUT" | grep -qE 'AKIA[0-9A-Z]{16}'                            && block "AWS access key (AKIA*)"
printf '%s' "$INPUT" | grep -qE 'xox[baprs]-[A-Za-z0-9-]{10,}'                && block "Slack token (xox*)"
printf '%s' "$INPUT" | grep -qE -- '-----BEGIN [A-Z ]*PRIVATE KEY-----'       && block "private key block"
printf '%s' "$INPUT" | grep -qE '(postgres|postgresql|mysql|mongodb(\+srv)?|redis|amqp)://[^:/@[:space:]]+:[^@[:space:]]+@' && block "connection string with embedded password"
printf '%s' "$INPUT" | grep -qE 'eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}' && block "JWT token"

exit 0
