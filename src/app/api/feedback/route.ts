import { NextRequest, NextResponse } from 'next/server'
import { SubmitFeedbackSchema } from '@/lib/validators/schemas'
import { buildRefinementPrompt } from '@/lib/prompts/refinement.prompt'
import { ai } from '@/lib/llm/client'
import { db as supabase } from '@/lib/supabase/server'
import { SessionContext, FeedbackReason, Message } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = SubmitFeedbackSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      )
    }

    const { sessionId, messageId, vote, reason } = parsed.data

    // Check message exists
    const { data: message, error: msgError } = await supabase
      .from('Message')
      .select()
      .eq('id', messageId)
      .single()

    if (msgError || !message) {
      return NextResponse.json(
        { error: { code: 'MESSAGE_NOT_FOUND', message: 'Message not found' } },
        { status: 404 }
      )
    }

    // Check for existing feedback
    const { data: existingFeedback } = await supabase
      .from('Feedback')
      .select()
      .eq('messageId', messageId)
      .single()

    if (existingFeedback) {
      return NextResponse.json(
        { error: { code: 'FEEDBACK_ALREADY_EXISTS', message: 'Feedback already exists' } },
        { status: 409 }
      )
    }

    // Save feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('Feedback')
      .insert({ sessionId, messageId, vote, reason })
      .select()
      .single()

    if (feedbackError || !feedback) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to save feedback' } },
        { status: 500 }
      )
    }

    if (vote === 'up' || !reason) {
      return NextResponse.json({ feedbackId: feedback.id, refinementTriggered: false }, { status: 201 })
    }

    // Trigger refinement for thumbs down
    const { data: session } = await supabase
      .from('Session')
      .select()
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json({ feedbackId: feedback.id, refinementTriggered: false }, { status: 201 })
    }

    const context: SessionContext = {
      squad: session.squad,
      functionalityType: session.functionalityType as SessionContext['functionalityType'],
      currentPain: session.currentPain,
    }

    const originalMessage: Message = {
      id: message.id,
      sessionId: message.sessionId,
      createdAt: message.createdAt,
      role: message.role as 'user' | 'assistant',
      content: message.content,
    }

    const prompt = buildRefinementPrompt(originalMessage, reason as FeedbackReason, context)

    let refinementContent = ''
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { maxOutputTokens: 900, temperature: 0.6, thinkingConfig: { thinkingBudget: 0 } },
      })
      refinementContent = response.text ?? ''
    } catch {
      return NextResponse.json({ feedbackId: feedback.id, refinementTriggered: false }, { status: 201 })
    }

    const { data: refinementMsg } = await supabase
      .from('Message')
      .insert({
        sessionId,
        role: 'assistant',
        content: refinementContent,
        type: 'refinement',
      })
      .select()
      .single()

    return NextResponse.json(
      {
        feedbackId: feedback.id,
        refinementTriggered: true,
        refinementMessageId: refinementMsg?.id,
        refinementContent,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
