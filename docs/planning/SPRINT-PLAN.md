# SPRINT-PLAN.md — Plano de Sprints do MVP

> Sprints de 2 semanas. Cada tarefa tem estimativa em pontos (1pt ≈ meio dia de trabalho).
> Objetivo: Alpha funcional em 10 semanas (5 sprints).

---

## Sprint 0 — Fundação (Semanas 1–2)

**Objetivo:** Repositório pronto, banco criado, LLM respondendo. Nenhuma UI ainda.

### Setup
- [ ] **[2pt]** Criar repositório Next.js 14 com TypeScript strict + Tailwind + shadcn/ui
- [ ] **[1pt]** Configurar ESLint + Prettier + Husky (pre-commit)
- [ ] **[1pt]** Configurar variáveis de ambiente (`.env.local` + `.env.example`)
- [ ] **[1pt]** Deploy inicial na Vercel (pipeline CI/CD via GitHub Actions)

### Banco de Dados
- [ ] **[2pt]** Criar projeto no Supabase + configurar `DATABASE_URL`
- [ ] **[2pt]** Escrever `prisma/schema.prisma` com as 4 tabelas (Session, Message, UserStory, Feedback)
- [ ] **[1pt]** Rodar `prisma db push` e validar tabelas no dashboard Supabase
- [ ] **[1pt]** Criar seed script com 1 sessão de exemplo para desenvolvimento

### LLM
- [ ] **[2pt]** Criar `lib/llm/client.ts` — wrapper do Google Gen AI SDK com tratamento de timeout e retry
- [ ] **[1pt]** Criar `scripts/test-prompt.ts` — script local de teste de prompts
- [ ] **[2pt]** Implementar `lib/prompts/onboarding.prompt.ts` + testar com 5 inputs

### Playbook
- [ ] **[2pt]** Criar `lib/playbook/bcb-rules.md` com as 6 regras do `LINTER-RULES.md`
- [ ] **[1pt]** Criar `lib/playbook/loader.ts` que filtra regras por `functionalityType`

**Critério de conclusão:** `POST` manual para Gemini API via script retorna resposta de onboarding coerente para 3 inputs diferentes.

---

## Sprint 1 — F3 Feedback + API Base (Semanas 3–4)

**Objetivo:** API de sessão e feedback funcionando. F3 (a mais simples) completa.
Razão: F3 é P0 e desbloqueia a métrica principal. É também a que tem menos risco técnico.

### API
- [ ] **[3pt]** `POST /api/session/start` — valida com Zod, insere Session no banco, chama LLM, retorna stream SSE
- [ ] **[2pt]** `GET /api/session/:id/history` — retorna histórico completo com feedbacks e stories
- [ ] **[2pt]** `POST /api/feedback` — valida, insere Feedback, dispara refinamento se `vote=down`
- [ ] **[1pt]** Middleware de erro global — converte erros em formato `{ error: { code, message } }`

### Tipos e Schemas
- [ ] **[1pt]** Criar `types/index.ts` espelhando `DATA-MODELS.md`
- [ ] **[1pt]** Criar `lib/validators/schemas.ts` com todos os schemas Zod

### Componentes Base (UI)
- [ ] **[2pt]** `StreamingText` — renderiza SSE progressivamente com cursor piscando
- [ ] **[1pt]** `LoadingSpinner` — com prop `label`
- [ ] **[1pt]** `ErrorMessage` — mapeamento de ErrorCode → mensagem amigável
- [ ] **[1pt]** `CopyButton` — copia texto + feedback visual "Copiado!"
- [ ] **[1pt]** `Badge` — variantes de categoria e semáforo

### F3 — Feedback
- [ ] **[2pt]** `FeedbackBar` — thumbs up/down com estado idle/active/chips_visible
- [ ] **[2pt]** `ReasonChips` — 4 chips, seleção única, loading após click
- [ ] **[2pt]** Integração: FeedbackBar → POST /api/feedback → loading → refinamento em stream
- [ ] **[1pt]** Limite de 3 refinamentos por mensagem (UI + API)

