import { NextRequest } from 'next/server'
import { GeneratePRDSchema } from '@/lib/validators/schemas'
import { buildPRDPrompt } from '@/lib/prompts/prd.prompt'
import { getPlaybookRules } from '@/lib/playbook/loader'
import { ai } from '@/lib/llm/client'
import { db as supabase } from '@/lib/supabase/server'
import { PRDCriterion, RegulatoryRestriction } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = GeneratePRDSchema.safeParse(body)

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { squad, phase, input, sessionId } = parsed.data
    const playbookRules = getPlaybookRules()
    const prompt = buildPRDPrompt(squad, phase, input, playbookRules)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = ''

        try {
          const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { maxOutputTokens: 4096, temperature: 0.3, thinkingConfig: { thinkingBudget: 0 } },
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

          // Parse PRD JSON
          let prdData: {
            title: string
            context: string
            problem: string
            impactedUsers: string
            solution: string
            acceptanceCriteria: PRDCriterion[]
            regulatoryRestrictions: RegulatoryRestriction[]
            metrics: string
            dependencies: string
            risks: string
          } | null = null

          try {
            const stripped = fullContent.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim()
            const jsonMatch = stripped.match(/\{[\s\S]*\}/)
            if (jsonMatch) prdData = JSON.parse(jsonMatch[0])
          } catch {
            // parse failed — prdId will be null, client shows raw content
          }

          let prdId: string | null = null

          if (prdData) {
            const { data: saved, error } = await supabase
              .from('PRD')
              .insert({
                sessionId: sessionId ?? null,
                squad,
                phase,
                title: prdData.title,
                context: prdData.context,
                problem: prdData.problem,
                impactedUsers: prdData.impactedUsers,
                solution: prdData.solution,
                criteria: prdData.acceptanceCriteria,
                regulatoryRestrictions: prdData.regulatoryRestrictions,
                metrics: prdData.metrics,
                dependencies: prdData.dependencies,
                risks: prdData.risks,
              })
              .select()
              .single()

            if (error) console.error('PRD insert error:', error)
            prdId = saved?.id ?? null
          }

          controller.enqueue(
            encoder.encode(
              `event: prd_complete\ndata: ${JSON.stringify({
                prdId,
                prd: prdData
                  ? { ...prdData, id: prdId, squad, phase }
                  : null,
              })}\n\n`
            )
          )
          controller.enqueue(encoder.encode('event: done\ndata: {}\n\n'))
        } catch (err) {
          console.error('PRD stream error:', err)
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ code: 'LLM_UNAVAILABLE' })}\n\n`)
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
    console.error('PRD generate error:', err)
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
