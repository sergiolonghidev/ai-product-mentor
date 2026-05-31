# SPEC-06 — Story Editor (Edição Inline + Multi-Story)
**ProdPilot AI · V2**
`Corresponde a: CA#12, CA#13, CA#15`

---

## Objetivo

Permitir que o PM edite cada US gerada inline (persona, ação, benefício, critérios),
adicione e remova USs individualmente, e veja apenas USs com formato válido.

---

## Estado atual

`StoryBlock.tsx` é read-only: exibe a US, permite export para Linear.
Não há modo de edição. Não há multi-story por sessão além de mensagens separadas.

---

## Mudanças de comportamento

### 1. Validação de formato (CA#12)

O prompt atual já instrui o modelo a retornar JSON. A validação adicional no cliente:

- Após receber `story_complete`, verificar que `persona` começa com "Como "
- Verificar que `action` começa com "Quero "
- Verificar que `benefit` começa com "Para que" ou "Para "
- Se qualquer campo falhar: exibir banner de aviso "Formato fora do padrão — edite antes de exportar"
- **Não bloquear** a exibição da US (fail-safe mantido)

### 2. Modo de edição inline (CA#15)

`StoryBlock` ganha um botão "Editar" que alterna entre view mode e edit mode.

**Edit mode:**
- `persona`, `action`, `benefit`: `<textarea>` inline (substitui o `<p>`)
- Cada `AcceptanceCriterion`: campo de texto + botão de remover (ícone X)
- Botão "+ Adicionar critério" no final da lista
- Botão "Salvar" (persiste via `PATCH /api/story/:id`) e "Cancelar"

**Após salvar:**
- Estado local atualizado
- `storyId` mantido (sem criar novo registro)
- Linter re-executado automaticamente se houve mudança em algum campo

### 3. Critérios específicos e testáveis (CA#13)

Reforço no prompt: adicionar instrução explícita de que critérios genéricos como
"funcionar corretamente" são inválidos. Verificar na resposta — se detectado, marcar
com warning visual no critério (não bloquear).

---

## API

### `PATCH /api/story/:id`

```typescript
// Request
{
  sessionId: string
  persona?: string
  action?: string
  benefit?: string
  acceptanceCriteria?: AcceptanceCriterion[]
}

// Response 200
{
  story: UserStory
  lintQueued: boolean
}
```

Validação Zod:
- `sessionId` obrigatório (ownership check)
- Ao menos 1 campo de conteúdo presente
- `acceptanceCriteria`: se presente, mínimo 1 item

---

## Componentes

### `StoryBlock.tsx` — refactor

```typescript
type StoryBlockProps = {
  story: Pick<UserStory, 'persona' | 'action' | 'benefit' | 'acceptanceCriteria'>
  storyId?: string
  sessionId?: string
  formatWarning?: boolean   // novo: exibir banner de formato inválido
}

// Estado interno adicional
type EditState = {
  mode: 'view' | 'edit'
  draft: {
    persona: string
    action: string
    benefit: string
    acceptanceCriteria: AcceptanceCriterion[]
  }
  saving: boolean
  error: string | null
}
```

### Detecção de critério genérico

```typescript
const GENERIC_CRITERIA = [
  'funcionar corretamente',
  'funcione corretamente',
  'deve funcionar',
  'estar disponível',
]

function isGenericCriterion(description: string): boolean {
  return GENERIC_CRITERIA.some(g => description.toLowerCase().includes(g))
}
```

Critérios genéricos exibem um ícone de aviso `⚠` ao lado do badge de categoria,
sem impedir edição ou export.

---

## Mudança no prompt (`story.prompt.ts`)

Adicionar à seção "Regras":
```
- Critérios de aceite NUNCA podem conter linguagem genérica como "funcionar corretamente",
  "estar disponível" ou "deve funcionar". Cada critério deve especificar condição, ação
  e resultado verificável.
- Validar que persona começa EXATAMENTE com "Como ", action com "Quero ", benefit com "Para que ".
```

---

## Critérios de aceite

- [ ] (CA#12) Banner de formato inválido exibido quando campos não seguem o padrão
- [ ] (CA#13) Critérios genéricos exibem aviso `⚠` inline
- [ ] (CA#15) Botão "Editar" presente em cada StoryBlock
- [ ] (CA#15) Em edit mode, persona/action/benefit são editáveis inline
- [ ] (CA#15) PM pode adicionar novo AC (categoria selecionável + texto livre)
- [ ] (CA#15) PM pode remover AC individual (mínimo 1 restante)
- [ ] (CA#15) Salvar persiste no banco e re-executa o linter
- [ ] (CA#15) Cancelar descarta mudanças sem alterar banco
- [ ] Export não disponível durante edit mode

---

## Arquivos afetados

| Arquivo | Ação |
|---|---|
| `src/components/story/StoryBlock.tsx` | Refactor com modo de edição |
| `src/app/api/story/[id]/route.ts` | Criar — PATCH endpoint |
| `src/lib/validators/schemas.ts` | Adicionar `UpdateStorySchema` |
| `src/lib/prompts/story.prompt.ts` | Reforçar regras de formato e critérios |

---

## Não está no escopo deste spec

- Histórico de edições (audit log)
- Colaboração em tempo real
- Geração de múltiplas USs num único LLM call (isso é escopo do spec de Story Generation V2)