**Critério de conclusão:** Conseguir dar thumbs down em uma resposta mockada, selecionar chip, e ver refinamento em stream. Feedback salvo no banco.

---

## Sprint 2 — F1 Onboarding (Semanas 5–6)

**Objetivo:** PM consegue fazer o onboarding completo e chegar no chat com sessionId.

### Rota de Onboarding
- [ ] **[2pt]** `app/onboarding/page.tsx` — estrutura da página
- [ ] **[2pt]** `OnboardingWizard` — state machine com Zustand (STEP_1 → STEP_2 → STEP_3 → SUBMITTING → STREAMING → COMPLETE)
- [ ] **[2pt]** `ContextQuestion` — componente de pergunta com suporte a text/chips/textarea
- [ ] **[2pt]** `ChipSelector` — grid responsivo, single select, estado visual
- [ ] **[1pt]** `ProgressDots` — indicador de passo atual
- [ ] **[2pt]** Integração: STEP_3 → POST /api/session/start → SSE → WelcomeMessage

### Guards e Redirects
- [ ] **[1pt]** `middleware.ts` — redireciona /chat sem sessionId → /onboarding
- [ ] **[1pt]** `middleware.ts` — redireciona /onboarding com sessionId → /chat
- [ ] **[1pt]** Persistência do sessionId em cookie httpOnly após onboarding

### Acessibilidade
- [ ] **[1pt]** `role="radiogroup"` + `role="radio"` nos chips
- [ ] **[1pt]** `aria-live` no indicador de progresso e no streaming de boas-vindas
- [ ] **[1pt]** `scrollIntoView` no mobile ao focar inputs

### Testes
- [ ] **[2pt]** Testes de unidade: `POST /api/session/start` (4 cenários de `TESTS.md`)
- [ ] **[1pt]** Teste E2E básico: fluxo feliz completo (Playwright)

**Critério de conclusão:** PM abre /onboarding, responde 3 perguntas, vê boas-vindas em stream, clica "Começar" e chega em /chat com sessionId no cookie.

---

## Sprint 3 — F2 User Story + Linter (Semanas 7–8)

**Objetivo:** PM descreve funcionalidade, recebe User Story e resultado do linter.

### API
- [ ] **[3pt]** `POST /api/story/generate` — stream da User Story + insere no banco + dispara lint assíncrono
- [ ] **[3pt]** `POST /api/story/lint` — chama LLM com linter prompt, parseia JSON, aplica cap de 2 reds, salva
- [ ] **[2pt]** `POST /api/chat/message` — mensagem conversacional com contexto da sessão

### Prompts
- [ ] **[2pt]** `lib/prompts/story.prompt.ts` — implementar `buildStoryPrompt` com contexto regulatório por tipo
- [ ] **[2pt]** `lib/prompts/linter.prompt.ts` — implementar `buildLinterPrompt` com playbook injetado
- [ ] **[1pt]** `lib/parsers/story.parser.ts` — parser do output da LLM para `UserStory`
- [ ] **[1pt]** `lib/parsers/lint.parser.ts` — parser de JSON + cap de 2 reds + fail safe

### UI — Chat
- [ ] **[3pt]** `app/chat/page.tsx` + `ChatWindow` — lista de mensagens com auto-scroll
- [ ] **[2pt]** `MessageBubble` — renderiza mensagem do PM vs mentor com estilos diferentes
- [ ] **[2pt]** `InputBar` — textarea + botão enviar + atalho Cmd/Ctrl+Enter
- [ ] **[2pt]** `StoryBlock` — renderiza User Story formatada (Como/Quero/Para que + critérios)
- [ ] **[1pt]** Badge de categoria por critério de aceite (compliance/functional/ux/performance)
- [ ] **[1pt]** Botão "Copiar" na StoryBlock

### UI — Linter
- [ ] **[3pt]** `LinterPanel` — painel lateral/abaixo com estados: idle/pending/complete/error
- [ ] **[2pt]** `RiskItem` — card expansível com nível, título, normativo, sugestão
- [ ] **[1pt]** `GreenSummary` — contador de itens ok
- [ ] **[1pt]** Polling do resultado do linter (a cada 2s até completar, max 30s)

