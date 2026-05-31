# SPEC-07 — Linear Handoff V2 (Épicos + Confirmação + Analytics)
**ProdPilot AI · V2**
`Corresponde a: CA#6, CA#7, CA#8, CA#9, CA#10`

---

## Objetivo

Evoluir o export Linear de "1 story → 1 issue" para um fluxo completo de handoff:
USs agrupadas em épicos, épico de compliance separado, alerta de analytics,
tela de confirmação com checklist, e edição antes do envio.

---

## Estado atual

`POST /api/story/export` cria 1 issue por story com label de compliance quando aplicável.
Não há conceito de épico, não há tela de confirmação, não há alerta de analytics.

---

## Novo fluxo

```
Chat (múltiplas USs geradas)
    ↓
[Botão "Preparar Handoff"] — substitui os botões individuais "Exportar para Linear"
    ↓
Handoff Planner (/handoff)
    ├── Épicos auto-gerados a partir das USs
    ├── Compliance epic separado (se houver ACs de compliance)
    ├── Alerta analytics (se não houver US de tracking)
    ├── Edição: renomear épicos, mover issues, remover issues
    └── [Botão "Enviar ao Linear"]
        ↓
Confirmation Screen (modal ou page)
    ├── Lista de épicos + issues
    ├── Workspace Linear selecionado
    ├── Checklist de verificação
    └── Aviso "Ação irreversível"
        ↓
[Confirmar] → Linear API (bulk create)
    ↓
Resultado: links para todos os épicos criados
```

---

## Modelo de Épico

### Regras de agrupamento automático (CA#6)

1. USs com pelo menos 1 AC de `category: 'compliance'` → épico "Compliance"
2. USs de spike/investigação (detectadas pelo LLM ou por nomenclatura) → épico "Spikes"
3. Demais USs → épico default com nome derivado do contexto da sessão

### Detecção de spike (CA#9)

Uma US é considerada spike quando:
- `action` contém palavras: "investigar", "pesquisar", "avaliar", "explorar", "analisar viabilidade"
- Ou PM marca manualmente como spike no Handoff Planner

No Linear, issues de spike recebem prefixo `[Spike]` no título.

### Alerta de analytics (CA#7)

Verificar se existe pelo menos 1 US/AC que menciona tracking, analytics, evento, métrica, KPI.
Palavras-chave: `["tracking", "analytics", "evento", "rastrear", "métricas", "KPI", "monitorar"]`

Se não encontrado:
- Banner amarelo no Handoff Planner: "Nenhum issue de tracking identificado"
- Botão "+ Adicionar issue de analytics" → cria US pré-preenchida com template de tracking

---

## Componentes

### `components/handoff/HandoffPlanner.tsx`

Estado:
```typescript
type HandoffState = {
  epics: Epic[]
  analyticsAlert: boolean
  saving: boolean
}

type Epic = {
  id: string          // local temp ID
  name: string
  type: 'development' | 'compliance' | 'spike' | 'custom'
  issues: HandoffIssue[]
  linearProjectId?: string  // preenchido após export
}

type HandoffIssue = {
  storyId: string
  title: string       // derivado de persona+action
  description: string // corpo completo da US
  isSpike: boolean
  removed: boolean    // soft delete antes do envio
}
```

