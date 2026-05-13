import { NextRequest, NextResponse } from 'next/server'
import { db as supabase } from '@/lib/supabase/server'
import { SessionContext } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { data: session, error: sessionError } = await supabase
      .from('Session')
      .select()
      .eq('id', id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      )
    }

    const { data: messages } = await supabase
      .from('Message')
      .select()
      .eq('sessionId', id)
      .order('createdAt', { ascending: true })

    const { data: feedbacks } = await supabase
      .from('Feedback')
      .select()
      .eq('sessionId', id)

    type FeedbackRow = { messageId: string; vote: string; reason: string | null }
    const feedbackMap = new Map(
      (feedbacks ?? []).map((f: FeedbackRow) => [f.messageId, { vote: f.vote, reason: f.reason }])
    )

    const context: SessionContext = {
      squad: session.squad,
      functionalityType: session.functionalityType as SessionContext['functionalityType'],
      currentPain: session.currentPain,
    }

    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status,
        context,
        createdAt: session.createdAt,
      },
      messages: (messages ?? []).map((m: { id: string; role: string; content: string; type: string | null; createdAt: string }) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        type: m.type,
        createdAt: m.createdAt,
        feedback: feedbackMap.get(m.id),
      })),
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