### Testes
- [ ] **[2pt]** Testes de unidade: `POST /api/story/generate` e `POST /api/story/lint`
- [ ] **[1pt]** Teste: cap de 2 riscos vermelhos funciona com 4+ reds no output da LLM

**Critério de conclusão:** PM digita descrição de funcionalidade de parcelamento, recebe User Story com critério de CET, e vê linter apontando risco RED de CET ausente nos critérios (ou GREEN se o critério já estiver lá).

---

## Sprint 4 — Integração, Polimento e Hardening (Semanas 9–10)

**Objetivo:** Produto integralmente funcional, estável e pronto para o Alpha.

### Integração End-to-End
- [ ] **[2pt]** Testar fluxo completo: onboarding → chat → gerar story → ver linter → dar thumbs down → ver refinamento
- [ ] **[1pt]** Verificar que contexto do onboarding está presente em TODOS os prompts da sessão
- [ ] **[1pt]** Verificar que feedbacks estão sendo salvos corretamente no banco

### Performance
- [ ] **[2pt]** Medir latência P95 de `/api/story/generate` com carga simulada — garantir < 8s
- [ ] **[2pt]** Medir latência P95 de `/api/story/lint` — garantir < 15s
- [ ] **[1pt]** Adicionar timeout explícito de 30s no wrapper da LLM + retorno de erro gracioso

### Segurança
- [ ] **[1pt]** Sanitizar inputs antes de injetar em prompts (evitar prompt injection)
- [ ] **[1pt]** Validar que sessionId no cookie corresponde ao sessionId no body (evitar IDOR)
- [ ] **[1pt]** Headers de segurança no Next.js (`X-Content-Type-Options`, `X-Frame-Options`)

### Observabilidade
- [ ] **[1pt]** Logar todos os erros `LLM_UNAVAILABLE` com timestamp e payload (sem dados sensíveis)
- [ ] **[1pt]** Logar latência de cada chamada à LLM (para monitorar P95)
- [ ] **[1pt]** Dashboard Supabase: view com contagem de feedbacks por chip por dia

### Polimento de UI
- [ ] **[1pt]** Responsividade mobile em todas as telas (testar em 375px, 390px, 768px)
- [ ] **[1pt]** Empty states: chat sem mensagens, linter sem riscos
- [ ] **[1pt]** Estados de loading e erro em todos os fluxos (nenhum spinner infinito sem timeout)
- [ ] **[1pt]** Favicon + meta tags básicas (título, description)

### Preparação para Alpha
- [ ] **[2pt]** Lista de 10 PMs convidados para o Alpha + processo de onboarding (email de convite)
- [ ] **[1pt]** Criar sessão de observação (PM usa o produto ao vivo com o time assistindo)
- [ ] **[1pt]** Definir processo de coleta de feedback qualitativo (NPS survey simples)

**Critério de conclusão (Go/No-Go para Alpha):**
- [ ] Fluxo completo roda sem erro em 3 sessões de teste consecutivas
- [ ] Latência P95 story < 8s validada
- [ ] 0 erros 500 em 50 requests de teste
- [ ] Produto acessível por URL pública sem instalação de nada

---

## Backlog Pós-MVP (não entra no Alpha)

| Feature | Estimativa | Dependência |
|---------|-----------|-------------|
| Auth completo (Supabase Auth) | 1 sprint | MVP estável |
| Painel de métricas interno (feedbacks por dia, taxa de aceitação) | 1 sprint | Dados de Alpha |
| Modo Aprendiz vs Especialista | 2 sprints | Dados de progressão |
| Monitoramento de Regulatory Drift | 2 sprints | Playbook maduro |
| Painel de Saúde do Playbook (semáforo) | 1 sprint | Processo de curadoria |
| Plugin para Confluence (se TI aprovar) | 3 sprints | v1 estável |
| Análise multimodal de wireframes | 3 sprints | v2 |
