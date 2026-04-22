# SPEC.md — F1: Onboarding Conversacional Guiado

**Tagline:** first-run → primeira conversa completa
**Prioridade:** P0 — Sprint 1–2
**Métrica principal:** > 60% de conclusão da 1ª conversa

---

## Objetivo

Eliminar o "campo em branco" que mata a ativação. O PM responde 3 perguntas contextuais e recebe sua primeira resposta de valor em menos de 90 segundos.

> "Se eu abrir e tiver um campo em branco, eu vou fechar." — Mari

---

## Fluxo Principal

```
[Acessa /onboarding]
        │
        ▼
[Pergunta 1: Qual o seu squad?]
        │ resposta
        ▼
[Pergunta 2: Que tipo de funcionalidade você trabalha?]
        │ resposta (chips de seleção)
        ▼
[Pergunta 3: Qual é a sua maior dor hoje?]
        │ resposta (campo livre)
        ▼
[POST /api/session/start]
        │ 201 Created + welcomeMessage (stream)
        ▼
[Exibe boas-vindas personalizada]
        │
        ▼
[Redireciona para /chat com sessionId]
```

---

## Perguntas do Onboarding

### Pergunta 1 — Squad
- **Tipo:** Input de texto livre
- **Label:** "Em qual squad ou área você atua?"
- **Placeholder:** "ex: Credit Cards — Aquisição"
- **Validação:** Mínimo 1 caractere, máximo 200

### Pergunta 2 — Tipo de Funcionalidade
- **Tipo:** Seleção por chips (single select)
- **Label:** "Com que tipo de funcionalidade você trabalha mais?"
- **Opções:**

| Chip | Value |
|------|-------|
| 🧾 Fatura | `fatura` |
| 📦 Parcelamento | `parcelamento` |
| 🎁 Recompensas | `recompensa` |
| 📊 Limite | `limite` |
| 🔐 Tokenização | `tokenizacao` |
| 🎯 Aquisição | `aquisicao` |
| ➕ Outro | `outro` |

### Pergunta 3 — Dor Atual
- **Tipo:** Textarea
- **Label:** "Qual é o maior desafio que você está enfrentando agora?"
- **Placeholder:** "ex: Preciso escrever uma user story para o novo fluxo de limite emergencial e não sei quais critérios de compliance incluir."
- **Validação:** Mínimo 1 caractere, máximo 1000

---

## Comportamento da Mensagem de Boas-Vindas

A mensagem de boas-vindas deve ser gerada pela LLM usando o prompt de onboarding e deve:

1. **Reconhecer o contexto** — mencionar o squad e tipo de funcionalidade
2. **Nomear a dor** — repetir (com suas palavras) a dor relatada, sinalizando que entendeu
3. **Oferecer o primeiro passo** — sugerir uma ação concreta (ex: "Posso te ajudar a escrever essa user story agora. Me conta mais sobre o fluxo.")
4. **Duração:** máximo 3 parágrafos curtos

**Exemplo de output esperado:**
```
Olá! Sou o AI Project Mentor — estou aqui para te apoiar no dia a dia de produto em cartões.

Vi que você está no squad de Aquisição e trabalha principalmente com parcelamento. Entendo o desafio: 
montar critérios de aceite de compliance sem saber exatamente quais resoluções do BCB se aplicam 
ao seu contexto pode ser paralisante.

Vamos resolver isso juntos. Me conta: qual funcionalidade você precisa detalhar agora? Assim já 
começo a construir a User Story com os critérios certos para o seu squad.
```

---

## Estados da UI

| Estado | O que o PM vê |
|--------|---------------|
| `idle` | Pergunta atual com input vazio |
| `answered` | Input preenchido, botão "Próxima" ativo |
| `loading` | Spinner, "Preparando seu mentor..." |
| `streaming` | Mensagem de boas-vindas aparecendo em stream |
| `complete` | Mensagem completa + botão "Começar" |
| `error` | Mensagem de erro + botão "Tentar novamente" |

---

## Regras de Negócio

- **RN-01:** As 3 perguntas são exibidas **uma por vez** (wizard step). Nunca todas ao mesmo tempo.
- **RN-02:** O PM pode **voltar** para a pergunta anterior sem perder as respostas.
- **RN-03:** O botão de avançar só fica ativo após o campo ser preenchido (validação em tempo real).
- **RN-04:** O contexto capturado persiste na `Session` e é injetado em **todos** os prompts subsequentes.
- **RN-05:** Se o PM fechar o browser antes de completar o onboarding, a sessão é descartada e o onboarding recomeça do zero.
- **RN-06:** A mensagem de boas-vindas deve aparecer em **streaming** — não esperar o texto completo.
- **RN-07:** O tempo total do fluxo (3 perguntas + boas-vindas) deve ser **< 90 segundos** para o PM que responde com fluidez.

---

## Componentes de UI

```
OnboardingWizard
├── ProgressDots (step 1/3, 2/3, 3/3)
├── ContextQuestion
│   ├── QuestionLabel
│   ├── TextInput | ChipSelector | Textarea
│   └── NavigationButtons (Voltar / Próxima)
└── WelcomeMessage
    ├── StreamingText
    └── StartButton ("Começar a trabalhar")
```

### ChipSelector
- Chips renderizados em grid 2 colunas no mobile, 3–4 no desktop
- Estado: `unselected` | `selected` | `disabled`
- Apenas 1 chip selecionado por vez (single select)
- Ao selecionar, o botão "Próxima" fica imediatamente ativo

---

## Prompt Template

```typescript
// lib/prompts/onboarding.prompt.ts

export function buildOnboardingPrompt(context: SessionContext): string {
  return `
Você é o AI Project Mentor — um mentor sênior de produto especializado em instituições financeiras 
e produtos de cartão de crédito no Brasil, com profundo conhecimento das regulações do Banco Central.

Contexto do PM:
- Squad: ${context.squad}
- Tipo de funcionalidade principal: ${context.functionalityType}
- Dor atual: ${context.currentPain}

Escreva uma mensagem de boas-vindas personalizada que:
1. Reconheça o contexto do PM de forma específica (mencione o squad e tipo de funcionalidade)
2. Demonstre que entendeu a dor relatada (parafrase com suas palavras, não repita literalmente)
3. Ofereça um próximo passo concreto e imediato

Regras de formato:
- Máximo 3 parágrafos curtos
- Tom: direto, confiante e acolhedor — como um colega sênior, não um bot corporativo
- Não use emojis
- Não use bullet points
- Termine com uma pergunta que abra espaço para o PM detalhar o que precisa

Responda apenas com a mensagem de boas-vindas, sem explicações adicionais.
`.trim()
}
```

---

## Interface TypeScript dos Componentes

```typescript
// components/onboarding/OnboardingWizard.tsx

type OnboardingWizardProps = {
  onComplete: (context: SessionContext) => void
}

// components/onboarding/ContextQuestion.tsx

type ContextQuestionProps = {
  step: 1 | 2 | 3
  question: string
  type: 'text' | 'chips' | 'textarea'
  chipOptions?: ChipOption[]
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack?: () => void
  isNextDisabled: boolean
}

type ChipOption = {
  label: string
  value: FunctionalityType
  icon: string
}
```
