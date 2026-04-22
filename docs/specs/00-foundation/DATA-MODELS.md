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

## Schema do Banco (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Session {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  status    String   @default("onboarding")

  squad             String
  functionalityType String
  currentPain       String

  messages   Message[]
  userStories UserStory[]
  feedbacks  Feedback[]
}

model Message {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  sessionId String
  role      String   // 'user' | 'assistant'
  content   String
  type      String?  // MessageType
  metadata  Json?

  session   Session  @relation(fields: [sessionId], references: [id])
  feedback  Feedback?
  userStory UserStory?
}

model UserStory {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  sessionId String
  messageId String   @unique

  persona  String
  action   String
  benefit  String
  criteria Json     // AcceptanceCriterion[]
  lintResult Json?  // LintResult

  session Session @relation(fields: [sessionId], references: [id])
  message Message @relation(fields: [messageId], references: [id])
}

model Feedback {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  sessionId String
  messageId String   @unique

  vote   String   // 'up' | 'down'
  reason String?  // FeedbackReason

  session Session @relation(fields: [sessionId], references: [id])
  message Message @relation(fields: [messageId], references: [id])
}
```
