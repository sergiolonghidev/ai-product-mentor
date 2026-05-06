# INFRA.md — Stack, Variáveis de Ambiente e Deploy

---

## Variáveis de Ambiente

```bash
# .env.local (nunca commitar)

# Google Gemini
Google Gemini_API_KEY=AIzaSy...

# Banco de dados (Supabase local rodando via CLI/Docker)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Integração Linear (Exportação de User Stories)
LINEAR_API_KEY=lin_api_...
LINEAR_TEAM_ID=...              # UUID do time Agrotec-fintech

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

## Deploy (Kubernetes Local)

```bash
# Aplicação empacotada via Docker e implantada em cluster Kubernetes local.
# O banco de dados (Supabase) também roda como serviços no mesmo cluster.

# Para build da imagem Docker
docker build -t ai-project-mentor .

# Para aplicar os manifestos no Kubernetes
kubectl apply -f k8s/
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
- **Kubernetes Logs** — monitoramento de saída dos pods (Next.js e Supabase)
- **Supabase Local Studio** — volume de feedbacks e sessões (http://localhost:54323)
- **Log manual** — todos os erros `LLM_UNAVAILABLE` são logados com timestamp

Pós-MVP: integrar Sentry para error tracking e Posthog para analytics de produto.
