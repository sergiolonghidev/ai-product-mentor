import { NextRequest, NextResponse } from 'next/server'
import { StartSessionSchema } from '@/lib/validators/schemas'
import { buildOnboardingPrompt } from '@/lib/prompts/onboarding.prompt'
import { ai } from '@/lib/llm/client'
import { db as supabase } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = StartSessionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      )
    }

    const { context } = parsed.data

    // Create session in Supabase
    const { data: session, error: sessionError } = await supabase
      .from('Session')
      .insert({
        squad: context.squad,
        functionalityType: context.functionalityType,
        currentPain: context.currentPain,
        status: 'active',
      })
      .select()
      .single()

    if (sessionError || !session) {
      console.error('Session insert error:', sessionError)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to create session' } },
        { status: 500 }
      )
    }

    // Generate welcome message
    const prompt = buildOnboardingPrompt(context)

    let welcomeContent = ''
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { maxOutputTokens: 600, temperature: 0.5, thinkingConfig: { thinkingBudget: 0 } },
      })
      welcomeContent = response.text ?? ''
    } catch (llmError) {
      console.error('LLM error:', llmError)
      return NextResponse.json(
        { error: { code: 'LLM_UNAVAILABLE', message: 'LLM service unavailable' } },
        { status: 503 }
      )
    }

    // Save welcome message
    const { data: welcomeMsg, error: msgError } = await supabase
      .from('Message')
      .insert({
        sessionId: session.id,
        role: 'assistant',
        content: welcomeContent,
        type: 'onboarding_response',
      })
      .select()
      .single()

    if (msgError || !welcomeMsg) {
      console.error('Message insert error:', msgError)
    }

    return NextResponse.json(
      {
        session: {
          id: session.id,
          status: 'active',
          context,
          createdAt: session.createdAt,
        },
        welcomeMessage: {
          id: welcomeMsg?.id ?? crypto.randomUUID(),
          content: welcomeContent,
          type: 'onboarding_response',
        },
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
