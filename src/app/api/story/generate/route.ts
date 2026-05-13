import { NextRequest } from 'next/server'
import { GenerateStorySchema } from '@/lib/validators/schemas'
import { buildStoryPrompt } from '@/lib/prompts/story.prompt'
import { ai } from '@/lib/llm/client'
import { db as supabase } from '@/lib/supabase/server'
import { SessionContext, AcceptanceCriterion } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = GenerateStorySchema.safeParse(body)

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { sessionId, description } = parsed.data

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

    const { data: messages } = await supabase
      .from('Message')
      .select()
      .eq('sessionId', sessionId)
      .order('createdAt', { ascending: true })
      .limit(10)

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
      content: description,
      type: 'general',
    })

    const prompt = buildStoryPrompt(description, context, history)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = ''

        try {
          const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { maxOutputTokens: 2048, temperature: 0.3, thinkingConfig: { thinkingBudget: 0 } },
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

          // Parse story JSON — strip markdown code fences if present
          let storyData: {
            persona: string
            action: string
            benefit: string
            acceptanceCriteria: AcceptanceCriterion[]
          } | null = null

          try {
            const stripped = fullContent.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim()
            const jsonMatch = stripped.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              storyData = JSON.parse(jsonMatch[0])
            }
          } catch {
            // Story parsing failed — use raw content
          }

          // Save assistant message
          const { data: savedMsg, error: msgErr } = await supabase
            .from('Message')
            .insert({
              sessionId,
              role: 'assistant',
              content: fullContent,
              type: 'user_story',
            })
            .select()
            .single()

          if (msgErr) console.error('Message insert error:', msgErr)

          const messageId = savedMsg?.id ?? crypto.randomUUID()
          let storyId: string | null = null

          if (storyData && savedMsg?.id) {
            const { data: savedStory, error: storyErr } = await supabase
              .from('UserStory')
              .insert({
                sessionId,
                messageId,
                persona: storyData.persona,
                action: storyData.action,
                benefit: storyData.benefit,
                criteria: storyData.acceptanceCriteria,
              })
              .select()
              .single()

            if (storyErr) console.error('UserStory insert error:', storyErr)
            storyId = savedStory?.id ?? null
          }

          controller.enqueue(
            encoder.encode(
              `event: story_complete\ndata: ${JSON.stringify({
                storyId,
                messageId,
                story: storyData,
                lintStatus: storyId ? 'pending' : 'unavailable',
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
