import { z } from 'zod'

export const FunctionalityTypeSchema = z.enum([
  'fatura', 'parcelamento', 'recompensa',
  'limite', 'tokenizacao', 'aquisicao', 'outro'
])

export const SessionContextSchema = z.object({
  squad: z.string().min(1).max(200),
  functionalityType: FunctionalityTypeSchema,
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

export const ExportStorySchema = z.object({
  storyId: z.string().uuid(),
  sessionId: z.string().uuid(),
})

const AcceptanceCriterionSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1).max(500),
  category: z.enum(['functional', 'compliance', 'ux', 'performance']),
})

// Handoff
const HandoffIssueSchema = z.object({
  storyId: z.string(),
  title: z.string().min(1),
  description: z.string(),
  isSpike: z.boolean(),
  removed: z.boolean(),
})

const EpicSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['development', 'compliance', 'spike', 'custom']),
  issues: z.array(HandoffIssueSchema),
})

export const HandoffPlanSchema = z.object({
  sessionId: z.string().uuid(),
})

export const HandoffExportSchema = z.object({
  sessionId: z.string().uuid(),
  epics: z.array(EpicSchema).min(1),
})

export const UpdateStorySchema = z.object({
  sessionId: z.string().uuid(),
  persona: z.string().min(1).max(500).optional(),
  action: z.string().min(1).max(500).optional(),
  benefit: z.string().min(1).max(500).optional(),
  acceptanceCriteria: z.array(AcceptanceCriterionSchema).min(1).optional(),
}).refine(
  (d) => d.persona !== undefined || d.action !== undefined || d.benefit !== undefined || d.acceptanceCriteria !== undefined,
  { message: 'Ao menos um campo de conteúdo é obrigatório' }
)

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
