# Canonical Format — Berserqir Source Files

Every canonical file is **Markdown + YAML frontmatter (superset)**. Adapters compile canonical files into each harness's native format. Metadata a target does not support is **moved into the body as a markdown section — never dropped** (LLMs read the body).

Golden rule: **never edit compiled output** (`.github/`, `.claude/`, `.cursor/`). Edit canonical sources and recompile.

## Agent files

`core/agents/*.md` (archetypes) and `profiles/<area>/agents/*.md` (overlays).

### Frontmatter superset

| Field | Values | Used by |
|---|---|---|
| `name` | kebab-case id | all |
| `description` | 1 line, when to invoke | all |
| `type` | `authority` \| `execution` \| `gate` | compiler (cardinality + parallelism rules) |
| `tier` | `senior` \| `pleno` \| `junior` (execution only) | compiler (model routing + ceremony) |
| `extends` | archetype name (overlays only) | compiler (composition) |
| `model` | routing class: `top` \| `mid` \| `fast` | mapped to concrete model per harness |
| `tools` | canonical capabilities: `delegate, search, edit, read, execute, web, todo` — adapters map via `tools.json` (overlays may append harness-specific tools) | all (mapped per target) |
| `agents` | agent names this role may invoke as subagents | Copilot/Claude Code frontmatter |
| `handoffs` | **list of objects**: `label` (button text) · `agent` · `prompt` (pre-filled) · `send` (true = auto-send) | Copilot native; body section elsewhere |
| `user-invocable` | bool — user can invoke directly | Copilot |
| `escalates-to` | agent names for escalation | body section (universal) |
| `parallelizable` | bool (derived from `type`, override allowed) | orchestrator protocol |
| `disable-model-invocation` | bool (orchestrator = true) | Copilot; body note elsewhere |
| `skills` | skill ids to load on task | body section |
| `never` | glob/paths this agent must not touch | body section |
| `contextBudget` | `{always, onTask, never, maxTokens}` | body section (`## Context Budget`) |

**Role-type tool discipline:** authority orchestrator has **no `edit`** (implementation architecturally impossible) · gates (qa, security) have **no `edit` and no `delegate` targets that write** (read-only + report) · execution tiers get the full set; junior drops `execute` and `web` (fast-path lane needs neither).

### Compilation map

| Canonical | Copilot | Claude Code | Cursor |
|---|---|---|---|
| agent | `.github/agents/<n>.agent.md` | `.claude/agents/<n>.md` | `.cursor/agents/bq-<n>.md` (prefixed) |
| instruction | `.github/instructions/*.instructions.md` (`applyTo`) | `CLAUDE.md` section / rules | `.cursor/rules/*.mdc` (globs) |
| prompt/command | `.github/prompts/*.prompt.md` | `.claude/commands/*.md` | rule-invoked |
| skill | `.github/skills/<id>/SKILL.md` | `.claude/skills/<id>/SKILL.md` | `.cursor/skills/<id>/` |
| hook | hooks JSON (limited) | `.claude/settings` hooks (native) | `.cursor/hooks.json` (DRY adapter) |

**Target frontmatter whitelists** (fields a target accepts — everything else moves to the body):

- **Copilot `.agent.md`** (closed schema — unknown attrs raise warnings): `name, description, model, tools, agents, handoffs, user-invocable, disable-model-invocation, target, github, argument-hint`
- **Claude Code `agents/*.md`**: `name, description, tools, model`
- **Cursor `agents/bq-*.md`** (prefixed `bq-` — avoids collisions with user agents): `name, description, model` — tools discipline renders as a `## Tools (allowed)` body section; instructions compile to native glob-scoped rules (`.cursor/rules/*.mdc`)
- `model` routing classes translate to concrete model strings per target config: `top` / `mid` / `fast` → installer maps them at compile time
- `extends` is resolved during composition and never appears in compiled output

Composition: compiled agent = archetype fields ⊕ overlay fields (overlay wins on conflict; lists merge; `never` unions). Unsupported fields render as body sections in a stable order: `## Role Type`, `## Skills`, `## Scope (never touch)`, `## Handoffs & Escalation`, `## Context Budget`.

## Skills

`SKILL.md` with `name` + `description` frontmatter (Agent Skills standard). Heavy references live in the hub (`.berserqir/skills-resources/<id>/`) and are referenced by relative path (on-demand loading regime — see plan §3.4).

## Language

Product artifacts are written in **English** (OSS distribution). Project-generated content (memories, PRD) follows the user's language.
