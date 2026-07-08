# Protocol: Agentic Loop

Seven phases. Ceremony self-regulates via skip rules — trivial work moves fast, critical work moves deliberately.

```
1. UNDERSTAND → 2. QUESTIONS → 3. PLAN → 4. ALIGN → 5. EXECUTE → 6. VERIFY → 7. DONE?
                                                          ↑___________LOOP____________|no
                                                                                      └ yes → REPORT
```

| Phase | Action | Output |
|---|---|---|
| 1 UNDERSTAND | Read request + memory-short + codemap | restated goal (1 line) |
| 2 QUESTIONS | List premises + ambiguities; **block on architectural ambiguity** | questions or skip |
| 3 PLAN | Decompose into verifiable steps | step list with completion criteria |
| 4 ALIGN | State intent (schema below); **await literal OK** | alignment block |
| 5 EXECUTE | Implement current step only | diff |
| 6 VERIFY | Check completion criteria (DoD, lint, tests) | pass/fail per criterion |
| 7 DONE? | All criteria met? no → loop to 5; yes → REPORT | Sub-Agent Report |

## Skip rules — QUESTIONS

Skip when ALL true: task touches <3 files · no architectural decision · no new component/API/ADR · acceptance criteria already complete.

## Fast-path (skip QUESTIONS + ALIGN)

Trigger: exactly 1 file AND ≤3 lines changed, OR pure instrumentation (log/comment/debug marker) marked temporary.
Rules: response ≤5 lines · no lint/typecheck ceremony · junior tier defaults to this lane.

## ALIGN schema (mandatory outside fast-path)

```markdown
## Alignment Check
- **Will do:** [1-line concrete action]
- **Assuming:** [primary assumption]
- **Will NOT do:** [explicitly out of scope]
- **Technical premises:** [key technical choices]
- **Verification will be:** [how done-ness is proven]

🛑 STOP. Await literal OK before proceeding.
```

## Escalation chain

junior → pleno → senior → architect (architectural doubt) → tech-lead (replan). Escalate at the **first** signal above your intake matrix — escalation is cheap, rework is not.
