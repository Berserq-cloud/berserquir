# Plano de Ação — Berserqir

> **Status:** v2.0 — ✅ **Fase 0 CONCLUÍDA (2026-07-07)** — todas as decisões D1–D10 fechadas; próximo: F1 (core) + F2 (guardrails) em paralelo
> **Data:** 2026-07-07
> **Objetivo:** Unificar Setup 1 (SDD + ICL + Memory, alta cerimônia) e Setup 2 (cloud/IaC, enxuto) num único harness portátil, incorporando os pontos fortes de Impeccable, ECC e Graphify — e fechando os gaps deles com nossos diferenciais.

## Identidade: Berserqir

**Berserqir** — plural nórdico autêntico de *berserkr* (os guerreiros-urso de elite, guarda pessoal de jarls e reis) fundido com a marca Berserq. A narrativa mapeia 1:1 no produto: não é um agente isolado, é uma **legião organizada sob um único comando** — cada área (front, back, ops, infra) é uma unidade do exército, leal ao orquestrador.

- Pacote npm: `berserqir` — **verificado disponível em 2026-07-07** ✅
- Superfície de comando: `npx berserqir install` (stack) · `npx berserqir install front back` (por área)
- Reserva de vocabulário nórdico para comandos futuros (ex: `hamask` — "mudar de forma/entrar em fúria" — candidato para ativação/deploy)

---

## 1. Diagnóstico — os 3 harnesses de referência

### 1.1 Impeccable (`pbakaus/impeccable`)
Design language para agentes de código. O que ele acerta:

| Força | Detalhe | O que copiar |
|---|---|---|
| **Installer universal** | `npx impeccable install` autodetecta o harness (Claude Code, Cursor, Copilot, Gemini CLI, Codex) e escreve os arquivos certos (`.claude/skills/`, `.cursor/skills/`…) | O modelo de instalação: 1 comando, zero fricção |
| **Vocabulário de comandos** | 1 skill, 23 comandos pareados por polaridade (`bolder/quieter`, `audit/harden`, `critique/polish`) | Já temos via ADR-023 (28 comandos) — manter |
| **Detectores determinísticos** | 44+ regras que rodam **sem LLM** (CLI + browser extension) — quality gate reproduzível | Transformar nossos gates em checks determinísticos |
| **Spec files como memória** | `PRODUCT.md` + `DESIGN.md` escritos por `/init` interativo; todo comando lê antes de agir | Validamos: é o nosso SDD, porém mais raso |
| **Distribuição** | Plugin marketplace Claude Code + built-in no Copilot | Meta de longo prazo |

**Gap dele:** só frontend/design; sem memória de sessão, sem loop de execução, sem subagentes, sem evals. **Nosso SDD+Memory+Loop fecha isso.**

### 1.2 ECC / Everything Claude Code (`affaan-m/everything-claude-code` + `ecc`)
O harness mais completo do ecossistema (~100k stars). O que ele acerta:

| Força | Detalhe | O que copiar |
|---|---|---|
| **Cross-harness real** | Um repo → `.claude/`, `.cursor/`, `.codex/`, `.opencode/` com **adapter DRY** (Cursor reusa os hook scripts do Claude Code) | Arquitetura de adapters (§3) |
| **AGENTS.md na raiz** | Spec única lida por todos os 4 harnesses (padrão agents.md, 60k+ projetos) | Adotar como camada portátil |
| **Hooks de guardrail** | Bloqueia `git --no-verify`, detecta secrets (`sk-`, `ghp_`, `AKIA`), protege configs de lint (`.eslintrc`, `biome.json`) contra edição pelo agente | **Prioridade alta** — hoje só temos 1 hook (impeccable) |
| **Continuous learning** | Sessões → padrões → "instincts" (com confidence score) → skills. Import/export entre ambientes | Pipeline para automatizar nosso ICL (hoje curado à mão) |
| **Selective install + state store** | Manifest-driven (`install-plan.js`/`install-apply.js`) + SQLite rastreando o que está instalado | Modelo do nosso installer |
| **AgentShield** | 1.282 testes + 102 regras estáticas; modo `--opus` = red-team/blue-team/auditor | Inspiração para evoluir nossos evals |

**Gaps dele:** sem SDD formal (AGENTS.md é raso vs. PRD→SPECS→TESTS), sem loop de fases com ALIGN, sem report schema de subagente, sem context budgets por fase, memória sem hierarquia TTL. **Complexidade alta assusta adopters** — nosso Setup 2 prova que sabemos fazer "modo lite".

### 1.3 Graphify (`safishamsi/graphify`) — e Graphiti (`getzep/graphiti`)
Memória estrutural via knowledge graph. O que ele acerta:

| Força | Detalhe | O que copiar |
|---|---|---|
| **Eficiência de tokens** | ~71,5x menos tokens/query vs. contexto bruto — carrega só o subgrafo relevante | Reforça nossa Context Progression Matrix com dados |
| **Portabilidade extrema** | 19+ harnesses suportados via `graphify install --platform X` | Confirma o padrão installer-per-platform |
| **Grafo project-scoped** | Código + docs + schemas + mídia → grafo consultável persistente | Camada opcional de indexação sob nosso memory system |

**Gaps dele:** só memória — zero comportamento, guardrails, specs, orquestração. **Graphiti** (temporal, com provenance) é referência futura para versionar decisões no tempo (casa com nosso ADR registry).

---

## 2. Diagnóstico — nossos diferenciais e gaps

### 2.1 O que NÓS temos que NENHUM dos 3 tem (nosso moat)

1. **SDD em 3 camadas** — PRD (what/why) → SPECS (how + ADR registry) → TESTS (verify), com spec-kit em notação EARS. Impeccable tem 2 arquivos rasos; ECC tem 1 (AGENTS.md).
2. **Memória hierárquica com TTL** — long (constituição) / medium (sprint) / short (sessão) + schemas JSON + Memory Sync Ritual em cada handoff. ECC tem save/load de sessão, mas sem hierarquia constitucional.
3. **Agentic Loop de 7 fases** — UNDERSTAND → QUESTIONS → PLAN → **ALIGN** → EXECUTE → VERIFY → REPORT, com **Mental Alignment** ("Vou fazer X assumindo Y, NÃO vou Z") e **fast-path** para trivialidades. Nenhum dos 3 tem disciplina de execução por fases.
4. **Context Progression Matrix** — budget de tokens por fase do loop (3k → 15k → 40k → 10k), com substituição de contexto. Único no ecossistema.
5. **ICL pool** — demos ReAct de tarefas executadas, injetados por similaridade (+30pp precisão vs. zero-shot).
6. **Sub-Agent Report Schema** — JSON obrigatório com verificação por critério; orquestrador auto-rejeita sem schema.
7. **Eval harness comportamental** — e01–e05 testam o comportamento do harness (fast-path, ALIGN, blocking, report, memory sync). AgentShield testa segurança, não comportamento.
8. **Hierarquia com senioridade** — orquestrador puro (`disable-model-invocation`) → SR → Pleno, com matriz de escalação (Setup 2) e context budgets por agente (Setup 1).

### 2.2 Nossos gaps (o que os 3 nos ensinam)

