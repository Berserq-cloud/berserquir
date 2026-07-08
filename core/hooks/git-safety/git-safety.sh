#!/bin/sh
# Berserqir guardrail: git-safety
# Blocks publishing/destructive git actions unless the human explicitly authorized them.
# Zero dependencies (POSIX sh). Harness adapters wire the event payload.
#
# Input:  command string as $1, or on stdin.
# Output: exit 0 = allow · exit 2 = block (PreToolUse deny convention)
# Override (human-set, per command): BERSERQIR_GIT_ALLOW=1

[ "${BERSERQIR_GIT_ALLOW:-0}" = "1" ] && exit 0

CMD="${1:-$(cat 2>/dev/null)}"
[ -z "$CMD" ] && exit 0

# normalize whitespace for matching
NORM=$(printf '%s' "$CMD" | tr -s '[:space:]' ' ')

block() {
  printf '[berserqir:git-safety] BLOCKED: %s\n' "$1" >&2
  printf 'Publishing/destructive git actions require explicit human authorization.\n' >&2
  printf 'If the human authorized it, re-run with BERSERQIR_GIT_ALLOW=1.\n' >&2
  exit 2
}

case "$NORM" in
  *git\ push*|*git*--force*|*git*--force-with-lease*)
    case "$NORM" in
      *git\ push*)  block "git push — publishing (may trigger deploys)";;
      *)            block "forced git operation";;
    esac
    ;;
esac

case "$NORM" in
  *git*--no-verify*)      block "--no-verify — bypassing hooks/checks is forbidden";;
  *git\ reset\ --hard*|*git\ reset*--hard*)
                          block "git reset --hard — destructive on shared history";;
  *git\ clean\ -*f*)      block "git clean -f — deletes untracked files (possible in-progress work)";;
  *git\ branch\ -D*)      block "git branch -D — force-deleting a branch";;
  *git\ push*--delete*)   block "deleting remote refs";;
esac

exit 0
