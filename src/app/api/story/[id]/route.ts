import { NextRequest, NextResponse } from 'next/server'
import { UpdateStorySchema } from '@/lib/validators/schemas'
import { db as supabase } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id
    const body = await req.json()
    const parsed = UpdateStorySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      )
    }

    const { sessionId, persona, action, benefit, acceptanceCriteria } = parsed.data

    const { data: existing, error: fetchError } = await supabase
      .from('UserStory')
      .select('id')
      .eq('id', storyId)
      .eq('sessionId', sessionId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: { code: 'STORY_NOT_FOUND', message: 'Story not found' } },
        { status: 404 }
      )
    }

    const updates: Record<string, unknown> = {}
    if (persona !== undefined) updates.persona = persona
    if (action !== undefined) updates.action = action
    if (benefit !== undefined) updates.benefit = benefit
    if (acceptanceCriteria !== undefined) updates.criteria = acceptanceCriteria

    const { data: updated, error: updateError } = await supabase
      .from('UserStory')
      .update(updates)
      .eq('id', storyId)
      .select()
      .single()

    if (updateError || !updated) {
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Update failed' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      story: {
        id: updated.id,
        sessionId: updated.sessionId,
        persona: updated.persona,
        action: updated.action,
        benefit: updated.benefit,
        acceptanceCriteria: updated.criteria,
      },
      lintQueued: acceptanceCriteria !== undefined,
    })
  } catch (err) {
    console.error('PATCH story error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
