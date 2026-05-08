import { UserStory } from '@/types'

const categoryLabels: Record<string, string> = {
  functional: 'Funcional',
  compliance: 'Compliance',
  ux: 'UX',
  performance: 'Performance',
}

type FormattedIssue = {
  title: string
  description: string
  needsComplianceLabel: boolean
}

export function formatStoryAsIssue(
  story: Pick<UserStory, 'persona' | 'action' | 'benefit' | 'acceptanceCriteria'>
): FormattedIssue {
  const title = `Como ${story.persona}, quero ${story.action}`

  const acLines = story.acceptanceCriteria
    .map((ac) => `- **[${categoryLabels[ac.category] ?? ac.category}]** ${ac.description}`)
    .join('\n')

  const description = [
    '## User Story',
    `**Como** ${story.persona}, **quero** ${story.action}, **para** ${story.benefit}.`,
    '',
    '## Critérios de Aceite',
    acLines,
  ].join('\n')

  const needsComplianceLabel = story.acceptanceCriteria.some(
    (ac) => ac.category === 'compliance'
  )

  return { title, description, needsComplianceLabel }
}
