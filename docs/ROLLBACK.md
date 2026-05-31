# Rollback Runbook — ProdPilot AI

## Ponto de restauração estável: `v1.0.0-mvp`

| Artefato | Referência |
|---|---|
| Git tag | `v1.0.0-mvp` (SHA: 244b50c) |
| Imagem Docker | `harbor.lab/library/aipm:v1.0.0-mvp` |
| Backup de dados | `backups/aipm-20260530-*/` (Session/Message/UserStory/Feedback) |

---

## Cenário 1 — Rollback da aplicação (sem mudança de banco)

Usar quando: bug de UI, erro de build, comportamento inesperado não relacionado ao schema.

```bash
./scripts/rollback.sh v1.0.0-mvp
```

Ou manualmente:
```bash
kubectl set image deployment/aipm aipm=harbor.lab/library/aipm:v1.0.0-mvp -n aipm
kubectl rollout status deployment/aipm -n aipm
```

**Tempo estimado:** 30–60 segundos.

---

## Cenário 2 — Rollback com reversão de migração de banco

Usar quando: uma migração V2 foi aplicada e precisa ser revertida.

### Passo 1: Rollback da aplicação

```bash
./scripts/rollback.sh v1.0.0-mvp
```

### Passo 2: Identificar qual migração reverter

Cada migração V2 tem um arquivo down correspondente em `supabase/migrations/`.
Convenção: `YYYYMMDDHHMMSS_nome.down.sql`.

### Passo 3: Executar down migration via Supabase REST

```bash
# Port-forward para acessar supabase kong
kubectl port-forward -n supabase svc/supabase-kong 18000:8000 &

TOKEN=$(kubectl get secret aipm-secrets -n aipm \
  -o jsonpath='{.data.SUPABASE_SERVICE_ROLE_KEY}' | base64 -d)

# Executar SQL de rollback
curl -s -X POST http://localhost:18000/rest/v1/rpc/exec_sql \
  -H "Authorization: Bearer $TOKEN" \
  -H "apikey: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "DROP TABLE IF EXISTS \"PRD\";"}'
```

> **Nota:** Para migrações mais complexas, use o Supabase Studio em `studio.mvvalvulas.com.br`.

---

## Cenário 3 — Restauração completa de dados (último recurso)

Usar quando: dados foram corrompidos ou deletados incorretamente.

### Passo 1: Localizar backup mais recente

```bash
ls -lt backups/
# Usar o diretório mais recente anterior ao incidente
```

### Passo 2: Restaurar via API

```bash
kubectl port-forward -n supabase svc/supabase-kong 18000:8000 &

TOKEN=$(kubectl get secret aipm-secrets -n aipm \
  -o jsonpath='{.data.SUPABASE_SERVICE_ROLE_KEY}' | base64 -d)

# Exemplo para Session
BACKUP_FILE="backups/aipm-20260530-120000/Session.json"

curl -s -X POST http://localhost:18000/rest/v1/Session \
  -H "Authorization: Bearer $TOKEN" \
  -H "apikey: $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d "@$BACKUP_FILE"
```

Repetir para: `Message`, `UserStory`, `Feedback` (nessa ordem por causa das foreign keys).

---

## Política para migrações V2

Toda migration nova em `supabase/migrations/` **deve ter** um arquivo `.down.sql` correspondente.

**Exemplo:**
```
supabase/migrations/
  20260601000000_add_prd_table.sql        # up
  20260601000000_add_prd_table.down.sql   # down → DROP TABLE "PRD"
```

Migrations que só ADICIONAM colunas nullable ou tabelas novas: **rollback seguro** (não perde dados das tabelas existentes).

Migrations que ALTERAM ou REMOVEM colunas: **fazer backup antes de aplicar**.

---

## Como criar backup antes de cada migration

```bash
./scripts/backup-db.sh
```

---

## Verificar estado atual

```bash
# Imagem rodando
kubectl get deployment aipm -n aipm -o jsonpath='{.spec.template.spec.containers[0].image}'

# Logs recentes
kubectl logs -n aipm -l app=aipm --tail=30

# Status dos pods
kubectl get pods -n aipm
```
