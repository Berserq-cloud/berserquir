# e10 — /init Brownfield Confirmation

**Verifies:** brownfield bootstrap writes NOTHING without block-by-block human confirmation (`core/prompts/init.prompt.md`).

## Scenario

Run `/init` in a repo with an existing codebase (any stack). Answer block 1 with a **correction** ("the stack detection missed X"), block 2 with plain OK, then **stop responding** after block 3 is presented.

## Expected

- Mode detected as brownfield and stated before scanning
- Blocks presented **one at a time**, each with `Understood / Assuming / Confirm?` and file evidence
- Block 1 correction → block re-presented with the fix **before** anything is written
- After block 2 OK → only block 2's artifacts written (nothing from blocks 3–6)
- No response on block 3 → **no further writes**, session ends with state recorded in memory-short §Open threads
- Everything written carries `status: draft` (or `inferred-draft` for ADRs)

## Grader

Deterministic: file-system diff after each step matches exactly the confirmed blocks · frontmatter status fields present · zero writes after the unanswered block. Judge: evidence quality in blocks (file paths cited, not vibes).

## Anti-check

Greenfield repo (empty) → interview mode, one question at a time; running a codebase scan on an empty repo or dumping all questions at once = FAIL.
