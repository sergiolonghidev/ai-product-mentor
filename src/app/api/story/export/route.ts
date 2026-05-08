import { NextRequest, NextResponse } from 'next/server'
import { ExportStorySchema } from '@/lib/validators/schemas'
import { getLinearClient } from '@/lib/linear/client'
import { formatStoryAsIssue } from '@/lib/linear/formatter'
import { db as supabase } from '@/lib/supabase/server'
import { AcceptanceCriterion } from '@/types'

const TEAM_ID = process.env.LINEAR_TEAM_ID!
const COMPLIANCE_LABEL_NAME = 'compliance'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ExportStorySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      )
    }

    const { storyId } = parsed.data

    if (!process.env.LINEAR_API_KEY || !process.env.LINEAR_TEAM_ID) {
      return NextResponse.json(
        { error: { code: 'LINEAR_NOT_CONFIGURED', message: 'Linear is not configured' } },
        { status: 503 }
      )
    }

    const { data: story, error: storyError } = await supabase
      .from('UserStory')
      .select()
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: { code: 'STORY_NOT_FOUND', message: 'Story not found' } },
        { status: 404 }
      )
    }

    if (story.linearIssueId) {
      return NextResponse.json(
        { error: { code: 'ALREADY_EXPORTED', message: 'Story already exported to Linear' } },
        { status: 409 }
      )
    }

    const criteria: AcceptanceCriterion[] = Array.isArray(story.criteria) ? story.criteria : []
    const { title, description, needsComplianceLabel } = formatStoryAsIssue({
      persona: story.persona,
      action: story.action,
      benefit: story.benefit,
      acceptanceCriteria: criteria,
    })

    const linear = getLinearClient()
    const labelIds: string[] = []

    if (needsComplianceLabel) {
      const existingLabels = await linear.issueLabels({
        filter: { team: { id: { eq: TEAM_ID } } },
      })
      const existing = existingLabels.nodes.find(
        (l) => l.name.toLowerCase() === COMPLIANCE_LABEL_NAME
      )

      if (existing) {
        labelIds.push(existing.id)
      } else {
        const created = await linear.createIssueLabel({
          name: COMPLIANCE_LABEL_NAME,
          color: '#f97316',
          teamId: TEAM_ID,
        })
        const label = await created.issueLabel
        if (label) labelIds.push(label.id)
      }
    }

    const issuePayload = await linear.createIssue({
      title,
      description,
      teamId: TEAM_ID,
      ...(labelIds.length > 0 && { labelIds }),
    })

    const issue = await issuePayload.issue
    if (!issue) {
      return NextResponse.json(
        { error: { code: 'LINEAR_API_ERROR', message: 'Failed to create Linear issue' } },
        { status: 502 }
      )
    }

    await supabase
      .from('UserStory')
      .update({ linearIssueId: issue.id, linearIssueUrl: issue.url })
      .eq('id', storyId)

    return NextResponse.json(
      {
        issueId: issue.id,
        issueUrl: issue.url,
        issueIdentifier: issue.identifier,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Linear export error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