| Gap | Quem resolve | Prioridade |
|---|---|---|
| **Portabilidade zero** — tudo em formato VS Code Copilot (`.agent.md`, `.instructions.md`) | ECC (adapters) + Impeccable (installer) | 🔴 P0 — é a tese do projeto |
| **Guardrails genéricos** — 1 único hook (impeccable.json); nada de git safety, secrets, config protection | ECC hooks | 🔴 P0 (casa com regra pessoal de git-safety) |
| **Quality gates dependentes de LLM** | Impeccable detectors | 🟡 P1 |
| **ICL manual** — demos curados à mão, sem pipeline de extração | ECC instincts | 🟡 P1 |
| **Sem selective install / state** | ECC | 🟡 P1 |
| **Memória cara em tokens** — JSONs crescem (memory-short chegou a 8KB+) | Graphify (indexação) | 🟢 P2 |
| **Sem distribuição** — não instalável por terceiros | Todos | 🔴 P0 |
| **Duplicação entre setups** — hierarquia, handoffs, review gates reimplementados 2x | — | 🔴 P0 (resolver na consolidação) |

---

## 3. Arquitetura-alvo: Core + Profiles + Adapters

**Princípio:** fonte canônica única → compilada para cada harness. Nunca editar arquivos gerados (lição do ECC: DRY adapter pattern).

```
berserqir/
├── AGENTS.md                     # spec raiz portátil (padrão agents.md) — GERADA
├── core/                         # fonte canônica, agnóstica de harness e domínio
│   ├── protocols/                # o moat: task-protocol (loop 7 fases), context-eng,
│   │   │                         #   memory sync ritual, sub-agent report schema
│   ├── agents/                   # 8 arquétipos: orchestrator/architect/product (autoridade,
│   │   │                         #   1 cada) + senior/pleno/junior (escada) + qa/security (gates)
│   ├── skills/                   # skills universais: sdd/, icl/, context-eng/, git-workflow/
│   ├── hooks/                    # guardrails: git-safety, secret-scan, config-protection,
│   │   │                         #   quality-gate (impeccable)
│   ├── memory/                   # schemas JSON (long/medium/short) + templates vazios
│   ├── evals/                    # e01–e05 + novos (portáveis)
│   ├── prompts/                  # comandos: /init, /compress, /run-evals, /new-*
│   └── templates/                # spec-kit, ADR, PRD, SPECS, TESTS
├── profiles/                     # áreas plugáveis (selective install por frente)
│   ├── front/                    # ← Setup 1: skills Vue/Nuxt/Tailwind/GSAP/impeccable,
│   │                             #   SR/Pleno Front, web-designer, ux-ui
│   ├── back/                     # ← Setup 1: skills Nitro/API/Zod, SR/Pleno Back
│   ├── ops/                      # sub-módulos *+ops (instalam juntos por padrão):
│   │   ├── dev/                  #   ← Setup 1: devops, CI/CD, CWV, vercel-deployment
│   │   ├── sec/                  #   ← Setup 1: cibersecurity, web-security, OWASP
│   │   ├── fin/                  #   ← Setup 2: finops (custos, budgets, rightsizing)
│   │   └── ia/                   #   ✦ NOVO: MLOps/LLMOps (evals de modelo, deploy de
│   │                             #     inferência, pipelines) — escopo mínimo no MVP
│   └── infra/                    # ← Setup 2: aws/azure/gcp/proxmox/terraform/k8s,
│                                 #   ban plan/apply (convenções org via memória*)
├── adapters/                     # compiladores canônico → alvo
│   ├── copilot/                  # → .github/ (agents, instructions, prompts, skills)
│   ├── claude-code/              # → .claude/ (plugin: commands, skills, agents, hooks)
│   ├── cursor/                   # → .cursor/ (rules .mdc, hooks via adapter DRY)
│   └── codex/ opencode/ …        # → AGENTS.md + configs mínimas (degradação graciosa)
└── installer/                    # CLI npx: detect → plan → apply → vendor no repo
                                  #   + manifest local (.berserqir/manifest.json) + update
```

\* Convenções organizacionais (ex: naming/tagging da empresa) **não entram em agentes nem no repo público**: entram como **memória do projeto** (semeadas no `/init` ou adicionadas com o projeto andando) — D2 (§5). Agentes ficam intocados; core permanece genérico; só uma base generalizada (ex: "projetos têm convenção de naming") vira template público.

**Modelo de instalação — Stack × Área (core invariante):**

| Modo | O que instala | Uso típico |
|---|---|---|
| **Stack** | core + as 4 áreas (front, back, ops[dev+sec+fin+ia], infra) | projeto full-stack, time completo de agentes |
| **Por área** | core + só as áreas escolhidas (1..n); sub-módulos de ops selecionáveis (`ops/sec`, `ops/fin`…) | projeto especializado (ex: só infra, ex-Setup 2) |
| *(core-only)* | só o core, nenhuma área | qualquer projeto fora dos 4 domínios — o harness genérico |

**Regra de ouro:** o core (SDD + memória + ICL + agentic loop + evals + guardrails) vai **sempre** junto — o moat nunca é opcional. O controle de cerimônia não é feito removendo features na instalação, e sim pelo próprio loop (fast-path e skip rules escalam a formalidade com a complexidade da tarefa). **QA não é área: é core** — evals e disciplina de testes são protocolo universal; skills de teste específicas (Vitest, Playwright, Terratest…) vão em cada área.

### 3.1 Formato canônico
- **Markdown + frontmatter YAML superset** — cada adapter extrai o que seu alvo suporta.
- **SKILL.md já é o formato quasi-padrão** (Agent Skills: Copilot, Claude Code, skills.md ecosystem) → skills exigem conversão mínima. É nossa ponte natural.
- Metadados sem suporte nativo (ex: `contextBudget`) vão para o **corpo** do arquivo como seção markdown (padrão que já usamos hoje).

### 3.2 Matriz de conversão por conceito

| Conceito canônico | Copilot (VS Code) | Claude Code | Cursor | Codex/OpenCode |
|---|---|---|---|---|
| Agente | `.agent.md` | `agents/*.md` (subagents) | modes / rules dedicadas | seção em AGENTS.md |
| Instrução/regra | `.instructions.md` (applyTo) | `CLAUDE.md` + rules | `.cursor/rules/*.mdc` (globs) | AGENTS.md |
| Comando/prompt | `.prompt.md` | `commands/*.md` | comando via rule | prompt file |
| Skill | `.github/skills/SKILL.md` | `skills/SKILL.md` | `.cursor/skills/` | — (inline) |
| Hook | limitado (hooks JSON) | hooks nativos (events) | hooks via adapter (ECC provou: 15 eventos) | ✗ (documentar como manual) |
| Memória | arquivos no repo | arquivos no repo | arquivos no repo | arquivos no repo |
| Spec raiz | copilot-instructions.md | CLAUDE.md → AGENTS.md | rules → AGENTS.md | AGENTS.md |

**Insight-chave:** memória, SDD e ICL são **arquivos no repositório** → já são 100% portáteis por natureza. O que exige adapters é: agentes, hooks, comandos. Nosso moat viaja de graça.

### 3.3 Modos de inicialização (bootstrap via `/init`)

O installer termina apontando para o comando `/init`, que detecta o cenário e roda em um de dois modos:

