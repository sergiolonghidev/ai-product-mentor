import { NextRequest, NextResponse } from 'next/server'
import { LintStorySchema } from '@/lib/validators/schemas'
import { buildLinterPrompt } from '@/lib/prompts/linter.prompt'
import { getPlaybookRules } from '@/lib/playbook/loader'
import { ai } from '@/lib/llm/client'
import { db as supabase } from '@/lib/supabase/server'
import { SessionContext, ComplianceRisk, UserStory, AcceptanceCriterion } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = LintStorySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      )
    }

    const { storyId, sessionId } = parsed.data

    const { data: storyRow, error: storyError } = await supabase
      .from('UserStory')
      .select()
      .eq('id', storyId)
      .single()

    if (storyError || !storyRow) {
      return NextResponse.json(
        { error: { code: 'STORY_NOT_FOUND', message: 'Story not found' } },
        { status: 404 }
      )
    }

    if (storyRow.lintResult) {
      return NextResponse.json(
        { error: { code: 'LINT_ALREADY_COMPLETE', message: 'Lint already completed' } },
        { status: 409 }
      )
    }

    const { data: session } = await supabase
      .from('Session')
      .select()
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json(
        { error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' } },
        { status: 404 }
      )
    }

    const context: SessionContext = {
      squad: session.squad,
      functionalityType: session.functionalityType as SessionContext['functionalityType'],
      currentPain: session.currentPain,
    }

    const criteria = (storyRow.criteria as AcceptanceCriterion[]) ?? []
    const story: UserStory = {
      id: storyRow.id,
      sessionId: storyRow.sessionId,
      messageId: storyRow.messageId,
      createdAt: storyRow.createdAt,
      persona: storyRow.persona,
      action: storyRow.action,
      benefit: storyRow.benefit,
      acceptanceCriteria: criteria,
    }

    const playbookRules = getPlaybookRules()
    const prompt = buildLinterPrompt(story, context, playbookRules)

    let lintContent = ''
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { maxOutputTokens: 1500, temperature: 0.1, thinkingConfig: { thinkingBudget: 0 } },
      })
      lintContent = response.text ?? ''
    } catch {
      return NextResponse.json(
        { error: { code: 'LLM_UNAVAILABLE', message: 'LLM service unavailable' } },
        { status: 503 }
      )
    }

    let risks: ComplianceRisk[] = []
    try {
      const jsonMatch = lintContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        risks = parsed.risks ?? []
      }
    } catch {
      risks = []
    }

    // Enforce max 2 red risks
    const redRisks = risks.filter(r => r.level === 'red')
    const nonRedRisks = risks.filter(r => r.level !== 'red')

    let finalRisks: ComplianceRisk[] = []
    if (redRisks.length <= 2) {
      finalRisks = [...redRisks, ...nonRedRisks]
    } else {
      const topTwo = redRisks.slice(0, 2)
      const remainder = redRisks.slice(2)
      const aggregated: ComplianceRisk = {
        id: 'risk-aggregated',
        level: 'amber',
        title: `${remainder.length} outros riscos críticos identificados`,
        description: 'Existem riscos adicionais que requerem atenção: ' +
          remainder.map(r => r.title).join(', '),
        normativeReference: 'Múltiplos normativos',
        suggestion: 'Revise a User Story com o time de Compliance para endereçar todos os riscos.',
      }
      finalRisks = [...topTwo, aggregated, ...nonRedRisks]
    }

    const lintResult = {
      completedAt: new Date().toISOString(),
      risks: finalRisks,
      summary: {
        critical: finalRisks.filter(r => r.level === 'red').length,
        warnings: finalRisks.filter(r => r.level === 'amber').length,
        ok: finalRisks.filter(r => r.level === 'red').length === 0,
      },
    }

    await supabase
      .from('UserStory')
      .update({ lintResult })
      .eq('id', storyId)

    return NextResponse.json({ storyId, lintResult })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
