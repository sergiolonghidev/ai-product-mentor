# FLOWS.md — F1: Estados e Fluxos do Onboarding

---

## Máquina de Estados da UI

```
                       ┌─────────────────────────────────────────────────┐
                       │                OnboardingWizard                  │
                       └─────────────────────────────────────────────────┘

  [INITIAL]
      │
      ▼
  ┌───────────────────────────────────────────────────────┐
  │  STEP_1 — squad                                        │
  │  input: string  |  valid: length > 0                   │
  └───────────────────────────────────────────────────────┘
      │ onNext (valid)
      ▼
  ┌───────────────────────────────────────────────────────┐
  │  STEP_2 — functionalityType                            │
  │  input: chip selection  |  valid: chip selecionado     │
  └───────────────────────────────────────────────────────┘
      │ onNext (valid)          │ onBack
      ▼                         └──► STEP_1
  ┌───────────────────────────────────────────────────────┐
  │  STEP_3 — currentPain                                  │
  │  input: textarea  |  valid: length > 0                 │
  └───────────────────────────────────────────────────────┘
      │ onNext (valid)          │ onBack
      ▼                         └──► STEP_2
  ┌───────────────────────────────────────────────────────┐
  │  SUBMITTING                                            │
  │  POST /api/session/start  |  mostra spinner            │
  └───────────────────────────────────────────────────────┘
      │ 201 Created                    │ erro (4xx/5xx/timeout)
      ▼                                ▼
  ┌───────────────────┐          ┌────────────────────────┐
  │  STREAMING        │          │  ERROR                  │
  │  welcomeMessage   │          │  mostra mensagem + retry│
  │  em SSE           │          └────────────┬───────────┘
  └────────┬──────────┘                       │ onRetry
           │ stream completo                  └──► SUBMITTING
           ▼
  ┌───────────────────┐
  │  COMPLETE         │
  │  botão "Começar"  │
  └────────┬──────────┘
           │ onClick
           ▼
      redirect /chat?sessionId=...
```

---

## Estado Zustand da Sessão

```typescript
// lib/store/session.store.ts

type OnboardingState = {
  step: 1 | 2 | 3
  answers: {
    squad: string
    functionalityType: FunctionalityType | null
    currentPain: string
  }
  status: 'idle' | 'submitting' | 'streaming' | 'complete' | 'error'
  errorCode: ErrorCode | null
  sessionId: string | null
  welcomeMessageId: string | null

  // Actions
  setStep: (step: 1 | 2 | 3) => void
  setAnswer: (field: keyof OnboardingState['answers'], value: string) => void
  submit: () => Promise<void>
  reset: () => void
}
```

---

## Fluxo de Dados — `POST /api/session/start`

```
Client                          API Route                     DB          LLM
  │                                 │                          │           │
  │── POST /api/session/start ──────►                          │           │
  │   { context: SessionContext }   │                          │           │
  │                                 │── validate (Zod) ───────►            │
  │                                 │                          │           │
  │                                 │── INSERT Session ────────►            │
  │                                 │◄── session.id ───────────│           │
  │                                 │                          │           │
  │                                 │── buildOnboardingPrompt()            │
  │                                 │── POST /v1/messages ─────────────────►
  │                                 │   stream: true           │           │
  │◄── 201 { session, streaming }───│                          │           │
  │                                 │                          │           │
  │◄── SSE chunk ───────────────────│◄── token ────────────────────────────│
  │◄── SSE chunk ───────────────────│◄── token ────────────────────────────│
  │◄── SSE message_complete ────────│◄── [DONE] ───────────────────────────│
  │                                 │── INSERT Message (welcome) ──────────►
  │                                 │                          │           │
  │◄── SSE done ────────────────────│                          │           │
```

---

## Tratamento de Erros — Fluxo de Retry

```
  SUBMITTING
      │
      │ timeout (>30s) ou status 5xx
      ▼
  ERROR
  ┌──────────────────────────────────────────────────────┐
  │  "O mentor está temporariamente indisponível."        │
  │  "Suas respostas foram preservadas."                  │
  │                                                       │
  │  [Tentar novamente]                                   │
  └──────────────────────────────────────────────────────┘
      │ onClick "Tentar novamente"
      ▼
  SUBMITTING  ← mesmo payload, sem pedir respostas de novo
```

**Importante:** As respostas das 3 perguntas ficam no estado Zustand durante o erro. O PM **não perde o que digitou**.

---

## Fluxo Mobile vs Desktop

### Desktop (≥ 768px)
```
┌─────────────────────────────────────┐
│                                     │
│   ProgressDots  (• ○ ○)             │
│                                     │
│   "Em qual squad você atua?"        │
│   ┌─────────────────────────────┐   │
│   │ Credit Cards — Aquisição    │   │
│   └─────────────────────────────┘   │
│                                     │
│                    [Próxima →]      │
│                                     │
└─────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌─────────────────────┐
│  • ○ ○              │
│                     │
│  Em qual squad      │
│  você atua?         │
│  ┌───────────────┐  │
│  │               │  │
│  └───────────────┘  │
│                     │
│  [    Próxima →   ] │
└─────────────────────┘
```

No mobile, o botão de navegação ocupa **100% da largura** (facilidade de toque) e o teclado virtual não deve cobrir o input (usar `scrollIntoView` ao focar).

---

## Acessibilidade

- Cada pergunta tem `<label>` explícito associado ao input via `htmlFor`
- Os chips de funcionalidade usam `role="radio"` e `role="radiogroup"`
- O progresso é anunciado via `aria-live="polite"`: "Passo 2 de 3"
- O spinner tem `aria-label="Carregando, aguarde"`
- O streaming de texto usa `aria-live="assertive"` para leitores de tela

---

## Redirects e Guards

```typescript
// middleware.ts (Next.js)

// Se o PM já tem um sessionId válido em cookie/localStorage,
// redirecionar direto para /chat — não passar pelo onboarding de novo.

// Se o PM acessa /chat sem sessionId, redirecionar para /onboarding.

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value

  if (request.nextUrl.pathname === '/onboarding' && sessionId) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  if (request.nextUrl.pathname === '/chat' && !sessionId) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }
}
```
