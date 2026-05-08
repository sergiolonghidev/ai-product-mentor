'use client'

import { useState, useEffect } from 'react'
import { Message, UserStory, LintResult } from '@/types'
import { StoryBlock } from '@/components/story/StoryBlock'
import { LinterPanel } from '@/components/story/LinterPanel'
import { FeedbackBar } from '@/components/feedback/FeedbackBar'

type Props = {
  message: Message
  sessionId: string
  onRefinement?: (content: string, messageId: string) => void
}

export function MessageBubble({ message, sessionId, onRefinement }: Props) {
  const isUser = message.role === 'user'
  const isStory = message.metadata?.type === 'user_story'
  const isRefinement = message.metadata?.type === 'refinement'
  const isAssistant = !isUser

  const [storyData, setStoryData] = useState<UserStory | null>(null)
  const [lintResult, setLintResult] = useState<LintResult | null>(null)
  const [lintLoading, setLintLoading] = useState(false)

  useEffect(() => {
    if (!isStory) return

    // Try to parse story from content — strip markdown code fences if present
    try {
      const stripped = message.content.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim()
      const jsonMatch = stripped.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        setStoryData({
          id: '',
          sessionId,
          messageId: message.id,
          createdAt: message.createdAt,
          persona: parsed.persona ?? '',
          action: parsed.action ?? '',
          benefit: parsed.benefit ?? '',
          acceptanceCriteria: parsed.acceptanceCriteria ?? [],
        })
      }
    } catch {
      // Not parseable — show raw content
    }
  }, [message.id, message.content, message.createdAt, isStory, sessionId])

  const runLinter = async (storyId: string) => {
    setLintLoading(true)
    try {
      const res = await fetch('/api/story/lint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, sessionId }),
      })
      if (res.ok) {
        const data = await res.json()
        setLintResult(data.lintResult)
      }
    } finally {
      setLintLoading(false)
    }
  }

  const displayContent = isStory && storyData ? null : message.content

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-white/10 text-white rounded-tr-sm'
            : 'bg-white/5 border border-white/10 text-white rounded-tl-sm'
        }`}
      >
        {isRefinement && (
          <p className="text-xs text-white/40 mb-2 font-medium">↻ Versão refinada</p>
        )}

        {displayContent && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayContent}</p>
        )}

        {isStory && storyData && (
          <>
            <StoryBlock
              story={storyData}
              storyId={message.metadata?.storyId}
              sessionId={sessionId}
            />
            {!lintResult && !lintLoading && message.metadata?.storyId && (
              <button
                onClick={() => runLinter(message.metadata!.storyId!)}
                className="mt-3 text-xs text-white/40 hover:text-white/60 underline transition-colors"
              >
                Verificar compliance
              </button>
            )}
            <LinterPanel lintResult={lintResult} isLoading={lintLoading} />
          </>
        )}

        {isAssistant && (
          <FeedbackBar
            messageId={message.id}
            sessionId={sessionId}
            onRefinement={onRefinement}
          />
        )}
      </div>
    </div>
  )
}
