# SETUP.md — Guia de Setup do Projeto

> Leia isto antes de qualquer outra coisa.
> Tempo estimado para ter o projeto rodando localmente: 30 minutos.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Verificar |
|------------|---------------|-----------|
| Node.js | 20.x | `node --version` |
| npm | 10.x | `npm --version` |
| Git | 2.x | `git --version` |
| Conta Google Gemini | API key ativa | console.Google Gemini.com |
| Conta Supabase | Projeto criado | supabase.com |

---

## 1. Clonar e instalar

```bash
git clone https://github.com/seu-org/ai-project-mentor.git
cd ai-project-mentor
npm install
```

---

## 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com seus valores:

```bash
# Google Gemini — obter em console.Google Gemini.com/settings/api-keys
Google Gemini_API_KEY=AIzaSyapi03-...

# Supabase — obter em Settings > Database > Connection string
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Feature flags (manter true para desenvolvimento)
ENABLE_LINT=true
ENABLE_STREAMING=true
LINT_MAX_RED_RISKS=2
LLM_TIMEOUT_MS=30000
```

> **Nunca commite `.env.local`.** Ele já está no `.gitignore`.

---

## 3. Configurar o banco de dados

```bash
# Gera o Prisma Client baseado no schema
npx prisma generate

# Cria as tabelas no Supabase
npx prisma db push

# (Opcional) Abre o Prisma Studio para visualizar os dados
npx prisma studio
```

Verifique no dashboard do Supabase que as 4 tabelas foram criadas:
- `Session`
- `Message`
- `UserStory`
- `Feedback`

---

## 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

O fluxo normal começa em `/onboarding`.

---

## 5. Testar um prompt isolado

Antes de rodar o servidor, você pode testar qualquer prompt diretamente:

```bash
# Testar o prompt de onboarding
npx ts-node scripts/test-prompt.ts --prompt onboarding \
  --context '{"squad":"Credit Cards — Aquisição","functionalityType":"parcelamento","currentPain":"não sei quais critérios de compliance usar na user story"}'

# Testar o linter com uma story mockada
npx ts-node scripts/test-prompt.ts --prompt linter \
  --story '{"persona":"PM de aquisição","action":"criar fluxo de parcelamento","benefit":"usuário parcela sem sair do app","acceptanceCriteria":[{"id":"ac-1","description":"Exibir botão de parcelamento na tela de fatura","category":"functional"}]}' \
  --context '{"squad":"Credit Cards","functionalityType":"parcelamento","currentPain":"..."}'
```

---

## 6. Rodar os testes

```bash
# Todos os testes
npm test

# Apenas testes de API
npm test -- --testPathPattern=api

# Com coverage
npm test -- --coverage

# Watch mode (desenvolvimento)
npm test -- --watch
```

---

## 7. Verificar antes de fazer PR

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build de produção (garantir que não quebra)
npm run build
```

---

## Estrutura de branches

```
main          ← produção (deploy automático na Vercel)
  └── dev     ← integração (PRs vão para cá)
        └── feature/[nome-da-feature]
        └── fix/[nome-do-bug]
```

**Regras:**
- PRs direto para `main` são bloqueados
- PRs para `dev` precisam de 1 aprovação
- Todo PR deve ter: descrição do que muda + link para a spec correspondente

---

## Dicas de desenvolvimento

### Hot reload de prompts
Os prompts em `lib/prompts/` são importados em runtime — alterá-los requer apenas salvar o arquivo (sem restart do servidor em dev).

### Debugar streaming SSE
```bash
# Testar endpoint de stream diretamente no terminal
curl -X POST http://localhost:3000/api/session/start \
  -H "Content-Type: application/json" \
  -d '{"context":{"squad":"Credit Cards","functionalityType":"parcelamento","currentPain":"teste"}}' \
  --no-buffer
```

### Visualizar banco localmente
```bash
npx prisma studio
# Abre em http://localhost:5555
```

### Reset do banco (em dev)
```bash
# CUIDADO: apaga todos os dados
npx prisma db push --force-reset
npx ts-node prisma/seed.ts
```

---

## Problemas comuns

| Problema | Causa provável | Solução |
|----------|----------------|---------|
| `Error: Google Gemini_API_KEY is not set` | .env.local não configurado | Verificar passo 2 |
| `Error: Can't reach database server` | DATABASE_URL incorreta | Verificar connection string no Supabase |
| `PrismaClientInitializationError` | Prisma Client não gerado | Rodar `npx prisma generate` |
| Streaming não aparece no browser | ENABLE_STREAMING=false | Verificar .env.local |
| Linter retorna erro sempre | LLM_TIMEOUT_MS muito baixo | Aumentar para 30000 |
| `Module not found: lib/prompts/...` | Alias de path não configurado | Verificar `tsconfig.json` paths |

---

## Contatos

| Área | Responsável |
|------|-------------|
| Product / Spec | Owner do PRD |
| Infraestrutura | Tech Lead |
| LLM / Prompts | PM + Tech Lead |
| Compliance / Playbook | Time de Jurídico |