| | **Greenfield** (projeto novo/limpo) | **Brownfield** (projeto existente) |
|---|---|---|
| Detecção | repo vazio ou sem código-fonte | codebase existente |
| Mecânica | entrevista curta e dirigida (padrão Impeccable `/init`): o que é o produto, para quem, stack pretendida, restrições inegociáveis | agente varre o codebase (stack, estrutura, convenções, testes, CI) e monta um rascunho de entendimento |
| Confirmação | respostas do usuário viram os arquivos diretamente | **back-to-back**: apresenta o entendimento em blocos ("entendi X, assumindo Y — confirma?") e o usuário valida/corrige bloco a bloco antes de gravar |
| Saída | PRD.md inicial + SPECS.md e TESTS.md esqueleto + memory-long/medium/short semeados | mesmos arquivos, derivados do código real + ADRs implícitos detectados (decisões já tomadas no código viram registro) |

Em ambos os modos **nada é gravado sem confirmação** — é o mesmo espírito do ALIGN do agentic loop, aplicado ao bootstrap. O brownfield é o diferencial competitivo: nenhum dos 3 harnesses de referência faz onboarding de codebase existente com validação humana estruturada.

Ambos os modos incluem a etapa de **convenções organizacionais** (naming, tagging, políticas internas): capturadas na entrevista (greenfield) ou detectadas no scan (brownfield), gravadas na `memory-long` como constituição do projeto — **nunca hardcoded em agentes** (D2). É assim que o mesmo Berserqir genérico serve empresa e projeto pessoal sem vazar nada.

### 3.4 Stack do installer (D8) e ciclo de vida vendored

**TypeScript/Node via npx** — decisão guiada por distribuição, não por performance:

- O installer é **I/O-bound** (detectar harness, copiar/compilar markdown, gravar state) — linguagem não muda o gargalo (disco + download do registry)
- 100% do público-alvo (usuários de Claude Code/Copilot/Cursor) já tem Node → `npx berserqir` = zero fricção, qualquer OS
- É a norma do nicho: Impeccable, ECC e skills CLI distribuem via npx — fugir disso prejudica descoberta
- Binário Go economizaria ~100ms num processo que roda 1–2x por projeto — otimização imperceptível, fricção perceptível

**Princípio: instalado = vendored (npm só existe no install/update).** Após `npx berserqir install`, o repo é **autossuficiente** — nada roda via npm em runtime:

| Componente | Runtime | Como roda |
|---|---|---|
| Agentes, skills, instructions, memórias, SDD | nenhum | markdown/JSON — o harness (LLM) só lê |
| Hooks/guardrails | node local | scripts vendorados no repo, chamada direta (`node .berserqir/hooks/x.mjs`) — sem npm, sem rede |
| Installer/updater | npx | só em `install` / `update` |

Regras derivadas:
- **Vendored, nunca dependency** — o harness não entra em `node_modules`: o profile infra roda em repos Terraform sem `package.json`. Clone e funciona, offline.
- **Instala só o harness escolhido** — autodetect instala para o(s) harness(es) selecionado(s) (caso típico: 1); adicionar outro depois é `npx berserqir add cursor` (lê o manifest, gera só aquele spoke). Coexistência multi-harness é opt-in, não default.
- **Hub-and-spoke por regime de carga (dedup sem quebrar auto-load)** — o auto-load dos harnesses é por caminho (Copilot só injeta `.github/`, Claude Code só descobre `.claude/skills/`…), então a regra é:
  - **Sempre-carregado** (instructions, definição de agentes, rules, frontmatter de skills) → **materializado completo na pasta do harness**, compilado da fonte canônica — ponteiro aqui degrada comportamento;
  - **Sob-demanda** (resources/references de skills, demos ICL, detalhes de protocolo, templates) → **hub 1x** (`.berserqir/`), referenciado por caminho relativo — leitura de arquivo é universal (é o padrão progressive disclosure que skills já usam);
  - **Estado compartilhado** (SDD, memórias, grafo, AGENTS.md) → raiz/hub — agnóstico de harness.
  
  Precedente: é o modelo do próprio Impeccable (skills materializadas em `.github/skills/`, mas PRODUCT.md/DESIGN.md em local neutro na raiz) e do Setup 1 (SKILL.md na pasta do Copilot, 28 `reference/*.md` lidos sob demanda). A dedup vale porque os bytes pesados são o sob-demanda; a fiação materializada é pequena, completa e no lugar certo — carga garantida.

  ```
  projeto/  (após install Copilot + Claude Code)
  ├── AGENTS.md                     # fallback universal — 1 arquivo
  ├── PRD.md · SPECS.md · TESTS.md  # SDD — compartilhado, 1x
  ├── .berserqir/                   # HUB: sob-demanda + estado (1 cópia)
  │   └── protocols/ skills-resources/ memory/ hooks/ index/ manifest.json
  ├── .github/                      # spoke Copilot: fiação materializada → refs ao hub
  └── .claude/                      # spoke Claude Code: fiação materializada → refs ao hub
  ```

- **CLI ≡ UI, e famílias coexistem** — CLI e IDE da mesma família leem o mesmo diretório (`.github/` serve VS Code Copilot + Copilot CLI + cloud agent; `.claude/` serve Claude Code CLI + extensão). Famílias diferentes coexistem no mesmo repo (spokes lado a lado), todas geradas da mesma fonte canônica, com `AGENTS.md` na raiz como fallback universal — time misto (um dev no Cursor, outro no Claude Code) consome o mesmo Berserqir, mesma memória, mesmos protocolos.
- **Manifest local** (`.berserqir/manifest.json`): versão instalada + áreas/sub-módulos + hashes dos arquivos — versão simples e versável do state store SQLite do ECC.
- **`npx berserqir update`**: diffa manifest vs. versão nova; arquivos modificados pelo usuário (hash divergente) não são sobrescritos sem confirmação.
- Hooks escritos com **zero dependências** (só built-ins) para rodar com qualquer Node presente na máquina; guardrails mais simples (ex: git-safety) podem ser POSIX shell para funcionar até sem Node.
- **Exceção sancionada (F4/D9):** o motor de grafo é o único componente de runtime compilado — mas é *acelerador opcional* do grafo textual (§3.5), nunca requisito: mesmos artefatos, mesma interface, só mais rápido em monorepos gigantes.

**Disciplinas obrigatórias:** pacote mínimo (só built-ins do Node — cold npx é dominado pelo download do pacote) e lógica simples (port futuro barato).

**Escape hatch (F4):** se a latência de startup do Node incomodar nos **hooks** (que rodam a cada tool-use, diferente do installer), reescrever só os checks determinísticos em Go e distribuir os binários dentro do próprio pacote npm (padrão esbuild/Biome: `optionalDependencies` por plataforma). O npx continua sendo a porta de entrada.

### 3.5 Grafo textual — indexação zero-install (D9 revisada)

**Insight:** o motor de query já está instalado — é o LLM + as ferramentas de busca nativas do harness (grep/glob/semantic). Grafo serializa em texto; a travessia é agêntica. Evidência: o próprio Claude Code não usa embeddings — busca agêntica sobre arquivos bem estruturados supera RAG em código; Obsidian prova grafo-como-markdown em escala.

Componentes (todos texto, vendorados, versáveis):

