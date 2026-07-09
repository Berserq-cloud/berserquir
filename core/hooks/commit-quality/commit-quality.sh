#!/bin/sh
# Berserqir guardrail: commit-quality (POSIX, zero deps)
# Pre-commit checks on staged changes. Exit 0 = ok · exit 1 = block (with reasons).
#
# Activate as a native git hook (works on ANY harness, CLI or IDE):
#   ln -s ../../.berserqir/hooks/commit-quality/commit-quality.sh .git/hooks/pre-commit
# Or call directly: sh .berserqir/hooks/commit-quality/commit-quality.sh
#
# Checks:
#   1. debug leftovers in staged code (console.log/debugger/binding.pry/pdb/dd()) — warn
#   2. secrets in staged diff (delegates patterns to secret-scan) — block
#   3. oversized files (>1MB staged, likely accidental) — block
#   4. commit message format (conventional commit + optional anchor) — checked
#      only when message file is passed as $1 (commit-msg hook mode)
# Override (human-only): BERSERQIR_COMMIT_ALLOW=1

[ "$BERSERQIR_COMMIT_ALLOW" = "1" ] && exit 0

fail=0
staged_files=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null)
[ -z "$staged_files" ] && exit 0

# 1) debug leftovers (warn — not every echo is a crime, but say it)
debug_hits=$(git diff --cached -U0 2>/dev/null | grep -E '^\+' | grep -cE 'console\.(log|debug)\(|debugger;|binding\.pry|import pdb|pdb\.set_trace|\bdd\(' || true)
if [ "$debug_hits" -gt 0 ]; then
  echo "[berserqir:commit-quality] WARN: $debug_hits debug statement(s) in staged diff — intended?" >&2
fi

# 2) secrets in the staged diff (block) — same patterns as secret-scan
if git diff --cached -U0 2>/dev/null | grep -E '^\+' | grep -qE 'sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{36}|gho_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|postgres(ql)?://[^:]+:[^@]+@|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.'; then
  echo "[berserqir:commit-quality] BLOCKED: possible secret in staged diff (pattern match — value not printed)" >&2
  fail=1
fi

# 3) oversized staged files (block — usually an accident)
for f in $staged_files; do
  [ -f "$f" ] || continue
  size=$(wc -c < "$f" 2>/dev/null || echo 0)
  if [ "$size" -gt 1048576 ]; then
    echo "[berserqir:commit-quality] BLOCKED: $f is >1MB — accidental? (git lfs or .gitignore it)" >&2
    fail=1
  fi
done

# 4) commit message (only in commit-msg mode: $1 = message file)
if [ -n "$1" ] && [ -f "$1" ]; then
  first_line=$(head -1 "$1")
  if ! echo "$first_line" | grep -qE '^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9./-]+\))?!?: .{1,}'; then
    echo "[berserqir:commit-quality] BLOCKED: message is not a conventional commit: \"$first_line\"" >&2
    echo "  format: type(scope): subject — anchors (FEAT-*/ADR-*/DEBT-*) welcome in body" >&2
    fail=1
  fi
fi

[ "$fail" = "1" ] && {
  echo "  human override: BERSERQIR_COMMIT_ALLOW=1 git commit ..." >&2
  exit 1
}
exit 0
