import { NextRequest, NextResponse } from 'next/server'
import { HandoffExportSchema } from '@/lib/validators/schemas'
import { getLinearClient } from '@/lib/linear/client'
import { db as supabase } from '@/lib/supabase/server'

const COMPLIANCE_LABEL_NAME = 'compliance'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = HandoffExportSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      )
    }

    const { sessionId, epics } = parsed.data

    if (!process.env.LINEAR_API_KEY || !process.env.LINEAR_TEAM_ID) {
      return NextResponse.json(
        { error: { code: 'LINEAR_NOT_CONFIGURED', message: 'Linear is not configured' } },
        { status: 503 }
      )
    }

    const TEAM_ID = process.env.LINEAR_TEAM_ID
    const linear = getLinearClient()

    // Resolve or create compliance label once
    let complianceLabelId: string | null = null
    const existingLabels = await linear.issueLabels({
      filter: { team: { id: { eq: TEAM_ID } } },
    })
    const existingLabel = existingLabels.nodes.find(
      (l) => l.name.toLowerCase() === COMPLIANCE_LABEL_NAME
    )
    if (existingLabel) {
      complianceLabelId = existingLabel.id
    } else {
      const created = await linear.createIssueLabel({
        name: COMPLIANCE_LABEL_NAME,
        color: '#f97316',
        teamId: TEAM_ID,
      })
      const label = await created.issueLabel
      if (label) complianceLabelId = label.id
    }

    const exported: {
      epicId: string
      epicName: string
      linearProjectId?: string
      issues: { storyId: string; issueId: string; issueUrl: string }[]
    }[] = []
    const errors: { storyId: string; error: string }[] = []

    for (const epic of epics) {
      const activeIssues = epic.issues.filter((i) => !i.removed)
      if (activeIssues.length === 0) continue

      // Create a Linear Project for this epic
      let linearProjectId: string | undefined
      try {
        const projectPayload = await linear.createProject({
          name: epic.name,
          teamIds: [TEAM_ID],
        })
        const project = await projectPayload.project
        linearProjectId = project?.id
      } catch (err) {
        console.error(`Failed to create project for epic ${epic.name}:`, err)
      }

      const epicResult: (typeof exported)[number] = {
        epicId: epic.id,
        epicName: epic.name,
        linearProjectId,
        issues: [],
      }

      for (const issue of activeIssues) {
        try {
          const isCompliance = epic.type === 'compliance'
          const title = issue.isSpike ? `[Spike] ${issue.title}` : issue.title
          const labelIds = isCompliance && complianceLabelId ? [complianceLabelId] : []

          const issuePayload = await linear.createIssue({
            title,
            description: issue.description,
            teamId: TEAM_ID,
            ...(linearProjectId && { projectId: linearProjectId }),
            ...(labelIds.length > 0 && { labelIds }),
          })

          const created = await issuePayload.issue
          if (!created) throw new Error('Issue creation returned null')

          await supabase
            .from('UserStory')
            .update({ linearIssueId: created.id, linearIssueUrl: created.url })
            .eq('id', issue.storyId)
            .eq('sessionId', sessionId)

          epicResult.issues.push({
            storyId: issue.storyId,
            issueId: created.id,
            issueUrl: created.url,
          })
        } catch (err) {
          errors.push({
            storyId: issue.storyId,
            error: err instanceof Error ? err.message : 'Unknown error',
          })
        }
      }

      exported.push(epicResult)
    }

    return NextResponse.json({ exported, errors }, { status: 200 })
  } catch (err) {
    console.error('Handoff export error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
