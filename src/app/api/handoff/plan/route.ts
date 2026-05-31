import { NextRequest, NextResponse } from 'next/server'
import { HandoffPlanSchema } from '@/lib/validators/schemas'
import { db as supabase } from '@/lib/supabase/server'
import { AcceptanceCriterion } from '@/types'

const SPIKE_KEYWORDS = ['investigar', 'pesquisar', 'avaliar', 'explorar', 'analisar viabilidade']
const ANALYTICS_KEYWORDS = ['tracking', 'analytics', 'evento', 'rastrear', 'métricas', 'kpi', 'monitorar']

function detectSpike(action: string): boolean {
  const lower = action.toLowerCase()
  return SPIKE_KEYWORDS.some((k) => lower.includes(k))
}

function storyMentionsAnalytics(action: string, criteria: AcceptanceCriterion[]): boolean {
  const text = [action, ...criteria.map((c) => c.description)].join(' ').toLowerCase()
  return ANALYTICS_KEYWORDS.some((k) => text.includes(k))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = HandoffPlanSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      )
    }

    const { sessionId } = parsed.data

    const { data: session } = await supabase
      .from('Session')
      .select('squad')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json(
        { error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      )
    }

    const { data: stories } = await supabase
      .from('UserStory')
      .select('id, persona, action, benefit, criteria, linearIssueId')
      .eq('sessionId', sessionId)
      .is('linearIssueId', null)
      .order('createdAt', { ascending: true })

    if (!stories || stories.length === 0) {
      return NextResponse.json(
        { error: { code: 'NO_STORIES', message: 'No unexported stories found' } },
        { status: 422 }
      )
    }

    const devEpicId = 'epic-dev'
    const complianceEpicId = 'epic-compliance'
    const spikeEpicId = 'epic-spike'

    const devIssues: ReturnType<typeof buildIssue>[] = []
    const complianceIssues: ReturnType<typeof buildIssue>[] = []
    const spikeIssues: ReturnType<typeof buildIssue>[] = []
    let hasAnalytics = false

    for (const story of stories) {
      const criteria: AcceptanceCriterion[] = Array.isArray(story.criteria) ? story.criteria : []
      const isSpike = detectSpike(story.action)
      const hasCompliance = criteria.some((c) => c.category === 'compliance')

      if (storyMentionsAnalytics(story.action, criteria)) hasAnalytics = true

      const issue = buildIssue(story, criteria, isSpike)

      if (isSpike) {
        spikeIssues.push(issue)
      } else if (hasCompliance) {
        complianceIssues.push(issue)
      } else {
        devIssues.push(issue)
      }
    }

    const epics = []

    if (devIssues.length > 0) {
      epics.push({
        id: devEpicId,
        name: session.squad,
        type: 'development' as const,
        issues: devIssues,
      })
    }

    if (complianceIssues.length > 0) {
      epics.push({
        id: complianceEpicId,
        name: 'Compliance',
        type: 'compliance' as const,
        issues: complianceIssues,
      })
    }

    if (spikeIssues.length > 0) {
      epics.push({
        id: spikeEpicId,
        name: 'Spikes & Investigações',
        type: 'spike' as const,
        issues: spikeIssues,
      })
    }

    return NextResponse.json({ epics, analyticsAlert: !hasAnalytics })
  } catch (err) {
    console.error('Handoff plan error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

function buildIssue(
  story: { id: string; persona: string; action: string; benefit: string },
  criteria: AcceptanceCriterion[],
  isSpike: boolean
) {
  const categoryLabels: Record<string, string> = {
    functional: 'Funcional',
    compliance: 'Compliance',
    ux: 'UX',
    performance: 'Performance',
  }

  const acLines = criteria
    .map((ac) => `- **[${categoryLabels[ac.category] ?? ac.category}]** ${ac.description}`)
    .join('\n')

  const description = [
    '## User Story',
    `**Como** ${story.persona}, **quero** ${story.action}, **para** ${story.benefit}.`,
    '',
    '## Critérios de Aceite',
    acLines,
  ].join('\n')

  return {
    storyId: story.id,
    title: `${story.persona}, ${story.action}`,
    description,
    isSpike,
    removed: false,
  }
}
