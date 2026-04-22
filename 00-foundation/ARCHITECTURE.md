# ARCHITECTURE.md — AI Project Mentor MVP

## Visão Geral

O AI Project Mentor é uma **web app standalone** (sem plugin, sem extensão) que expõe uma interface conversacional para PMs. O backend atua como orquestrador entre o cliente e a LLM, injetando contexto regulatório e regras de negócio em cada chamada.

---

## Princípios de Arquitetura

| Princípio | Decisão |
|-----------|---------|
| **Sem plugin** | Web app acessível via URL — nenhuma instalação de TI necessária |
| **Stateless no servidor** | Sessões gerenciadas no cliente (localStorage) + banco para persistência opcional |
| **LLM como orquestrador** | O servidor monta o prompt; o cliente nunca chama a LLM diretamente |
| **Contexto explícito** | Todo request à LLM carrega: squad, tipo de funcionalidade e histórico da sessão |
| **Feedback como dado** | Thumbs up/down grava no banco; alimenta dashboard interno |
| **Fail safe** | Se o linter falhar, a User Story ainda é entregue — sem bloquear o PM |

---

## Stack Tecnológica

### Frontend
```
Next.js 14 (App Router)
TypeScript (strict)
Tailwind CSS
shadcn/ui (componentes base)
Zustand (estado global de sessão)
```

### Backend
```
Next.js API Routes (same repo — monorepo simples)
TypeScript (strict)
Zod (validação de inputs)
```

### LLM & IA
```
Anthropic Claude API (claude-sonnet-4-5 ou superior)
Prompt templates em arquivos .ts separados (não hardcoded em handlers)
```

### Banco de Dados
```
Postgres (Supabase para MVP — zero ops)
Prisma ORM
Tabelas: Session, Message, Feedback, UserStory
```

### Infra
```
Vercel (deploy do Next.js)
Supabase (Postgres + Auth)
```

---

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                   BROWSER (PM)                       │
│                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  Onboarding │  │  Chat / Linter│  │  Feedback  │  │
│  │  Flow (F1)  │  │  Editor (F2)  │  │  Widget(F3)│  │
│  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘  │
│         │                │                │          │
└─────────┼────────────────┼────────────────┼──────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────┐
│              NEXT.JS API ROUTES (BFF)                │
│                                                       │
│  POST /api/session/start                              │
│  POST /api/chat/message          ← orquestrador LLM  │
│  POST /api/story/generate        ← gera User Story   │
│  POST /api/story/lint            ← linter compliance  │
│  POST /api/feedback              ← salva feedback     │
│  GET  /api/session/:id/history   ← histórico          │
└──────────────────────────┬──────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
   ┌───────────────┐ ┌──────────┐ ┌──────────────┐
   │  Anthropic    │ │ Postgres │ │  Playbook    │
   │  Claude API   │ │(Supabase)│ │  (JSON/MD    │
   │               │ │          │ │   no repo)   │
   └───────────────┘ └──────────┘ └──────────────┘
```

---

## Estrutura de Pastas do Projeto (código)

```
ai-project-mentor/
│
├── app/                          ← Next.js App Router
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── onboarding/
│   │   └── page.tsx              ← F1
│   ├── chat/
│   │   └── page.tsx              ← F2 + F3 (sessão principal)
│   └── layout.tsx
│
├── components/
│   ├── onboarding/
│   │   ├── OnboardingWizard.tsx
│   │   └── ContextQuestion.tsx
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   └── InputBar.tsx
│   ├── story/
│   │   ├── StoryEditor.tsx
│   │   ├── LinterPanel.tsx
│   │   └── RiskBadge.tsx
│   └── feedback/
│       ├── FeedbackBar.tsx
│       └── ReasonChips.tsx
│
├── lib/
│   ├── prompts/                  ← templates de prompt (não hardcoded)
│   │   ├── onboarding.prompt.ts
│   │   ├── story.prompt.ts
│   │   └── linter.prompt.ts
│   ├── playbook/                 ← base de conhecimento regulatória
│   │   ├── bcb-rules.md
│   │   └── loader.ts
│   ├── llm/
│   │   └── client.ts             ← wrapper do Anthropic SDK
│   └── validators/
│       └── schemas.ts            ← schemas Zod reutilizáveis
│
├── app/api/                      ← API Routes
│   ├── session/
│   │   └── start/route.ts
│   ├── chat/
│   │   └── message/route.ts
│   ├── story/
│   │   ├── generate/route.ts
│   │   └── lint/route.ts
│   └── feedback/
│       └── route.ts
│
├── prisma/
│   └── schema.prisma
│
├── specs/                        ← este repositório de specs
│
└── types/
    └── index.ts                  ← tipos globais exportados
```

---

## Decisões Arquiteturais Chave (ADRs)

### ADR-001: Monorepo Next.js (frontend + backend juntos)
**Decisão:** Frontend e API routes no mesmo repositório Next.js.
**Motivo:** Reduz complexidade de deploy para o MVP; um único `vercel deploy` sobe tudo.
**Trade-off:** Quando o produto escalar, o backend pode ser extraído para um serviço separado.

### ADR-002: Playbook como arquivos Markdown no repositório
**Decisão:** As regras regulatórias ficam em arquivos `.md` em `lib/playbook/`, não em banco.
**Motivo:** Permite versionamento via Git, diff fácil de mudanças normativas e deploy imediato.
**Trade-off:** Requer deploy para atualizar regras. Para o MVP, aceitável. Pós-MVP migrar para CMS.

### ADR-003: Streaming de respostas da LLM
**Decisão:** Respostas da LLM são streamed (Server-Sent Events) para o cliente.
**Motivo:** Reduz percepção de latência — PM vê a resposta sendo construída em tempo real.
**Implementação:** `ReadableStream` na API Route + `useChat` hook no frontend.

### ADR-004: Linter é assíncrono em relação ao gerador
**Decisão:** `POST /api/story/generate` e `POST /api/story/lint` são chamadas separadas.
**Motivo:** O PM recebe a User Story imediatamente; o linter roda em paralelo e atualiza a UI.
**Motivo adicional:** Se o linter falhar, a User Story não é perdida (fail safe).

### ADR-005: Feedback salvo sem autenticação no MVP Alpha
**Decisão:** No Alpha, feedback é salvo com `session_id` anônimo. Auth completo só no Beta.
**Motivo:** Reduz fricção de onboarding no Alpha; simplifica stack inicial.
**Trade-off:** Dados de feedback no Alpha são menos rastreáveis por usuário.
