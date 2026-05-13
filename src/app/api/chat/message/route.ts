import { NextRequest } from 'next/server'
import { SendMessageSchema } from '@/lib/validators/schemas'
import { buildChatPrompt } from '@/lib/prompts/story.prompt'
import { ai } from '@/lib/llm/client'
import { db as supabase } from '@/lib/supabase/server'
import { SessionContext } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = SendMessageSchema.safeParse(body)

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { sessionId, content } = parsed.data

    // Fetch session
    const { data: session, error: sessionError } = await supabase
      .from('Session')
      .select()
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' } }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fetch conversation history
    const { data: messages } = await supabase
      .from('Message')
      .select()
      .eq('sessionId', sessionId)
      .order('createdAt', { ascending: true })
      .limit(20)

    const context: SessionContext = {
      squad: session.squad,
      functionalityType: session.functionalityType as SessionContext['functionalityType'],
      currentPain: session.currentPain,
    }

    const history = (messages ?? []).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    // Save user message
    await supabase.from('Message').insert({
      sessionId,
      role: 'user',
      content,
      type: 'general',
    })

    // Stream response
    const prompt = buildChatPrompt(content, context, history)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = ''

        try {
          const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { maxOutputTokens: 1200, temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } },
          })

          for await (const chunk of response) {
            const text = chunk.text ?? ''
            if (text) {
              fullContent += text
              controller.enqueue(
                encoder.encode(`event: chunk\ndata: ${JSON.stringify({ text })}\n\n`)
              )
            }
          }

          // Save assistant message
          const { data: savedMsg } = await supabase
            .from('Message')
            .insert({
              sessionId,
              role: 'assistant',
              content: fullContent,
              type: 'general',
            })
            .select()
            .single()

          controller.enqueue(
            encoder.encode(
              `event: message_complete\ndata: ${JSON.stringify({
                messageId: savedMsg?.id ?? crypto.randomUUID(),
                type: 'general',
              })}\n\n`
            )
          )
          controller.enqueue(encoder.encode('event: done\ndata: {}\n\n'))
        } catch (err) {
          console.error('Stream error:', err)
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({ code: 'LLM_UNAVAILABLE' })}\n\n`
            )
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
