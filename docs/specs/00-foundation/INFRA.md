# INFRA.md — Stack, Variáveis de Ambiente e Deploy

---

## Variáveis de Ambiente

```bash
# .env.local (nunca commitar)

# Google Gemini
Google Gemini_API_KEY=AIzaSy...

# Banco de dados (Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...     # para migrações Prisma

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Feature flags (MVP Alpha)
ENABLE_LINT=true                # false desabilita o linter sem quebrar a story
ENABLE_STREAMING=true
LINT_MAX_RED_RISKS=2            # máximo de riscos críticos exibidos
LLM_TIMEOUT_MS=30000            # timeout para chamadas à LLM
```

---

## Setup Local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar banco
npx prisma generate
npx prisma db push              # cria tabelas no Supabase

# 3. Rodar em dev
npm run dev
```

---

## Deploy (Vercel)

```bash
# Deploy automático via GitHub Actions em push para main
# Variáveis de ambiente configuradas no dashboard Vercel

vercel --prod                   # deploy manual se necessário
```

---

## Limites e Configurações da LLM

| Parâmetro | Valor MVP | Motivo |
|-----------|-----------|--------|
| Model | `gemini-1.5-pro` | Custo/performance balanceado |
| Max tokens output | 1500 | Evita respostas longas demais |
| Temperature | 0.3 | Respostas mais consistentes (compliance) |
| Timeout | 30s | Acima disso, retorna erro gracioso |
| Streaming | Sim | Reduz latência percebida |

---

## Monitoramento MVP

Para o Alpha, monitoramento mínimo via:
- **Vercel Analytics** — tempo de resposta das API Routes
- **Supabase Dashboard** — volume de feedbacks e sessões
- **Log manual** — todos os erros `LLM_UNAVAILABLE` são logados com timestamp

Pós-MVP: integrar Sentry para error tracking e Posthog para analytics de produto.