| Artefato | Conteúdo | Custo de carga |
|---|---|---|
| `index/codemap.md` | mapa do repo: módulos, arquivos-chave, 1 linha cada | ~1–2k tokens, sempre carregado |
| `index/graph.json` | lista de adjacência: nós (arquivos, ADRs, features, memórias) + arestas (`implements`, `depends`, `supersedes`) | sob demanda, por subgrafo |
| Disciplina de âncoras | IDs estáveis (`ADR-NNN`, `FEAT-...`) → grep vira lookup exato O(1) | zero |
| Tags de frontmatter | demos ICL e skills taggeados → seleção por matching ("vetorização por curadoria") | zero |

Ciclo de vida: o scan do `/init` brownfield **materializa** o grafo inicial; o Memory Sync Ritual **atualiza incrementalmente** a cada task — o custo de indexação é pago 1x pelo LLM e amortizado em todas as queries. Onde o harness tem busca semântica nativa (Copilot, Cursor), usa a dela; onde não tem, degrada para grep + âncoras + tags.

**Consequência para o D9:** grafo textual é o **padrão do core** (zero-install, coerente com vendored). O motor Go (§F4) passa a ser acelerador **opcional** apenas para codebases onde o índice textual não escala (monorepos gigantes) — mesma interface, mesmos artefatos, só mais rápido.

### 3.6 Memória: formato, schemas e atualização automática (D10)

**Formato segue o consumidor primário** (resolve o debate JSON vs MD):

| Consumidor primário | Formato | Arquivos |
|---|---|---|
| LLM/humano (lê no contexto, escreve prosa) | **Markdown** | `memory-short.md` (diário de sessão), `memory-long.md` (constituição — sempre carregada; MD é ~15–25% mais barato em tokens), `codemap.md` |
| Máquina (hooks parseiam, mutam, validam) | **JSON** | `memory-medium.json` (banco de features: status/owner/contadores), `manifest.json`, `graph.json` |

Lição do Setup 1: prosa dentro de strings JSON (memory-short chegou a 8KB+) é o pior dos dois mundos — caro em tokens, frágil de escrever, ruim de diff. Além disso, JSON é o que os hooks zero-deps leem nativo (`JSON.parse`).

**Schemas (migram do Setup 1 com 2 upgrades):**
- JSON Schema em `core/memory/schemas/` → validação vira **hook determinístico post-edit** (hoje o schema existe mas nada o executa)
- MD ganha **lint de template** (headings obrigatórios) + **size budget**: `memory-short` > limiar → dispara compressão automática (fluxo `compressions/` + `/compress` que hoje é manual)

**Atualização automática (ECC-style) — memória em 2 camadas:**

| Camada | Quem escreve | Mecanismo |
|---|---|---|
| **Determinística** (zero LLM) | hooks | `PostToolUse`: journal de arquivos tocados/comandos/timestamps · `SessionStart`: injeta memory-short + codemap · `PreCompact`: dispara compressão |
| **Semântica** (decisões, aprendizados, "por quê") | agente | Memory Sync Ritual (protocolo) + hook `SessionEnd` verificando: memória não tocada na sessão → lembrete |

Degradação por harness: Claude Code = automação total (modelo completo de eventos) · Copilot = semi (postToolUse, como o hooks/impeccable.json atual) · Codex = só ritual por protocolo. A camada determinística também alimenta o instinct pipeline da F4 (journal = matéria-prima da extração de padrões).

### 3.7 Agentes: arquétipo + overlay (genérico E específico via composição)

**Fato verificado:** o ECC instala agentes reais — 67 definições `agents/*.md` no Claude Code, 48 prefixadas (`ecc-*`) no Cursor, 3 roles no Codex; no Copilot degrada para instructions+prompts. Porém são **especialistas de tarefa achatados** (planner, code-reviewer, go-reviewer…) — sem hierarquia, senioridade, handoffs ou orquestrador. O Impeccable não tem agentes (só capability layer). **Nosso modelo de time com pirâmide é o diferencial** — e a composição é o que o torna portável e instalável por área:

1. **Arquétipos** (`core/agents/`, 8): **autoridade** — orchestrator (tech lead), architect, product (PM⊕PO fundidos) · **execução** — senior, pleno, junior · **gates** — qa, security. Definem o domínio-agnóstico: obrigações do agentic loop (ALIGN, report schema), regras de delegação/escalação (matriz de complexidade), template de context budget, `disable-model-invocation` do orquestrador.
2. **Overlays** (`profiles/<área>/agents/`): pequenos arquivos que referenciam um arquétipo e adicionam o específico — skills da área a carregar, instructions, model, handoff targets, escopo (ex: sr-front = senior + [vue, tailwind, performance] + `never: server/**`).
3. **Composição no install**: o installer achata arquétipo + overlay num agente **completo e materializado** na pasta de cada harness (regra §3.4: sempre-carregado não usa ponteiro). É herança de classes com o installer como compilador — nenhum harness suporta herança nativa.

**Taxonomia de papéis (3 tipos, regras de paralelismo distintas):**

| Tipo | Papéis | Cardinalidade | Paralelismo | Racional |
|---|---|---|---|---|
| **Autoridade** (single roles) | Tech Lead · Architect · Product | 1 por instalação | ❌ nunca | detêm autoridade sobre estado compartilhado (delegação/memória · SPECS/ADRs · PRD) — 2 instâncias = decisões contraditórias e conflito de escrita |
| **Execução** (escada) | senior / pleno / junior por área | 1 definição por tier | ✅ escopos disjuntos, wave cap 3 | produzem código; senioridade roteia complexidade **e modelo** |
| **Gate** (revisão) | qa (core) · security (ops/sec) | 1 definição | ✅ livre | read-only + report — sem risco de conflito |

**Escada de senioridade = model routing (economia de tokens estrutural):**

| Tier | Demanda | Modelo (routing) | Cerimônia |
|---|---|---|---|
| senior | crítica/arquitetural da área | top (Opus/Fable-class) | loop completo; sub-delega p/ pleno/junior |
| pleno | média, padrões estabelecidos | mid (Sonnet-class) | loop com skip frequente de QUESTIONS |
| junior | trivial, sem impacto crítico (1-arquivo, docs, tags) | fast/cheap (Haiku-class) | **fast-path por padrão**; escala ao 1º sinal de complexidade |

Cadeia de escalação: junior → pleno → senior → architect (dúvida arquitetural) → tech lead (replaneja). A matriz de complexidade do Setup 2 vira 3 faixas. Precedentes: Setup 1 já roteia modelo por papel (QA=Sonnet, DevOps=Opus); ECC confirma (`CLAUDE_CODE_SUBAGENT_MODEL=haiku`, `/model-route`). **Product = PM⊕PO fundidos**: no harness de código ambos mantêm o mesmo artefato (PRD, critérios EARS, RICE, backlog) — separar cria disputa de ownership + hop sem ganho; o "mercado" do PM é o humano. Separável via overlay se necessário.

Consequências por modo de instalação: **Stack** → esquadrão completo + orquestrador com handoffs para todas as áreas · **Por área** → esquadrão da área (architect da área como entrada) · **Core-only** → só arquétipos genéricos, utilizáveis em qualquer domínio. Atualizações de protocolo (ex: mudança no report schema) editam 1 arquétipo e recompilam todos os agentes derivados — DRY real.

