# SPEC.md — F2: Gerador de User Story + Linter de Compliance

**Tagline:** escreva → revise → entregue sem volta da eng
**Prioridade:** P0 — Sprint 2–4
**Métrica principal:** -30% de cards reabertos por critério de aceite falho

---

## Objetivo

PM descreve a funcionalidade em linguagem natural. O mentor devolve User Story completa com critérios de aceite e um bloco de riscos regulatórios por cor. Essa é a feature que resolve o "Ping-Pong do Jira".

> "Quando o Tech Lead elogia meu refinamento, isso muda minha semana inteira." — Mari

---

## Fluxo Principal

```
[PM digita descrição da funcionalidade no InputBar]
           │
           ▼
[POST /api/story/generate → stream]
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼ (paralelo)
[Story aparece   [POST /api/story/lint]
 em stream]             │
    │                   ▼
    │             [LintResult retorna]
    │                   │
    └──────────────────►▼
               [LinterPanel atualiza com riscos]
```

---

## Partes da User Story Gerada

### 1. Cabeçalho da Story
```
Como [persona específica do squad do PM]
Quero [ação concreta com detalhes técnicos]
Para que [benefício mensurável para o usuário ou negócio]
```

### 2. Critérios de Aceite
- Mínimo 3, máximo 8 critérios
- Cada critério tem categoria: `functional | compliance | ux | performance`
- Critérios de compliance têm **destaque visual** diferente dos funcionais

### 3. Bloco de Riscos (Linter)
- Aparece **separado** da User Story, em painel lateral ou abaixo
- Máximo **2 riscos vermelhos** (críticos) exibidos
- Riscos verdes (ok) são exibidos de forma colapsada ("X itens verificados sem problema")

---

## Regras do Linter de Compliance

### Categorias de Verificação

| Verificação | Nível padrão | Normativo |
|-------------|-------------|-----------|
| CET ausente nos critérios de aceite | 🔴 Red | Res. BCB 96/2021 |
| Taxa de juros não mencionada quando aplicável | 🔴 Red | Res. CMN 3.919/2010 |
| Ausência de critério de desistência | 🔴 Red | Res. BCB 96/2021, Art. 4º |
| Data de vencimento não contemplada em fatura | 🟡 Amber | Res. BCB 96/2021 |
| Ausência de critério de acessibilidade | 🟡 Amber | Lei 13.146/2015 |
| Critério de cancelamento ausente | 🟡 Amber | CDC Art. 49 |
| Limite de crédito não validado como input | 🟡 Amber | Boa prática |
| Story sem critério de performance | 🟢 Green | Boa prática |
| Persona genérica ("usuário") sem especificação | 🟡 Amber | Boa prática PM |

### Regras de Exibição
- **🔴 Red:** máximo 2 por documento. Se houver mais, agrupa os demais em 1 amber de "outros riscos críticos".
- **🟡 Amber:** exibe todos, em lista colapsável
- **🟢 Green:** exibe como contador: "5 itens verificados ✓"
- **Falso positivo threshold:** o linter usa instructions explícitas para não alertar quando o critério já está coberto de forma implícita

---

## Componentes de UI

```
StoryPage
├── InputBar
│   ├── Textarea (descrição da funcionalidade)
│   └── SendButton
│
├── ChatWindow
│   └── MessageBubble (tipo: user_story)
│       ├── StoryBlock
│       │   ├── PersonaLine ("Como...")
│       │   ├── ActionLine ("Quero...")
│       │   ├── BenefitLine ("Para que...")
│       │   └── AcceptanceCriteriaList
│       │       └── CriterionItem (com badge de categoria)
│       └── FeedbackBar (F3)
│
└── LinterPanel
    ├── LintStatusBadge (pending | running | complete)
    ├── RiskList
    │   ├── RiskItem (red)  ← max 2
    │   ├── RiskItem (red)
    │   └── AmberGroup (colapsável)
    │       └── RiskItem (amber) × N
    └── GreenSummary ("X itens ok ✓")
```

### Estados do LinterPanel

| Estado | O que exibe |
|--------|-------------|
| `idle` | Nada (painel oculto) |
| `pending` | Spinner + "Verificando conformidade..." |
| `complete_ok` | Badge verde + "Nenhum risco crítico identificado" |
| `complete_risks` | Lista de riscos com níveis |
| `error` | "Verificação indisponível. A story foi gerada normalmente." |

---

## Prompt Templates

