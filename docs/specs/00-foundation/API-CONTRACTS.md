# API-CONTRACTS.md — Contratos de Endpoints

> Cada endpoint é um contrato. Não altere o contrato sem atualizar este arquivo e notificar o time.
> Todos os endpoints retornam `Content-Type: application/json`, exceto onde indicado.

---

## Convenções

- **Base URL:** `/api`
- **Erros:** Sempre `{ error: { code: string, message: string } }` — ver `04-shared/ERRORS.md`
- **IDs:** UUID v4
- **Datas:** ISO 8601 string (`2025-04-21T10:00:00Z`)
- **Autenticação MVP Alpha:** `x-session-id` header (anônimo)

---

## POST /api/session/start

Inicia uma nova sessão após o onboarding. Salva o contexto do PM.

### Request
```typescript
// Body
{
  context: {
    squad: string                 // min 1, max 200 chars
    functionalityType: FunctionalityType
    currentPain: string           // min 1, max 1000 chars
  }
}
```

### Response 201
```typescript
{
  session: {
    id: string
    status: 'active'
    context: SessionContext
    createdAt: string             // ISO 8601
  }
  // Primeira mensagem de boas-vindas já gerada
  welcomeMessage: {
    id: string
    content: string
    type: 'onboarding_response'
  }
}
```

### Errors
| Code | HTTP | Quando |
|------|------|--------|
| `VALIDATION_ERROR` | 400 | Body inválido |
| `LLM_UNAVAILABLE` | 503 | Gemini API offline |

---

## POST /api/chat/message

Envia uma mensagem do PM e recebe resposta do mentor.
**Retorna stream (Server-Sent Events).**

### Request
```typescript
// Headers
x-session-id: string              // UUID da sessão ativa

// Body
{
  sessionId: string
  content: string                 // min 1, max 4000 chars
}
```

### Response 200 — Stream (SSE)
```
Content-Type: text/event-stream

event: chunk
data: {"text": "Com base no seu contexto de "}

event: chunk
data: {"text": "aquisição de cartões..."}

event: message_complete
data: {
  "messageId": "uuid",
  "type": "general",
  "confidenceLevel": {
    "level": "high",
    "label": "Validado pelo Jurídico em 15/03/2025"
  },
  "sources": [
    {
      "title": "Resolução BCB nº 96/2021",
      "url": "https://..."
    }
  ]
}

event: done
data: {}
```

### Errors
| Code | HTTP | Quando |
|------|------|--------|
| `SESSION_NOT_FOUND` | 404 | sessionId inválido |
| `SESSION_ENDED` | 409 | sessão já encerrada |
| `VALIDATION_ERROR` | 400 | Body inválido |
| `LLM_UNAVAILABLE` | 503 | Gemini API offline |

---

## POST /api/story/generate

Gera uma User Story estruturada a partir de uma descrição em linguagem natural.
**Retorna stream (SSE) para a User Story, enquanto o linter é engatilhado assincronamente.**

### Request
```typescript
// Headers
x-session-id: string

// Body
{
  sessionId: string
  description: string             // min 10, max 2000 chars
}
```

### Response 200 — Stream (SSE)
```
event: chunk
data: {"text": "**Como** PM de aquisição de cartões..."}

event: story_complete
data: {
  "storyId": "uuid",
  "messageId": "uuid",
  "story": {
    "persona": "Como PM de aquisição de cartões...",
    "action": "Quero implementar um fluxo de...",
    "benefit": "Para que o usuário possa...",
    "acceptanceCriteria": [
      {
        "id": "ac-1",
        "description": "O CET deve ser exibido em destaque...",
        "category": "compliance"
      }
    ]
  },
  "lintStatus": "pending"         // linter ainda rodando
}

event: done
data: {}
```

### Errors
| Code | HTTP | Quando |
|------|------|--------|
| `SESSION_NOT_FOUND` | 404 | |
| `VALIDATION_ERROR` | 400 | |
| `LLM_UNAVAILABLE` | 503 | |

---

## POST /api/story/lint

Roda o linter de compliance em uma User Story já gerada.
Chamado pelo servidor automaticamente após `story/generate`, mas também pode ser chamado manualmente.

### Request
```typescript
// Body
{
  storyId: string
  sessionId: string
}
```

### Response 200
```typescript
{
  storyId: string
  lintResult: {
    completedAt: string
    summary: {
      critical: number
      warnings: number
      ok: boolean
    }
    risks: Array<{
      id: string
      level: 'red' | 'amber' | 'green'
      title: string
      description: string
      normativeReference: string
      suggestion: string
      affectedCriteria?: string[]
    }>
  }
}
```

**Regra de negócio:** `risks` com `level: 'red'` são limitados a 2 por response.
Se o linter identificar mais de 2 riscos críticos, retorna os 2 mais severos e agrega o restante como `{ level: 'amber', title: 'Outros riscos identificados', ... }`.

### Errors
| Code | HTTP | Quando |
|------|------|--------|
| `STORY_NOT_FOUND` | 404 | storyId inválido |
| `LINT_ALREADY_COMPLETE` | 409 | linter já rodou para esta story |
| `LLM_UNAVAILABLE` | 503 | |

---

## POST /api/feedback

Salva o feedback do PM sobre uma resposta do mentor.

### Request
```typescript
// Body
{
  sessionId: string
  messageId: string
  vote: 'up' | 'down'
  reason?: FeedbackReason         // obrigatório se vote === 'down'
}
```

### Response 201
```typescript
{
  feedbackId: string
  // Se vote === 'down', inclui o refinamento já sendo gerado
  refinementTriggered: boolean
  refinementMessageId?: string    // ID da mensagem de refinamento (se gerada)
}
```

**Comportamento:** Quando `vote === 'down'`, o servidor automaticamente dispara uma nova chamada à LLM com o contexto do feedback e retorna o ID da mensagem de refinamento. O cliente deve escutar `GET /api/chat/message/:id/stream` para receber o refinamento em stream.

### Errors
| Code | HTTP | Quando |
|------|------|--------|
| `MESSAGE_NOT_FOUND` | 404 | messageId inválido |
| `FEEDBACK_ALREADY_EXISTS` | 409 | já existe feedback para esta mensagem |
| `VALIDATION_ERROR` | 400 | vote=down sem reason |

---

## GET /api/session/:id/history

Retorna o histórico completo de uma sessão.

### Response 200
```typescript
{
  session: {
    id: string
    status: string
    context: SessionContext
    createdAt: string
  }
  messages: Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    type?: MessageType
    createdAt: string
    feedback?: { vote: 'up' | 'down', reason?: string }
    userStory?: {
      id: string
      lintResult?: LintResult
    }
  }>
}
```

### Errors
| Code | HTTP | Quando |
|------|------|--------|
| `SESSION_NOT_FOUND` | 404 | |
