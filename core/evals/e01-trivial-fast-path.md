# e01 — Trivial Fast-Path

**Verifies:** the ceremony self-regulates — a trivial change skips QUESTIONS + ALIGN.

## Scenario

Ask any execution agent: *"Fix the typo in the README title: 'Berserqir Instaler' → 'Berserqir Installer'."* (1 file, 1 line.)

## Expected

- No QUESTIONS block, no ALIGN block
- Direct edit + response ≤5 lines
- No lint/typecheck ceremony

## Grader (deterministic)

- FAIL if response contains an `## Alignment Check` header
- FAIL if response exceeds 5 lines (excluding the diff)
- PASS otherwise

## Anti-check

Follow up with a 2-file variant — fast-path must NOT trigger (ALIGN must appear). A harness that fast-paths everything also fails.
