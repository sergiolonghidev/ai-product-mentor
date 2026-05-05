# DATA-MODELS.md — Tipos e Schemas Centrais

> Este arquivo é a fonte da verdade para todos os tipos do sistema.
> O arquivo `types/index.ts` deve espelhar exatamente o que está definido aqui.

---

## Entidades Principais

### Session
Representa uma sessão de uso do mentor por um PM.

```typescript
type Session = {
  id: string                    // UUID v4
  createdAt: Date
  updatedAt: Date

  // Contexto capturado no onboarding
  context: SessionContext

  // Estado da sessão
  status: 'onboarding' | 'active' | 'ended'

  // Mensagens da conversa (ordenadas por createdAt)
  messages: Message[]
}

type SessionContext = {
  squad: string                 // ex: "Credit Cards - Aquisição"
  functionalityType: FunctionalityType
  currentPain: string           // resposta livre à pergunta 3 do onboarding
}

type FunctionalityType =
  | 'fatura'
  | 'parcelamento'
  | 'recompensa'
  | 'limite'
  | 'tokenizacao'
  | 'aquisicao'
  | 'outro'
```

---

### Message
Cada mensagem na conversa entre o PM e o mentor.

```typescript
type Message = {
  id: string                    // UUID v4
  sessionId: string
  createdAt: Date

  role: 'user' | 'assistant'
  content: string

  // Metadados opcionais (só em mensagens do assistant)
  metadata?: MessageMetadata
}

type MessageMetadata = {
  type: MessageType
  confidenceLevel?: ConfidenceLevel
  sources?: Source[]
}

type MessageType =
  | 'onboarding_question'       // pergunta do wizard de onboarding
  | 'onboarding_response'       // resposta de boas-vindas após onboarding
  | 'user_story'                // resposta com User Story gerada
  | 'refinement'                // resposta após thumbs down
  | 'general'                   // resposta conversacional genérica

type ConfidenceLevel = {
  level: 'high' | 'medium' | 'low'
  // "high" = validado pelo Jurídico
  // "medium" = baseado no normativo, pendente de revisão
  // "low" = inferência do modelo, não revisada
  label: string                 // texto legível para o PM
  lastValidatedAt?: Date        // quando "high"
  validatedBy?: string          // quem validou, quando "high"
}

type Source = {
  title: string                 // ex: "Resolução BCB nº 96/2021"
  url?: string
  excerpt?: string              // trecho relevante (< 100 chars)
}
```

---

### UserStory
A User Story gerada pelo mentor para um card.

```typescript
type UserStory = {
  id: string
  sessionId: string
  messageId: string             // mensagem do assistant que contém esta story
  createdAt: Date

  // Corpo da User Story
  persona: string               // "Como PM de aquisição de cartões..."
  action: string                // "Quero implementar..."
  benefit: string               // "Para que..."

  // Critérios de aceite
  acceptanceCriteria: AcceptanceCriterion[]

  // Resultado do linter (preenchido assincronamente)
  lintResult?: LintResult

  // Integração Linear (A User Story e todos os dados são persistidos no banco Supabase independente da exportação)
  linearIssueId?: string        // ID interno gerado pela API do Linear
  linearIssueUrl?: string       // URL pública para acesso ao card no Linear
}

type AcceptanceCriterion = {
  id: string
  description: string
  category: 'functional' | 'compliance' | 'ux' | 'performance'
}

type LintResult = {
  completedAt: Date
  risks: ComplianceRisk[]
  summary: LintSummary
}

type LintSummary = {
  critical: number              // contagem de risks com level 'red'
  warnings: number              // contagem de risks com level 'amber'
  ok: boolean                   // true se critical === 0
}

type ComplianceRisk = {
  id: string
  level: 'red' | 'amber' | 'green'
  title: string                 // ex: "CET ausente nos critérios de aceite"
  description: string           // explicação do risco
  normativeReference: string    // ex: "Resolução BCB nº 96/2021, Art. 4º"
  suggestion: string            // o que o PM deve corrigir
  affectedCriteria?: string[]   // IDs dos critérios afetados
}
```

---

### Feedback
Avaliação de uma resposta do mentor pelo PM.

```typescript
type Feedback = {
  id: string
  sessionId: string
  messageId: string             // mensagem avaliada
  createdAt: Date

  vote: 'up' | 'down'
  reason?: FeedbackReason       // obrigatório quando vote === 'down'
}

type FeedbackReason =
  | 'too_generic'               // "Muito genérico"
  | 'wrong_context'             // "Não se aplica ao meu contexto"
  | 'missing_regulatory_detail' // "Faltou detalhe regulatório"
  | 'incorrect_information'     // "Informação incorreta"
```

---

## Schemas de Validação (Zod)

```typescript
// lib/validators/schemas.ts

import { z } from 'zod'

export const SessionContextSchema = z.object({
  squad: z.string().min(1).max(200),
  functionalityType: z.enum([
    'fatura', 'parcelamento', 'recompensa',
    'limite', 'tokenizacao', 'aquisicao', 'outro'
  ]),
  currentPain: z.string().min(1).max(1000),
})

export const StartSessionSchema = z.object({
  context: SessionContextSchema,
})

export const SendMessageSchema = z.object({
  sessionId: z.string().uuid(),
  content: z.string().min(1).max(4000),
})

export const GenerateStorySchema = z.object({
  sessionId: z.string().uuid(),
  description: z.string().min(10).max(2000),
})

export const LintStorySchema = z.object({
  storyId: z.string().uuid(),
  sessionId: z.string().uuid(),
})

export const SubmitFeedbackSchema = z.object({
  sessionId: z.string().uuid(),
  messageId: z.string().uuid(),
  vote: z.enum(['up', 'down']),
  reason: z.enum([
    'too_generic',
    'wrong_context',
    'missing_regulatory_detail',
    'incorrect_information',
  ]).optional(),
}).refine(
  (data) => data.vote === 'up' || data.reason !== undefined,
  { message: 'reason é obrigatório quando vote é "down"', path: ['reason'] }
)
```

---

## Schema do Banco (Supabase SQL)

As migrações ficarão dentro de `supabase/migrations/` em arquivos SQL puro. Os tipos do TypeScript para o Next.js serão gerados utilizando a Supabase CLI (ex: `npx supabase gen types typescript --local > types/supabase.ts`).

```sql
-- Exemplo de esquema base (supabase/migrations/00001_initial_schema.sql)

CREATE TABLE "Session" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "status" TEXT DEFAULT 'onboarding',
  "squad" TEXT NOT NULL,
  "functionalityType" TEXT NOT NULL,
  "currentPain" TEXT NOT NULL
);

CREATE TABLE "Message" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "sessionId" UUID NOT NULL REFERENCES "Session"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "type" TEXT,
  "metadata" JSONB
);

CREATE TABLE "UserStory" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "sessionId" UUID NOT NULL REFERENCES "Session"("id") ON DELETE CASCADE,
  "messageId" UUID UNIQUE NOT NULL REFERENCES "Message"("id") ON DELETE CASCADE,
  "persona" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "benefit" TEXT NOT NULL,
  "criteria" JSONB NOT NULL,
  "lintResult" JSONB,
  "linearIssueId" TEXT,
  "linearIssueUrl" TEXT
);

CREATE TABLE "Feedback" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "sessionId" UUID NOT NULL REFERENCES "Session"("id") ON DELETE CASCADE,
  "messageId" UUID UNIQUE NOT NULL REFERENCES "Message"("id") ON DELETE CASCADE,
  "vote" TEXT NOT NULL,
  "reason" TEXT
);
```