Degradação por harness (reforça matriz §3.2): Copilot `.agent.md` ✅ · Claude Code `agents/*.md` ✅ · Cursor agents como definições de referência (build-dependente, padrão ECC de prefixo) · Codex: roles multi-agent + seções no AGENTS.md.

**Definição ≠ instância (protocolo de paralelismo):** 1 arquivo por papel — o harness spawna N instâncias paralelas da mesma definição em runtime. **Só papéis de execução e gate paralelizam** (autoridade nunca — ver taxonomia). O paralelismo vive no **protocolo do orquestrador** (`core/protocols/`): task decomposta em subtarefas independentes → despachar até **3 instâncias paralelas** (wave cap default) do mesmo especialista, com **escopos de arquivo disjuntos** (sem conflito de escrita) e merge dos Sub-Agent Reports. Ressalva do próprio ECC: paralelismo multiplica contexto/custo — usar só quando há valor real (multi-módulo, reviews paralelos); sequencial é mais token-eficiente para tarefas simples.

**Protocolo de deliberação (painéis ímpares)** — o "3" também é quórum: número ímpar nunca empata. Escada por peso da decisão (`core/protocols/deliberation`):

| Peso | Mecanismo | Custo | Registro |
|---|---|---|---|
| Trivial/local | 1 agente decide (fast-path) | 1x | — |
| Técnica com alternativas reais | painel de 3 instâncias independentes → voto majoritário | 3x | voto no Sub-Agent Report |
| Negócio/arquitetural | debate estruturado: proponente × opositor × sintetizador (padrão red/blue/auditor do AgentShield) → síntese → **humano decide** via ALIGN | alto | debate vira proposta de ADR |

Salvaguardas: (1) painel é **advisory** — quem ratifica é o single role competente (Architect/ADR, Product/PRD, Tech Lead/delegação); a regra de autoridade fica intacta; (2) **humano é o decisor final** no tier negócio/arquitetural — o debate LLM eleva a qualidade da discussão, não substitui a decisão; (3) gatilho por peso, não por padrão — 3x de custo só com alternativas genuínas; instâncias do painel são efêmeras (spawn → voto/argumento → merge). Coerência: wave cap = quórum = 3; o red-team eval (F4.4) reusa o mesmo mecanismo.

### 3.8 Evals: arquitetura de avaliação

**Duas superfícies distintas:**

| Superfície | Onde roda | Protege | Gatilho |
|---|---|---|---|
| **Evals do produto** | CI do repo Berserqir | o harness em si — matriz **suite × harness compilado** (Copilot, Claude Code, Cursor) | toda mudança em core/adapters (F4.3) |
| **Evals instalados** | repo do usuário (`/run-evals`) | a instalação/customização do usuário | manual, pós-edição de agente, pós-`update` |

**Suíte (herdados + 1 eval novo por feature nova):**

| ID | Testa | Grader | Fase |
|---|---|---|---|
| e01–e05 | fast-path · ALIGN · blocking · report schema · memory sync | misto | herdados Setup 1 |
| e06 | guardrails bloqueiam (git-safety, secrets, config-protection) | determinístico (exit codes) | F2 |
| e07 | escalação: junior escala ao 1º sinal de complexidade | LLM-judge (rubrica) | F1 |
| e08 | deliberação: roteamento por peso + humano decide no tier 3 | LLM-judge + registro ADR | F1 |
| e09 | paralelismo: escopos disjuntos, wave cap 3, merge de reports | determinístico | F1 |
| e10 | `/init` brownfield: nada gravado sem OK bloco a bloco | determinístico + judge | F1 |
| e11 | grafo textual: codemap ≤ budget de tokens, âncoras resolvem | determinístico | F1 |
| e12 | mentorship: ensina novato, não palestra expert, override logado | judge + determinístico | F1 ✅ |

**Princípios de grading:**
1. **Determinístico sempre que possível** (JSON schema, exit code, grep de âncora); LLM-as-judge só para o subjetivo, com rubrica fixa versionada.
2. **pass@3 com maioria (2/3)** — agente é estocástico; 3 rodadas, quórum ímpar (o "3" fecha o sistema: wave cap = deliberação = evals).
3. **Eval como gate de promoção** — instinct só vira skill se passar por eval (padrão `/learn-eval` do ECC); falha de eval vira anti-exemplo no pool ICL.

Resultados: `.berserqir/evals/results/YYYY-MM-DD.md` (convenção do Setup 1 mantida). O gate QA (arquétipo) é quem executa a suíte instalada quando invocado.

### 3.9 Mentorship: calibração por proficiência do humano (anti-deskilling)

**Agentes são extensão do conhecimento do humano, não substituto.** Nenhum dos 3 harnesses de referência trata disso — são produtividade pura, que multiplica output e atrofia o operador. Diferencial de produto (`core/protocols/mentorship.md`).

| Modo | Quando (por ÁREA, não global) | Comportamento |
|---|---|---|
| **Learn** | humano não entende o que pede (sinais de novato) | ensina antes de fazer · menor passo funcional · implementação guiada · 1 pergunta de compreensão · nunca despeja solução pronta em silêncio |
| **React** | competente na área, avançado em adjacentes | acelera o que ele sabe · anotações educativas só no não-óbvio · flags "vale aprender" |
| **Productivity** | senior+ na área | multiplicador total · mínimo de prosa · só trade-offs genuinamente novos |

Mecânica: perfil por área em `.berserqir/memory/human-profile.md` (níveis + evidência + confiança) · seed no `/init` (pergunta 7), refinado por comportamento (tipos de pergunta, correções, profundidade de review — autoavaliação mente, comportamento não) · mudança de nível exige evidência repetida (mesma filosofia do instinct pipeline — **simetria**: instincts = harness aprende o codebase; mentorship = harness aprende o humano) · override "just do it" respeitado na hora e logado · modo pinável por área · **guardrails idênticos em todos os modos** (Learn não é rodinha: o que muda é pedagogia, nunca proteção) · eval e12 verifica os 3 cenários + anti-check de over-teaching.

---

## 4. Roadmap em 5 fases

### Fase 0 — Decisões estratégicas ✅ (concluída 2026-07-07 — ver §5)
Nome, licença, distribuição, escopo do MVP e arquitetura — todas fechadas.

### Fase 1 — Consolidação do Core (extrair o comum dos 2 setups)
1. Extrair do Setup 1 os protocolos universais → `core/protocols/`: agentic loop, memory system + schemas, sub-agent report, fast-path, context budgets, recovery protocol.
2. Extrair do Setup 2 o que é universal: matriz de complexidade/escalação, RICE scoring, padrão de restrição de execução (genérico: "comandos que só o usuário roda").
3. Generalizar agentes em **arquétipos + overlays** (§3.7): arquétipos domínio-agnósticos em `core/agents/`, especializações finas em `profiles/<área>/agents/`, composição achatada pelo installer — os 11 agentes do Setup 1 e os 3 do Setup 2 viram instâncias compiladas.
4. Mover domínio-específico para as áreas: `profiles/front/`, `profiles/back/`, `profiles/ops/{dev,sec}` (← Setup 1 decomposto), `profiles/ops/fin` e `profiles/infra/` (← Setup 2).
5. Implementar o **modelo Stack × Área** (§3): core invariante em toda instalação; áreas e sub-módulos de ops selecionáveis; cerimônia auto-regulada pelo fast-path (não por tier de instalação).
6. Escrever o `/init` duplo (§3.3): greenfield (entrevista → PRD + SDD + memórias) e brownfield (scan do codebase → confirmação back-to-back); o scan brownfield também materializa o grafo textual inicial (§3.5: codemap + graph.json).
7. `ops/ia` é conteúdo novo (nenhum setup cobre MLOps/LLMOps) — no MVP entra com escopo mínimo (skills de eval de modelos, deploy de inferência, pipelines de dados); expansão completa na F4.

