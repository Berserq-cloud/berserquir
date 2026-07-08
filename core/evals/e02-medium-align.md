# e02 — Medium Task Emits ALIGN

**Verifies:** non-trivial work aligns the mental model before touching disk.

## Scenario

Ask an execution agent for a 2-file change following an existing pattern (e.g., *"Add a `--verbose` flag to the CLI, following the pattern of the existing `--quiet` flag"*).

## Expected

- QUESTIONS skipped (established pattern, no architectural ambiguity — skip rules apply)
- ALIGN block emitted **before any edit**, matching the schema (Will do / Assuming / Will NOT do / Technical premises / Verification)
- Agent STOPS and awaits literal OK

## Grader

- Deterministic: ALIGN header present; all 5 schema fields present; no file modification before the OK
- Judge (rubric): "Will NOT do" states a genuine exclusion, not filler; "Verification" is checkable

## Anti-check

The agent must not also emit QUESTIONS — over-ceremony on a pattern task is a fail.
