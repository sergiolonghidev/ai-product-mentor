import { NextRequest, NextResponse } from 'next/server'
import { UpdatePRDSchema } from '@/lib/validators/schemas'
import { db as supabase } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabase
    .from('PRD')
    .select()
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: { code: 'PRD_NOT_FOUND', message: 'PRD not found' } },
      { status: 404 }
    )
  }

  return NextResponse.json({
    prd: {
      id: data.id,
      squad: data.squad,
      phase: data.phase,
      title: data.title,
      context: data.context,
      problem: data.problem,
      impactedUsers: data.impactedUsers,
      solution: data.solution,
      acceptanceCriteria: data.criteria,
      regulatoryRestrictions: data.regulatoryRestrictions,
      metrics: data.metrics,
      dependencies: data.dependencies,
      risks: data.risks,
      editedAt: data.editedAt,
      createdAt: data.createdAt,
    },
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const parsed = UpdatePRDSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      )
    }

    const { sessionId, acceptanceCriteria, regulatoryRestrictions, ...rest } = parsed.data

    // Build update payload — map to DB column names
    const updates: Record<string, unknown> = { editedAt: new Date().toISOString() }
    const fieldMap: Record<string, string> = {
      title: 'title',
      context: 'context',
      problem: 'problem',
      impactedUsers: 'impactedUsers',
      solution: 'solution',
      metrics: 'metrics',
      dependencies: 'dependencies',
      risks: 'risks',
    }

    for (const [key, col] of Object.entries(fieldMap)) {
      const val = (rest as Record<string, unknown>)[key]
      if (val !== undefined) updates[col] = val
    }

    if (acceptanceCriteria !== undefined) updates.criteria = acceptanceCriteria
    if (regulatoryRestrictions !== undefined) updates.regulatoryRestrictions = regulatoryRestrictions

    // Build query — if sessionId provided, scope to it; otherwise open (PRD has no mandatory session)
    let query = supabase.from('PRD').update(updates).eq('id', params.id)
    if (sessionId) query = query.eq('sessionId', sessionId)

    const { data: updated, error } = await query.select().single()

    if (error || !updated) {
      return NextResponse.json(
        { error: { code: 'PRD_NOT_FOUND', message: 'PRD not found' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      prd: {
        id: updated.id,
        squad: updated.squad,
        phase: updated.phase,
        title: updated.title,
        context: updated.context,
        problem: updated.problem,
        impactedUsers: updated.impactedUsers,
        solution: updated.solution,
        acceptanceCriteria: updated.criteria,
        regulatoryRestrictions: updated.regulatoryRestrictions,
        metrics: updated.metrics,
        dependencies: updated.dependencies,
        risks: updated.risks,
        editedAt: updated.editedAt,
      },
    })
  } catch (err) {
    console.error('PATCH PRD error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