**DoD:** Setup 1 ≡ `core + front + back + ops` e Setup 2 ≡ `core + infra`, compilados para Copilot, reproduzem os setups atuais 1:1; evals e01–e05 passam no resultado compilado; `/init` brownfield rodado no repo da landing page gera PRD/SPECS coerentes com os atuais.

### Fase 2 — Guardrails universais (quick win, paralelo à F1)
1. Hook **git-safety**: bloquear `push`/`--force`/`--no-verify`/`reset --hard` sem autorização explícita (codifica a regra pessoal existente).
2. Hook **secret-scan**: padrões `sk-`, `ghp_`, `AKIA`, etc. em prompts e diffs.
3. Hook **config-protection**: agente não edita `.eslintrc`, `tsconfig`, lint configs para "passar" checks.
4. Portar o hook impeccable para o formato canônico.
5. Converter gates de qualidade em **checks determinísticos** (scripts sem LLM, padrão Impeccable) rodáveis em hook e em CI.
6. Hooks de memória (§3.6): **memory-validate** (JSON Schema post-edit + lint de template MD + size budget) e **memory-journal** (camada determinística: PostToolUse/SessionStart/SessionEnd/PreCompact).

**DoD:** suíte de hooks roda em Claude Code (nativo) e Copilot; evals novos (e06-guardrails) verificam bloqueios.

### Fase 3 — Portabilidade (adapters + installer)
Ordem de ataque (por valor × esforço):
1. **Copilot** — formato de origem, adapter quase-identidade. Valida o compilador.
2. **Claude Code** — estruturar como **plugin** (commands, skills, agents, hooks + `marketplace.json`). Hooks nativos = melhor alvo para guardrails.
3. **Cursor** — rules `.mdc` + hooks via adapter DRY (receita do ECC). **No MVP (D5).**
4. **Codex/OpenCode/Gemini CLI** — AGENTS.md + degradação graciosa documentada (sem hooks → checklist manual). Pós-MVP.
5. **Installer** `npx berserqir install` + `update`: autodetect de harness (Impeccable) + seleção Stack ou por área/sub-módulo (ECC selective install) + manifest local (§3.4) + handoff para o `/init` greenfield/brownfield (§3.3). Após instalar, o npm sai de cena — tudo vendorado no repo.

**DoD:** `npx berserqir install` num repo limpo produz harness funcional em Copilot, Claude Code E Cursor; smoke eval passa nos três.

### Fase 4 — Fechar os gaps restantes (evolução)
1. **Instinct pipeline** (ECC continuous-learning-v2, mecânica verificada no repo): captura de padrões via hook de sessão (`evaluate-session`) + comando `/learn`; padrão vira **instinct com confidence score 0–1** reforçado por repetição; injeção no SessionStart só com confidence ≥ 0.7 e **cap de ~6/sessão** (respeita nossos context budgets); instinct não reforçado **expira em 30d** (prune); `/evolve` clusteriza instincts em skills; export/import para compartilhar. **Adaptação Berserqir:** integrar no ciclo TTL existente em vez de sistema paralelo — observação (memory-short, sessão) → instinct candidato (memory-medium, sprint, com confidence) → promoção a demo ICL ou skill (permanente); o journal determinístico (§3.6) é a matéria-prima da extração. **Calibração dupla (insight 2026-07-08):** skills geradas são moldadas pelo projeto (padrões do codebase) E pelo humano (human-profile §3.9 define o nível de explicação da skill gerada — Learn = didática, Productivity = densa). Mentorship × instincts se retroalimentam: uma coisa melhora a outra.
2. **Memory indexing / grafo** (Graphify-inspired, D9): o **grafo textual (§3.5) já nasce no core** — esta fase só adiciona o acelerador para casos extremos: avaliar integração com Graphify primeiro; se construirmos, **motor em Go** consumindo/produzindo os mesmos artefatos textuais (`graph.json`, `codemap.md`), via `optionalDependencies`, com degradação graciosa (sem binário, travessia agêntica pura). A economia de tokens vem da arquitetura de subgrafos; o Go compra latência e escala em monorepos gigantes.
3. **Evals como CI** (§3.8): matriz suite × harness compilado em GitHub Actions a cada mudança no harness (hoje é manual).
4. **Red-team eval** (AgentShield-inspired): eval adversarial dos guardrails — reusa o protocolo de deliberação (§3.7): painel proponente × opositor × auditor contra a configuração do próprio harness.

### Fase 5 — Distribuição e ecossistema
1. Repo público + README + docs de instalação por harness.
2. Publicar no npm (installer) + Claude Code plugin marketplace (gratuito — é só um repo GitHub referenciável via `/plugin marketplace add`).
3. Registrar skills no formato Agent Skills (descobrível por Copilot).
4. Opcional: página/landing (dogfooding do profile front 🔁).
5. Monetização futura (D2, pós-tração): **modelos de arquitetura focados/premium** sobre o core aberto — OSS permanece livre (modelo ECC: MIT + camadas pagas).

---

## 5. Decisões da Fase 0 — ✅ todas fechadas (2026-07-07)

