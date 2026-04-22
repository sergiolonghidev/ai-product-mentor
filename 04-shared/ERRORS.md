# ERRORS.md — Catálogo de Erros Padronizados

> Todo erro da API segue o formato: `{ error: { code: string, message: string, details?: unknown } }`
> Nunca retorne stack traces, mensagens internas da LLM ou dados sensíveis em erros de produção.

---

## Catálogo

| Code | HTTP | Descrição | Mensagem para o PM |
|------|------|-----------|--------------------|
| `VALIDATION_ERROR` | 400 | Input inválido segundo o schema Zod | "Os dados enviados são inválidos. Verifique os campos e tente novamente." |
| `SESSION_NOT_FOUND` | 404 | sessionId não existe no banco | "Sessão não encontrada. Recarregue a página para iniciar uma nova sessão." |
| `SESSION_ENDED` | 409 | Sessão com status 'ended' | "Esta sessão foi encerrada. Inicie uma nova sessão." |
| `MESSAGE_NOT_FOUND` | 404 | messageId não existe | "Mensagem não encontrada." |
| `STORY_NOT_FOUND` | 404 | storyId não existe | "Story não encontrada." |
| `LINT_ALREADY_COMPLETE` | 409 | Linter já rodou para esta story | "Esta story já foi verificada." |
| `FEEDBACK_ALREADY_EXISTS` | 409 | Feedback duplicado | "Você já avaliou esta resposta." |
| `LLM_UNAVAILABLE` | 503 | Claude API timeout ou error | "O mentor está temporariamente indisponível. Tente novamente em alguns instantes." |
| `REFINEMENT_LIMIT_REACHED` | 422 | > 3 refinamentos por mensagem | "Limite de refinamentos atingido para esta resposta." |
| `INTERNAL_ERROR` | 500 | Erro não tratado | "Algo deu errado. Nossa equipe foi notificada." |

---

## Implementação

```typescript
// lib/errors.ts

export type AppError = {
  code: ErrorCode
  message: string
  details?: unknown
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'SESSION_NOT_FOUND'
  | 'SESSION_ENDED'
  | 'MESSAGE_NOT_FOUND'
  | 'STORY_NOT_FOUND'
  | 'LINT_ALREADY_COMPLETE'
  | 'FEEDBACK_ALREADY_EXISTS'
  | 'LLM_UNAVAILABLE'
  | 'REFINEMENT_LIMIT_REACHED'
  | 'INTERNAL_ERROR'

export function errorResponse(code: ErrorCode, details?: unknown) {
  const messages: Record<ErrorCode, string> = {
    VALIDATION_ERROR: 'Os dados enviados são inválidos.',
    SESSION_NOT_FOUND: 'Sessão não encontrada. Recarregue a página.',
    SESSION_ENDED: 'Esta sessão foi encerrada.',
    MESSAGE_NOT_FOUND: 'Mensagem não encontrada.',
    STORY_NOT_FOUND: 'Story não encontrada.',
    LINT_ALREADY_COMPLETE: 'Esta story já foi verificada.',
    FEEDBACK_ALREADY_EXISTS: 'Você já avaliou esta resposta.',
    LLM_UNAVAILABLE: 'O mentor está temporariamente indisponível. Tente novamente.',
    REFINEMENT_LIMIT_REACHED: 'Limite de refinamentos atingido.',
    INTERNAL_ERROR: 'Algo deu errado. Nossa equipe foi notificada.',
  }

  return {
    error: {
      code,
      message: messages[code],
      ...(process.env.NODE_ENV === 'development' && details ? { details } : {}),
    }
  }
}
```