```typescript
// lib/prompts/story.prompt.ts

export function buildStoryPrompt(
  description: string,
  context: SessionContext
): string {
  return `
Você é o AI Project Mentor — mentor sênior de produto em instituições financeiras no Brasil.

Contexto do PM:
- Squad: ${context.squad}
- Tipo de funcionalidade: ${context.functionalityType}
- Dor atual: ${context.currentPain}

O PM descreveu a seguinte funcionalidade:
"${description}"

Gere uma User Story completa no formato abaixo. Seja específico ao contexto do squad — 
não use termos genéricos como "o usuário" se puder ser mais preciso.

## User Story

**Como** [persona específica]
**Quero** [ação concreta com detalhes técnicos relevantes]
**Para que** [benefício mensurável]

## Critérios de Aceite

Gere entre 3 e 6 critérios. Para cada critério, indique a categoria entre parênteses:
(functional), (compliance), (ux) ou (performance).

- [ ] [critério 1] (categoria)
- [ ] [critério 2] (categoria)
...

Regras:
- Critérios de compliance devem ser específicos (mencione o que exatamente deve aparecer na tela)
- Não crie critérios vagos como "o sistema deve ser rápido"
- Se a funcionalidade envolver valores financeiros, inclua obrigatoriamente critério sobre exibição do CET

Responda apenas com o conteúdo acima, sem explicações adicionais.
`.trim()
}
```

```typescript
// lib/prompts/linter.prompt.ts

export function buildLinterPrompt(
  story: UserStory,
  context: SessionContext,
  playbookRules: string
): string {
  return `
Você é um especialista em compliance de produtos financeiros no Brasil.

Analise a User Story abaixo em busca de riscos regulatórios.

REGRAS DO PLAYBOOK:
${playbookRules}

USER STORY:
Como ${story.persona}
Quero ${story.action}
Para que ${story.benefit}

Critérios de aceite:
${story.acceptanceCriteria.map((c, i) => `${i + 1}. ${c.description}`).join('\n')}

CONTEXTO:
- Squad: ${context.squad}
- Tipo: ${context.functionalityType}

Retorne um JSON com o seguinte formato (sem markdown, apenas JSON puro):
{
  "risks": [
    {
      "id": "risk-1",
      "level": "red" | "amber" | "green",
      "title": "título curto do risco",
      "description": "explicação do risco em 1-2 frases",
      "normativeReference": "Resolução BCB nº X/YYYY, Art. Y",
      "suggestion": "o que o PM deve adicionar ou corrigir",
      "affectedCriteria": ["id dos critérios afetados, se aplicável"]
    }
  ]
}

Regras importantes:
- Só marque como RED se o risco for realmente crítico e bloqueante do ponto de vista regulatório
- Não marque como risco algo que já está coberto de forma implícita nos critérios
- Máximo 4 riscos no total (combine os menos graves em 1 amber se necessário)
- Se não houver riscos, retorne "risks": []
`.trim()
}
```

---

## Interface TypeScript dos Componentes

```typescript
// components/story/StoryEditor.tsx
type StoryEditorProps = {
  sessionId: string
  onStoryGenerated: (story: UserStory) => void
}

// components/story/LinterPanel.tsx
type LinterPanelProps = {
  storyId: string | null
  lintStatus: 'idle' | 'pending' | 'complete' | 'error'
  lintResult: LintResult | null
}

// components/story/RiskBadge.tsx
type RiskBadgeProps = {
  level: 'red' | 'amber' | 'green'
  title: string
  description: string
  normativeReference: string
  suggestion: string
  defaultExpanded?: boolean
}
```

---

## Regras de Negócio

- **RN-01:** O linter roda **assincronamente** — o PM recebe a User Story antes do resultado do linter.
- **RN-02:** Se o linter retornar erro (timeout, LLM down), a User Story **não é afetada** — o painel mostra "Verificação indisponível".
- **RN-03:** Máximo de **2 riscos vermelhos** exibidos. Se o linter retornar mais, o servidor mantém apenas os 2 de maior severidade e agrupa o restante.
- **RN-04:** O PM pode **gerar uma nova versão** da story no mesmo chat, descrevendo a funcionalidade novamente.
- **RN-05:** O linter de uma story anterior **não é reaproveitado** para uma nova geração — sempre roda do zero.
- **RN-06:** A User Story gerada pode ser **copiada** para a área de transferência com um clique (botão "Copiar").