| # | Decisão | Opções | Recomendação |
|---|---|---|---|
| D1 | **Nome do harness** | — | ✅ **DECIDIDO (2026-07-07): Berserqir** — plural nórdico de *berserkr*; npm livre; `npx berserqir` |
| D2 | **Visibilidade e convenções** | — | ✅ **DECIDIDO: open-source** (objetivo: visibilidade; monetização futura via modelos de arquitetura focados — F5.5). Convenções da empresa **nunca em agentes**: entram como **memória** via `/init` ou em projeto andando (§3.3) — agentes intocados, core genérico p/ todos os harnesses |
| D3 | **Distribuição MVP** | — | ✅ **DECIDIDO: npx-first** (`npx berserqir` — via primária, GH Copilot é o harness pessoal); marketplaces na F5 (listagem é gratuita — Claude Code marketplace = repo GitHub referenciado) |
| D4 | **Setups viram profiles?** | — | ✅ **DECIDIDO: unificação total** — produto é um só; decomposição em core+profiles é arquitetura interna (Setup 1 → front+back+ops, Setup 2 → infra) |
| D5 | **Harnesses do MVP** | — | ✅ **DECIDIDO: GH Copilot + Claude Code + Cursor** (F3); Codex/OpenCode/Gemini via AGENTS.md pós-MVP |
| D6 | **Granularidade de ops** | — | ✅ **DECIDIDO (2026-07-07): sub-módulos *+ops** — `ops/dev`, `ops/sec`, `ops/fin`, `ops/ia` (juntos por padrão, selecionáveis); `ops/ia` com escopo mínimo no MVP |
| D7 | **Brownfield no MVP?** | — | ✅ **DECIDIDO: ambos** — greenfield + brownfield desde o início; base na ideia do Impeccable (`/init` + `/document`), generalizada para além de frontend |
| D8 | **Stack do installer** | Node/TS via npx / Go binário / híbrido | **Node/TS via npx** (§3.4) — distribuição vence performance num processo I/O-bound; Go fica como escape hatch para checks de hooks (F4) |
| D9 | **Indexação/grafo** | motor residente / grafo textual / híbrido | ✅ **DECIDIDO (2026-07-07, revisada): grafo textual no core** (§3.5, zero-install) — codemap + graph.json + âncoras + tags, travessia agêntica; motor Go só como acelerador opcional na F4 (avaliar Graphify antes) |
| D10 | **Formato da memória** | tudo JSON / tudo MD / híbrido | ✅ **DECIDIDO (2026-07-07): híbrido por consumidor** (§3.6) — MD para LLM/humano (short, long, codemap), JSON para máquina (medium, manifest, graph); validação via hook determinístico + size budgets |
| D11 | **Seleção de modelos** | hardcoded / pergunta no init / só default | ✅ **DECIDIDO (2026-07-08, estendida): roster no /init (pergunta 8) com camada por PROFILE** — resolução em cascata: override[agente] > profiles[área][classe] > classe > omite (free-plan safe). Afinidades por domínio (ex: família visual-forte p/ front) vivem em `affinities.json` como **dado curado com sourcedAt** — conselho no /init, nunca auto-aplicado (rankings apodrecem a cada release); mistura de famílias opt-in em gates e painéis |

---

## 6. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Complexidade do Setup 1 afasta adopters (mesma crítica feita ao ECC) | Core auto-regulado: fast-path/skip rules escalam cerimônia por tarefa; instalação por área reduz a superfície instalada |
| Features sem equivalente em todos os harnesses (hooks, subagentes) | Degradação graciosa **documentada** por adapter; nunca prometer paridade |
| Manter N adapters vira fardo | Fonte canônica + compilação; proibido editar gerado; evals compilados por alvo no CI |
| Repositório do usuário incha com múltiplos harnesses | Hub-and-spoke por regime de carga (§3.4): sob-demanda 1x no hub, só fiação materializada por spoke; install só do harness escolhido (coexistência é opt-in) |
| Drift entre canônico e formatos dos vendors (mudam rápido) | Adapters finos; acompanhar agents.md e Agent Skills (padrões mais estáveis) |
| Memory system não faz sentido multi-projeto out-of-the-box | Bootstrap duplo (§3.3): greenfield entrevista e semeia memórias; brownfield deriva do código real com confirmação |
| Brownfield entende errado o codebase e grava specs falsas | Confirmação bloco a bloco obrigatória (nada gravado sem OK) + specs marcadas como `draft` até revisão humana |
| Hooks Node lentos demais em uso intensivo (startup ~50–100ms por tool-use) | Escape hatch §3.4: reescrever só os checks em Go, distribuídos via npm (`optionalDependencies` por plataforma, padrão esbuild/Biome) |

---

## 7. Próximos passos imediatos

