export type FunctionalityType =
  | 'fatura'
  | 'parcelamento'
  | 'recompensa'
  | 'limite'
  | 'tokenizacao'
  | 'aquisicao'
  | 'outro'

export type SessionContext = {
  squad: string
  functionalityType: FunctionalityType
  currentPain: string
}

export type Session = {
  id: string
  createdAt: string
  updatedAt: string
  status: 'onboarding' | 'active' | 'ended'
  context: SessionContext
  messages: Message[]
}

export type MessageType =
  | 'onboarding_question'
  | 'onboarding_response'
  | 'user_story'
  | 'refinement'
  | 'general'

export type ConfidenceLevel = {
  level: 'high' | 'medium' | 'low'
  label: string
  lastValidatedAt?: string
  validatedBy?: string
}

export type Source = {
  title: string
  url?: string
  excerpt?: string
}

export type MessageMetadata = {
  type: MessageType
  storyId?: string
  confidenceLevel?: ConfidenceLevel
  sources?: Source[]
}

export type Message = {
  id: string
  sessionId: string
  createdAt: string
  role: 'user' | 'assistant'
  content: string
  metadata?: MessageMetadata
}

export type AcceptanceCriterion = {
  id: string
  description: string
  category: 'functional' | 'compliance' | 'ux' | 'performance'
}

export type ComplianceRisk = {
  id: string
  level: 'red' | 'amber' | 'green'
  title: string
  description: string
  normativeReference: string
  suggestion: string
  affectedCriteria?: string[]
}

export type LintSummary = {
  critical: number
  warnings: number
  ok: boolean
}

export type LintResult = {
  completedAt: string
  risks: ComplianceRisk[]
  summary: LintSummary
}

export type UserStory = {
  id: string
  sessionId: string
  messageId: string
  createdAt: string
  persona: string
  action: string
  benefit: string
  acceptanceCriteria: AcceptanceCriterion[]
  lintResult?: LintResult
  linearIssueId?: string
  linearIssueUrl?: string
}

export type FeedbackReason =
  | 'too_generic'
  | 'wrong_context'
  | 'missing_regulatory_detail'
  | 'incorrect_information'

export type Feedback = {
  id: string
  sessionId: string
  messageId: string
  createdAt: string
  vote: 'up' | 'down'
  reason?: FeedbackReason
}