Ações disponíveis (CA#8):
- Renomear épico (click no título → input inline)
- Mover issue entre épicos (drag ou select dropdown)
- Remover issue (toggle — issue marcada como removida, não deletada do banco)
- Marcar issue como spike manualmente

### `components/handoff/ConfirmationModal.tsx`

Exibe (CA#10):
- Lista de épicos e issues (count por épico)
- Workspace Linear (extraído de `LINEAR_TEAM_ID`)
- Checklist pré-envio:
  - [ ] Revisei todos os épicos e issues
  - [ ] Compliance epic está separado dos épicos técnicos
  - [ ] Issues de spike estão corretamente identificados
- Texto de aviso: "Esta ação criará os épicos e issues no Linear. Não é possível desfazer em massa."
- Botões: "Cancelar" e "Confirmar e enviar"

---

## API

### `POST /api/handoff/plan`

Gera o plano de épicos a partir das stories da sessão.

```typescript
// Request
{ sessionId: string }

// Response
{
  epics: Epic[]
  analyticsAlert: boolean
}
```

Lógica server-side:
1. Buscar todas as `UserStory` da sessão sem `linearIssueId` (não exportadas)
2. Classificar por presença de ACs compliance → epico compliance
3. Detectar spikes por palavras-chave na `action`
4. Restantes → épico de desenvolvimento (nome = squad da sessão)
5. Verificar analytics alert

### `POST /api/handoff/export`

Executa o export bulk ao Linear.

```typescript
// Request
{
  sessionId: string
  epics: Epic[]   // plano final aprovado pelo PM (após edições)
}

// Response
{
  exported: {
    epicId: string
    epicName: string
    linearProjectId?: string
    issues: { storyId: string; issueId: string; issueUrl: string }[]
  }[]
  errors: { storyId: string; error: string }[]
}
```

Lógica:
1. Para cada épico: criar Project no Linear (ou buscar existente por nome)
2. Para cada issue dentro do épico: `linear.createIssue({ projectId, title, description, labelIds })`
3. Issues de compliance → label `compliance`
4. Issues de spike → prefixo `[Spike]` no título
5. Atualizar `UserStory.linearIssueId` + `linearIssueUrl` para cada story exportada
6. Retornar resultado completo (sucesso + erros parciais)

### Nota: Épicos como Projects no Linear

O Linear não tem "épicos" como entidade nativa da API v2 — usa Projects para agrupamento.
Cada `Epic` do plano vira um `Project` no workspace. Issues são criadas dentro do Project.

---

## Mudança nos botões do StoryBlock

Remover botão individual "Exportar para Linear".
Substituir por indicador de estado:
- Se story já exportada: link `↗ PROJ-123 · Ver no Linear`
- Se não exportada: nenhum botão (o export é feito em batch pelo Handoff)

Manter o botão de handoff no nível da sessão (no `chat/page.tsx`):
"Preparar Handoff" — aparece quando há ao menos 1 story não exportada.

---

## Critérios de aceite

- [ ] (CA#6) Compliance epic SEMPRE separado dos épicos de desenvolvimento
- [ ] (CA#6) Issues de compliance não aparecem em épicos técnicos
- [ ] (CA#7) Alerta de analytics visível quando nenhum tracking identificado
- [ ] (CA#7) Botão "+ Adicionar issue de analytics" cria US pré-preenchida
- [ ] (CA#8) PM pode renomear épicos inline
- [ ] (CA#8) PM pode mover issues entre épicos
- [ ] (CA#8) PM pode remover issues do plano (sem deletar do banco)
- [ ] (CA#9) Issues de spike têm `[Spike]` no título do Linear
- [ ] (CA#9) PM pode marcar/desmarcar spike manualmente
- [ ] (CA#10) Modal de confirmação exibe épicos, issues, workspace e checklist
- [ ] (CA#10) Aviso de irreversibilidade visível antes do submit
- [ ] (CA#10) Export só ocorre após PM confirmar o checklist

---

## Arquivos afetados

| Arquivo | Ação |
|---|---|
| `src/app/handoff/page.tsx` | Criar — página do Handoff Planner |
| `src/components/handoff/HandoffPlanner.tsx` | Criar |
| `src/components/handoff/EpicCard.tsx` | Criar |
| `src/components/handoff/IssueRow.tsx` | Criar |
| `src/components/handoff/ConfirmationModal.tsx` | Criar |
| `src/components/story/StoryBlock.tsx` | Remover botão export individual |
| `src/app/chat/page.tsx` | Adicionar botão "Preparar Handoff" |
| `src/app/api/handoff/plan/route.ts` | Criar |
| `src/app/api/handoff/export/route.ts` | Criar |
| `src/lib/linear/client.ts` | Adicionar `createProject` + `bulkCreateIssues` |
| `src/lib/validators/schemas.ts` | Adicionar `HandoffPlanSchema`, `HandoffExportSchema` |

---

## Não está no escopo deste spec

- Sincronização bidirecional (mudanças no Linear refletidas no app)
- Suporte a Jira (V3+)
- Reordenação por drag-and-drop (MVP: mover via select dropdown)
- Epics que viram Milestones no Linear (avaliar na V3)