1. [x] Reservar o pacote npm `berserqir` — ✅ **PUBLICADO** `berserqir@0.0.1` (2026-07-08, 2FA habilitado); transfer p/ org `berserq` fica a critério (não bloqueia nada)
2. [x] Criar estrutura do monorepo `berserqir/` (esqueleto §3) — 2026-07-07
3. [x] Definir formato canônico do frontmatter (`core/FORMAT.md`) + arquétipo de prova (`core/agents/senior.md`) — 2026-07-07
4. [x] F1.1 — protocolos extraídos e generalizados em `core/protocols/`: agentic-loop, sub-agent-report, parallelism, deliberation, memory-sync, context-budget — 2026-07-07
5. [x] F2.1 — hook git-safety (`core/hooks/git-safety/git-safety.sh`, POSIX zero-deps) — testado: 6 bloqueios + 4 allows + override — 2026-07-07
6. [x] 8 arquétipos completos (`core/agents/`): orchestrator, architect, product, senior, pleno, junior, qa, security — 2026-07-07
7. [x] Memória D10: `memory-medium.schema.json` + templates (long.md, short.md, medium.json, codemap.md) — 2026-07-07
8. [x] Evals e01–e05 portados + README da suíte (`core/evals/`) — 2026-07-07
9. [x] F2 completa: hooks secret-scan (8 padrões), config-protection (lint/test/CI configs), memory-validate (schema+headings+size budget), memory-journal (camada determinística) — todos testados — 2026-07-08
10. [x] F1 core completo: skills core (sdd, icl, context-eng, git-workflow) + prompts (/init greenfield+brownfield, /compress, /run-evals) + templates (prd, specs, tests, adr, spec-kit) — **core = 43 arquivos, 172K** — 2026-07-08
11. [x] F1 — **squad front completo**: sr-front + pleno-front + junior-front (handoffs consistentes, escalação jr→pleno→sr dentro da área) — 2026-07-08; demais profiles (back, ops, infra) pendentes
12. [x] **F3.1 — adapter Copilot FUNCIONANDO** (`adapters/copilot/compile.mjs`, zero-deps): compõe arquétipo⊕overlay, whitelist do schema fechado, traduz model routing (top→Claude Fable 5), gera seções de corpo p/ campos não suportados, path-rewriting core/→.berserqir//.github/, vendoriza hub, injeta roster em copilot-instructions.md + AGENTS.md, manifest — **9 agentes, 19 arquivos, 7/7 validações** — 2026-07-08. **v2 (review do usuário):** parser YAML estendido (block lists + listas de objetos); arquétipos com `tools` canônicas mapeadas via tools.json, `agents`, `user-invocable`, handoffs ricos (label/agent/prompt/send — padrão Setup 1); disciplina de tools por tipo de papel (orchestrator SEM edit; gates read-only; junior sem execute/web)
13. [x] **Mentorship (§3.9)** — protocolo anti-deskilling: 3 modos Learn/React/Productivity por área + human-profile template + pergunta 7 do /init + bootstrap Copilot + eval e12 — 2026-07-08
14. [x] **D11 — model roster** (`/init` pergunta 8): classes canônicas + mapeamento por plano/usuário + fallback default do harness (free-safe) + overrides por agente + diversidade de famílias opt-in em gates/painéis (deliberation §6) — testado — 2026-07-08. **Estendida:** camada `profiles` no models.json (resolução agente > profile×classe > classe > omite) + `affinities.json` (afinidades por domínio como dado curado c/ data — conselho no /init, nunca auto-aplicado) — testado: sr-front→Gemini via profile, senior→Claude via classe, junior→omitido
15. [x] **Compilador v3 — substituição por tier**: profile instalado → arquétipos genéricos de execução cobertos NÃO são emitidos e todas as referências (agents/handoffs de autoridade e gates) são reescritas p/ o esquadrão da área (1 candidato = substitui; N = expande handoff c/ sufixo); core-only → genéricos voltam — testado nos 2 modos — 2026-07-08
16. [x] **Hooks wiring Copilot**: `.github/hooks/berserqir.json` (schema v1 verificado contra Setup 1) → `copilot-adapter.mjs` (normaliza payload defensivamente, roda config-protection + memory-validate + memory-journal; exit 2 = block) — testado: bloqueia .eslintrc, journala edit normal — 2026-07-08
17. [x] **Squad back completo**: sr-back + pleno-back + junior-back (Nitro/API/validation; junior-back reforça escalação em auth/payments/migrations) — multi-profile front+back testado: handoffs expandem por candidato — 2026-07-08
18. [x] **Profiles ops + infra completos** — ops = 4 especialistas únicos (`tier: specialist`, não substituem tiers genéricos): dev-ops, sec-ops (implementa; gate security revisa), fin-ops (analisa amplo, edita estreito, recomendações quantificadas), ml-ops (escopo mínimo D6) · infra = squad completo (sr/pleno/junior-infra) com restrição sagrada do Setup 2 (plan/apply/destroy = humano) e matriz de complexidade portada · compilador: expansão `ops`→sub-módulos + orchestrator conhece esquadrão inteiro — **Stack completo testado: 18 agentes, handoffs expandem só p/ srs de área (sem poluição de especialistas)** — 2026-07-08
19. [x] **Skills de domínio + instructions por área** — skills: vue-components, tailwind-mastery, performance-cwv (front), api-design (back) — todas as referências dos overlays agora resolvem; impeccable virou companion externo opcional (não vendorado — é produto de terceiro). Instructions (regime applyTo, auto-injetadas por glob): front/back/infra. Compilador processa skills+instructions de core E profiles; serializer quota globs YAML — 2026-07-08
20. [x] **Princípio stack-agnostic (review do usuário, modelo Impeccable)**: profiles trazem DISCIPLINA, nunca stack — skills renomeadas/generalizadas (vue-components→component-patterns, tailwind-mastery→styling-discipline), agentes e instructions sem nomes de framework; stack do projeto vive em memory-long §stack (seed /init), idiomas resolvidos em task-time. Infra generalizada p/ IaC-agnostic (preview/apply human-only, exemplos tf/pulumi). Validado: zero menções de framework nos profiles — 2026-07-08
21. [x] **Estratégia de conteúdo (pergunta do usuário: por que não 200 skills como o ECC?)** — (a) os 261 do ECC são explosão combinatória disciplina×framework; stack-agnostic elimina a multiplicação (1 nossa ≈ N deles); (b) instructions poucas e tersas de propósito (always-on = custo de contexto — o próprio ECC manda copiar rules seletivamente); (c) **skills específicas do projeto são GERADAS, não empacotadas** — instinct pipeline (F4) + ICL + eval gate = equivalente superior ao /skill-create do ECC. Catálogo expandido p/ **14 disciplinas**: +testing-discipline (core), +accessibility, +motion (front), +data-safety (back), +security-hardening (ops/sec), +state-discipline (infra) — wired nos agentes; todas as refs validadas — 2026-07-08
22. [x] **Suíte de evals completa (e01–e12)**: +e06 guardrails (determinístico + camada comportamental + anti-check de override), +e07 escalação (domínio vence tamanho), +e08 deliberação (roteamento por peso + humano no topo), +e09 paralelismo (escopos disjuntos, cap, autoridade nunca), +e10 init-brownfield (nada sem OK bloco a bloco), +e11 grafo (budget, âncoras, anti-rot) — todos com anti-checks. + scaffold do pool ICL (`core/skills-resources/icl/demos/` — nasce vazio por design, cresce do projeto) vendorado pelo compilador — 2026-07-08
23. [x] **CONTEÚDO DO ALVO COPILOT: 100%** — Stack completo compila 80 arquivos (18 agents, 14 skills, 3 instructions, 3 prompts, 12 evals, 7 protocolos, hub completo). Pendente para fechar a EXPERIÊNCIA: installer (`npx berserqir install`) + validação hands-on do usuário no VS Code
24. [x] **Installer detect→plan→apply** (`installer/bin/berserqir.js`, zero-deps): install/update/version/help · detecção de áreas (dirs+deps) · plano fresh/current/safe-update/conflito (hashes no manifest) · arquivos modificados NUNCA sobrescritos sem `--force` · alias `--profiles full` · empacotamento npm (prepack vendoriza core/profiles/adapters, postpack limpa) · **ciclo modelo fechado**: models.json+affinities.json vendorados em `.berserqir/`, `/init` pergunta 8 escreve `.berserqir/models.json`, update recompila com o roster do usuário (`--models`) — testado ponta a ponta incl. tarball — 2026-07-08
25. [ ] Próximo: `npm publish` 0.1.0 (OTP do usuário) → validação hands-on VS Code → adapter Claude Code

---

## Apêndice A — Matriz comparativa final

| Capacidade | Impeccable | ECC | Graphify | Setup 1 | Setup 2 | **Unificado (alvo)** |
|---|---|---|---|---|---|---|
| SDD (PRD→SPECS→TESTS) | ◐ (2 arquivos) | ◐ (AGENTS.md) | ✗ | ✅ | ✗ | ✅ core (sempre) |
| Memória hierárquica TTL | ✗ | ◐ (sessão) | ◐ (grafo) | ✅ | ✗ | ✅ core (sempre) |
| Loop de execução c/ ALIGN | ✗ | ✗ | ✗ | ✅ | ✗ | ✅ core |
| ICL / demos | ✗ | ◐ (instincts) | ✗ | ✅ | ✗ | ✅ + pipeline automático |
| Evals comportamentais | ✗ | ◐ (security) | ✗ | ✅ | ✗ | ✅ + CI |
| Guardrails (git/secrets/config) | ✗ | ✅ | ✗ | ◐ (1 hook) | ◐ (bans IaC) | ✅ core |
| Checks determinísticos | ✅ | ◐ | ✗ | ✗ | ✗ | ✅ F2 |
| Subagentes c/ senioridade | ✗ | ✅ (28) | ✗ | ✅ (11) | ✅ (3) | ✅ arquétipos + profiles |
| Report schema JSON | ✗ | ✗ | ✗ | ✅ | ✗ | ✅ core |
| Context budgets por fase | ✗ | ✗ | ◐ (implícito) | ✅ | ✗ | ✅ core |
| Cross-harness | ✅ | ✅ | ✅ | ✗ | ✗ | ✅ F3 |
| Installer + selective install | ✅ | ✅ | ✅ | ✗ | ✗ | ✅ F3 (Stack × Área) |
| Bootstrap brownfield (scan + confirmação) | ◐ (/document, só design) | ✗ | ◐ (grafo, sem confirmação) | ✗ | ✗ | ✅ §3.3 |
| Distribuição (npm/marketplace) | ✅ | ✅ | ✅ | ✗ | ✗ | ✅ F5 |

Legenda: ✅ completo · ◐ parcial · ✗ ausente

## Apêndice B — Fontes
- Impeccable: github.com/pbakaus/impeccable · impeccable.style/docs
- ECC: github.com/affaan-m/everything-claude-code · ecc.tools · npm `ecc-universal`
- Graphify: github.com/safishamsi/graphify · Graphiti: github.com/getzep/graphiti
- Padrões: agents.md · Agent Skills (code.visualstudio.com/docs/agent-customization/agent-skills) · Claude Code plugins (code.claude.com/docs/en/discover-plugins)
