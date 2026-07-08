# Protocol: Deliberation (Odd Panels)

Odd numbers never tie. Decision weight routes the mechanism — heavier decisions get more perspectives, and the human always closes the top tier.

| Weight | Mechanism | Cost | Record |
|---|---|---|---|
| Trivial / local | 1 agent decides (fast-path) | 1x | — |
| Technical, with genuine alternatives | panel of **3 independent instances** → majority vote | 3x | vote + rationale in Sub-Agent Report |
| Business / architectural | structured debate: **proponent × opponent × synthesizer** → synthesis → **human decides** via ALIGN | high | debate becomes ADR proposal |

## Rules

1. **Panels are advisory.** The competent single role ratifies and records (architect → ADR, product → PRD, tech-lead → delegation). Authority rules stay intact.
2. **Human is the final decider** on the business/architectural tier. The debate raises discussion quality; it never replaces the decision.
3. **Trigger by weight, not by default.** 3x cost requires genuine alternatives — if one option is obviously right, no panel.
4. Panel instances are **ephemeral**: spawn → vote/argue → merge → done. They never write files.
5. Debate roles: proponent argues the strongest case FOR; opponent attacks assumptions, risks, and costs; synthesizer produces a balanced recommendation with explicit trade-offs.
6. **Family diversity (when the harness offers multiple model families):** prefer spawning panel instances on distinct families — 3× the same model correlates errors; different families decorrelate perspectives and reduce self-preference bias. Optional, never required (some harnesses are single-family — degrade gracefully).

System coherence: wave cap = quorum = 3. The adversarial guardrail eval (red-team) reuses this panel mechanism.
