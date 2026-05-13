import { SessionContext, Message, FeedbackReason, FunctionalityType } from '@/types'

const functionalityLabels: Record<FunctionalityType, string> = {
  fatura:       'fatura e pagamento',
  parcelamento: 'parcelamento de compras',
  recompensa:   'programa de recompensas',
  limite:       'gestão de limite',
  tokenizacao:  'tokenização e meios digitais',
  aquisicao:    'aquisição de clientes',
  outro:        'produto de cartões',
}

const reasonInstructions: Record<FeedbackReason, string> = {
  too_generic: `
A resposta anterior foi considerada muito genérica.
Reescreva sendo mais específico ao contexto do squad e ao tipo de funcionalidade.
Use exemplos concretos do segmento de cartões de crédito no Brasil.
`,
  wrong_context: `
A resposta anterior não se aplicou ao contexto correto.
Reescreva focando exatamente no cenário específico do squad e tipo de funcionalidade mencionados.
`,
  missing_regulatory_detail: `
A resposta anterior faltou detalhe regulatório.
Inclua referências específicas às regulamentações do BCB aplicáveis ao contexto.
Mencione normativos relevantes (Resoluções BCB, CMN) com artigos específicos quando pertinente.
`,
  incorrect_information: `
A resposta anterior continha informação incorreta.
Revise cuidadosamente e corrija. Se não tiver certeza de algum dado,
sinalize explicitamente com "verifique com seu time de Compliance".
`,
}

export function buildRefinementPrompt(
  originalMessage: Message,
  feedbackReason: FeedbackReason,
  context: SessionContext
): string {
  return `
Você é o AI Project Mentor.

Contexto do PM:
- Squad: ${context.squad}
- Tipo: ${functionalityLabels[context.functionalityType]}
- Dor: ${context.currentPain}

Sua resposta anterior foi:
"""
${originalMessage.content}
"""

O PM avaliou negativamente esta resposta porque: ${reasonInstructions[feedbackReason]}

Gere uma nova versão melhorada da resposta.
Comece com "Deixa eu reformular:" para sinalizar que é uma versão refinada.
Seja direto, sem jargão. Máximo 4 parágrafos.
`.trim()
}
