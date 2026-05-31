# SPEC-08 — PRD Generation (EC-01)
**ProdPilot AI · V2**
`Corresponde a: CA#1, CA#2, CA#3, CA#4, CA#5`

---

## Objetivo

Adicionar o Job "Escrever PRD" ao ProdPilot AI.
Input: descrição de funcionalidade ou ata de reunião.
Output: PRD estruturado com seções obrigatórias, restrições regulatórias destacadas,
tom de discovery, editável inline, gerado em ≤30s.

---

## Fluxo

```
Job Picker → "Escrever PRD"
    ↓
/prd/onboarding (contexto simplificado)
    ↓
/prd/editor (geração + edição inline)
    ↓
[Opcional] Exportar para Linear como épico de discovery
```

---

## Onboarding de PRD (`/prd/onboarding`)

Contexto mínimo para gerar o PRD (1 tela, não wizard multi-step):
- **Produto/Squad**: text input (reaproveitado do onboarding atual se houver sessão ativa)
- **Descrição ou ata**: textarea longa (400–2000 palavras ou descrição curta)
- **Fase**: select (`discovery` | `ready_to_build` | `post_launch`)

A fase instrui o tom do PRD (CA#3):
- `discovery` → linguagem "hipótese a validar", "a investigar", grau de certeza baixo
- `ready_to_build` → tom mais assertivo, critérios mais fechados
- `post_launch` → tom analítico, métricas como referência

---

## Estrutura do PRD gerado (CA#1)

O LLM retorna JSON com as seguintes seções obrigatórias:

```typescript
type PRD = {
  id: string
  sessionId?: string
  createdAt: Date

  // Metadados
  title: string
  phase: 'discovery' | 'ready_to_build' | 'post_launch'
  squad: string

  // Seções obrigatórias
  context: string                   // Contexto e motivação
  problem: string                   // Problema central
  impactedUsers: string             // Usuários impactados
  solution: string                  // Solução proposta
  acceptanceCriteria: PRDCriterion[]
  regulatoryRestrictions: RegulatoryRestriction[]  // (CA#2) seção própria
  metrics: string                   // Métricas de sucesso
  dependencies: string              // Dependências técnicas e de negócio
  risks: string                     // Riscos e incertezas

  // Estado de edição
  editedAt?: Date
  linearExportUrl?: string
}

type PRDCriterion = {
  id: string
  description: string
  category: 'functional' | 'compliance' | 'ux' | 'performance'
}

type RegulatoryRestriction = {
  id: string
  normative: string     // ex: "Resolução BCB nº 96/2021"
  requirement: string   // o que é exigido
  impact: string        // impacto na feature
  level: 'blocker' | 'attention' | 'info'
}
```

### Regras regulatórias destacadas (CA#2)

`regulatoryRestrictions` é uma seção SEPARADA do JSON — nunca embutida como texto
dentro de `solution` ou `context`. O editor exibe essa seção em card destacado
(cor âmbar/laranja) no topo do PRD, antes dos critérios de aceite.

---

## Editor de PRD (`/prd/editor`)

### Geração

- `POST /api/prd/generate` (SSE streaming como o story generate)
- Meta de latência: ≤30s para input de 400–600 palavras (CA#5)
- Usar `gemini-2.5-flash` com `thinkingBudget: 0` para velocidade

### Edição inline (CA#4)

Cada seção do PRD é editável em campo separado:
- Click em qualquer seção → textarea inline (substituindo o texto)
- Botão "Salvar seção" por seção (não necessita salvar tudo de uma vez)
- Ou botão "Salvar PRD" global para persistir todas as mudanças

`PATCH /api/prd/:id` aceita qualquer subset de campos.

### Exibição das restrições regulatórias (CA#2)

Card destacado no topo do editor com título "Restrições Regulatórias".
Cada `RegulatoryRestriction` exibe:
- Badge de level (🔴 Bloqueante / 🟡 Atenção / ℹ️ Info)
- Normativo referenciado
- Impacto na feature
- Campo editável inline

Se `regulatoryRestrictions` estiver vazia → exibir nota: "Nenhuma restrição regulatória
identificada. Revise manualmente antes de compartilhar."

### Tom de discovery (CA#3)

Prompt instrui explicitamente o modelo a usar linguagem de incerteza quando `phase === 'discovery'`:
- "hipótese a validar"
- "a ser investigado"
- "estimativa inicial"
- Proibido: "iremos implementar", "será entregue", "o sistema deve"

---

## API

### `POST /api/prd/generate`

```typescript
// Request
{
  squad: string
  phase: 'discovery' | 'ready_to_build' | 'post_launch'
  input: string          // descrição ou ata (min 10, max 4000 chars)
  sessionId?: string     // se o PM já tem sessão ativa, reusar contexto
}

// Response: SSE stream
// event: chunk        → { text: string }
// event: prd_complete → { prdId: string; prd: PRD }
// event: done         → {}
// event: error        → { code: string }
```

### `PATCH /api/prd/:id`

```typescript
// Request (qualquer subset)
{
  sessionId?: string
  title?: string
  context?: string
  problem?: string
  impactedUsers?: string
  solution?: string
  acceptanceCriteria?: PRDCriterion[]
  regulatoryRestrictions?: RegulatoryRestriction[]
  metrics?: string
  dependencies?: string
  risks?: string
}

// Response 200
{ prd: PRD }
```

---

## Prompt de PRD (`src/lib/prompts/prd.prompt.ts`)

Construído com:
- Contexto de squad e fase
- Input do PM
- Playbook regulatório (bcb-rules.md) injetado
- Instrução de tom por fase
- Schema JSON de output obrigatório

Retorna JSON puro (sem markdown fences).

---

## Schema Supabase

```sql
CREATE TABLE "PRD" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "editedAt" TIMESTAMP WITH TIME ZONE,
  "sessionId" UUID REFERENCES "Session"("id") ON DELETE SET NULL,
  "squad" TEXT NOT NULL,
  "phase" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "context" TEXT NOT NULL,
  "problem" TEXT NOT NULL,
  "impactedUsers" TEXT NOT NULL,
  "solution" TEXT NOT NULL,
  "criteria" JSONB NOT NULL,
  "regulatoryRestrictions" JSONB NOT NULL DEFAULT '[]',
  "metrics" TEXT NOT NULL,
  "dependencies" TEXT NOT NULL,
  "risks" TEXT NOT NULL,
  "linearExportUrl" TEXT
);
```

---

## Critérios de aceite

- [ ] (CA#1) PRD gerado inclui todas as 9 seções obrigatórias
- [ ] (CA#1) Nenhuma seção pode ser vazia (verificação no parse)
- [ ] (CA#2) Restrições regulatórias em card destacado, separado do corpo
- [ ] (CA#2) Se restrição existe → nunca embutida como texto simples em outra seção
- [ ] (CA#3) Quando phase=discovery, texto usa linguagem de hipótese/incerteza
- [ ] (CA#4) PM edita qualquer seção inline sem sair do `/prd/editor`
- [ ] (CA#4) Salvar seção individual funciona sem recarregar a página
- [ ] (CA#5) Geração completa em ≤30s para input de 400–600 palavras

---

## Arquivos a criar

| Arquivo | Ação |
|---|---|
| `src/app/prd/onboarding/page.tsx` | Criar — tela de input |
| `src/app/prd/editor/page.tsx` | Criar — editor do PRD |
| `src/components/prd/PRDEditor.tsx` | Criar |
| `src/components/prd/PRDSection.tsx` | Criar — seção editável |
| `src/components/prd/RegulatoryCard.tsx` | Criar — card de restrições |
| `src/app/api/prd/generate/route.ts` | Criar |
| `src/app/api/prd/[id]/route.ts` | Criar — PATCH |
| `src/lib/prompts/prd.prompt.ts` | Criar |
| `src/lib/validators/schemas.ts` | Adicionar `GeneratePRDSchema`, `UpdatePRDSchema` |
| `src/types/index.ts` | Adicionar `PRD`, `PRDCriterion`, `RegulatoryRestriction` |
| `supabase/migrations/00003_prd.sql` | Criar — tabela PRD |

---

## Não está no escopo deste spec

- EC-02 (Camada PII) — bloqueante para adoção bancária, V3
- Export de PRD para PDF
- Compartilhamento de PRD via link público
- Template de PRD por indústria (apenas Fintech no V2)
