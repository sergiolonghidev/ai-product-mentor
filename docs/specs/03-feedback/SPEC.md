# SPEC.md — F3: Feedback por Resposta (Thumbs + Chips de Razão)

**Tagline:** qualidade percebida → dado acionável
**Prioridade:** P0 — Sprint 1
**Métrica principal:** > 75% de taxa de aceitação (thumbs up)

---

## Objetivo

Sem esta feature, a métrica de aceitação não existe. O feedback sinaliza onde o modelo está errando sem precisar de entrevista. O detalhe crítico: o mentor deve reagir ao thumbs down **na mesma sessão**.

> "Se a IA me der uma resposta genérica de livro-texto que não se aplica ao contexto específico da minha empresa, eu desisto na hora." — Mari

---

## Fluxo — Thumbs Up

```
[PM lê a resposta]
        │
        ▼
[Clica em 👍]
        │
        ▼
[POST /api/feedback { vote: 'up' }]
        │
        ▼
[Feedback salvo | Ícone fica "ativo" (preenchido)]
```

---

## Fluxo — Thumbs Down

```
[PM lê a resposta]
        │
        ▼
[Clica em 👎]
        │
        ▼
[Chips de razão aparecem]
        │
   ┌────┴─────────────────────────────┐
   │  "Muito genérico"                │
   │  "Não se aplica ao meu contexto" │
   │  "Faltou detalhe regulatório"    │
   │  "Informação incorreta"          │
   └────┬─────────────────────────────┘
        │ PM seleciona 1 chip
        ▼
[POST /api/feedback { vote: 'down', reason: '...' }]
        │
        ▼
[Servidor salva feedback + dispara refinamento]
        │
        ▼
[Nova resposta (refinamento) aparece em stream no chat]
```

---

## Componentes de UI

```
FeedbackBar
├── ThumbsUpButton
│   └── Estado: idle | active (após click)
├── ThumbsDownButton
│   └── Estado: idle | active | chips_visible
└── ReasonChips (visível após thumbs down)
    ├── ChipButton ("Muito genérico")
    ├── ChipButton ("Não se aplica ao meu contexto")
    ├── ChipButton ("Faltou detalhe regulatório")
    └── ChipButton ("Informação incorreta")
```

---

## Comportamento dos Chips de Razão

- Aparecem imediatamente **abaixo da FeedbackBar** ao clicar em thumbs down
- **Não bloqueiam** o conteúdo acima
- Ao selecionar um chip:
  1. O chip fica visualmente "selecionado" (highlighted)
  2. Os outros chips ficam desabilitados
  3. Spinner de loading aparece: "Preparando uma nova resposta..."
  4. A nova resposta (refinamento) aparece **na mesma thread de chat**, com label "🔄 Versão refinada"
- Se o PM fechar a janela antes de selecionar um chip, o thumbs down **não é salvo** (feedback parcial não conta)

---

## Comportamento do Refinamento

O servidor, ao receber `vote: 'down'` com `reason`:
1. Busca a mensagem original e o contexto da sessão
2. Constrói um prompt de refinamento com a razão do feedback
3. Retorna a nova mensagem em stream

O refinamento é uma **nova mensagem** no histórico (não substitui a anterior). O PM pode ver as duas versões.

### Prompt de Refinamento

```typescript
// lib/prompts/refinement.prompt.ts

export function buildRefinementPrompt(
  originalMessage: Message,
  feedbackReason: FeedbackReason,
  context: SessionContext
): string {
  const reasonInstructions: Record<FeedbackReason, string> = {
    too_generic: `
      A resposta anterior foi considerada muito genérica.
      Reescreva sendo mais específico ao contexto do squad "${context.squad}" 
      e ao tipo de funcionalidade "${context.functionalityType}".
      Use exemplos concretos do segmento de cartões de crédito.
    `,
    wrong_context: `
      A resposta anterior não se aplicou ao contexto correto.
      Considere que o PM trabalha em "${context.squad}" com "${context.functionalityType}".
      Reescreva focando exatamente nesse cenário específico.
    `,
    missing_regulatory_detail: `
      A resposta anterior faltou detalhe regulatório.
      Inclua referências específicas às regulamentações do BCB aplicáveis ao contexto.
      Mencione normativos relevantes (Resoluções BCB, CMN) quando pertinente.
    `,
    incorrect_information: `
      A resposta anterior continha informação incorreta.
      Revise cuidadosamente e corrija. Se não tiver certeza de algum dado,
      sinalize explicitamente com "verifique com seu time de Compliance".
    `,
  }

  return `
Você é o AI Project Mentor.

Contexto do PM:
- Squad: ${context.squad}
- Tipo: ${context.functionalityType}
- Dor: ${context.currentPain}

Sua resposta anterior foi:
"""
${originalMessage.content}
"""

O PM avaliou negativamente esta resposta porque: ${reasonInstructions[feedbackReason]}

Gere uma nova versão melhorada da resposta.
Comece com "Deixa eu reformular:" para sinalizar que é uma versão refinada.
`.trim()
}
```

---

## Interface TypeScript dos Componentes

```typescript
// components/feedback/FeedbackBar.tsx
type FeedbackBarProps = {
  messageId: string
  sessionId: string
  existingFeedback?: { vote: 'up' | 'down', reason?: FeedbackReason }
  onFeedbackSubmitted: (feedbackId: string, refinementTriggered: boolean) => void
}

// components/feedback/ReasonChips.tsx
type ReasonChipsProps = {
  onSelect: (reason: FeedbackReason) => void
  isLoading: boolean
}

type ChipConfig = {
  reason: FeedbackReason
  label: string
}

const CHIP_CONFIG: ChipConfig[] = [
  { reason: 'too_generic',               label: 'Muito genérico' },
  { reason: 'wrong_context',             label: 'Não se aplica ao meu contexto' },
  { reason: 'missing_regulatory_detail', label: 'Faltou detalhe regulatório' },
  { reason: 'incorrect_information',     label: 'Informação incorreta' },
]
```

---

## Regras de Negócio

- **RN-01:** Cada mensagem tem **no máximo 1 feedback** (não pode votar duas vezes).
- **RN-02:** Após votar, os botões ficam **travados** — o PM não pode mudar o voto.
- **RN-03:** Thumbs down **sem chip selecionado** não é salvo — os chips são obrigatórios.
- **RN-04:** O refinamento é **obrigatório** após thumbs down — o sistema sempre gera uma nova resposta.
- **RN-05:** O refinamento tem seu próprio `FeedbackBar` — o PM pode avaliar o refinamento também.
- **RN-06:** O PM pode dar thumbs down em um **refinamento** — o servidor irá refinar novamente (limite: 3 refinamentos por mensagem original para evitar loops).
