'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { ReasonChips } from './ReasonChips'
import { FeedbackReason } from '@/types'

type Props = {
  messageId: string
  sessionId: string
  onRefinement?: (content: string, messageId: string) => void
}

type State = 'idle' | 'down_chips' | 'submitted'

export function FeedbackBar({ messageId, sessionId, onRefinement }: Props) {
  const [state, setState] = useState<State>('idle')
  const [vote, setVote] = useState<'up' | 'down' | null>(null)
  const [selectedReason, setSelectedReason] = useState<FeedbackReason | undefined>()
  const [loading, setLoading] = useState(false)

  const submitFeedback = async (v: 'up' | 'down', reason?: FeedbackReason) => {
    setLoading(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, messageId, vote: v, reason }),
      })
      const data = await res.json()

      if (data.refinementTriggered && data.refinementContent && onRefinement) {
        onRefinement(data.refinementContent, data.refinementMessageId)
      }
      setState('submitted')
    } catch {
      // fail silently
    } finally {
      setLoading(false)
    }
  }

  const handleUp = () => {
    if (state !== 'idle') return
    setVote('up')
    submitFeedback('up')
  }

  const handleDown = () => {
    if (state !== 'idle') return
    setVote('down')
    setState('down_chips')
  }

  const handleReason = (reason: FeedbackReason) => {
    setSelectedReason(reason)
    submitFeedback('down', reason)
  }

  if (state === 'submitted') {
    return (
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-white/30">
          {vote === 'up' ? 'Obrigado pelo feedback!' : 'Refinamento enviado.'}
        </span>
      </div>
    )
  }

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        <button
          onClick={handleUp}
          disabled={state !== 'idle'}
          className={`p-1.5 rounded transition-colors ${
            vote === 'up'
              ? 'text-green-400'
              : 'text-white/30 hover:text-white/60'
          }`}
          title="Útil"
        >
          <ThumbsUp size={14} />
        </button>
        <button
          onClick={handleDown}
          disabled={state !== 'idle'}
          className={`p-1.5 rounded transition-colors ${
            vote === 'down'
              ? 'text-red-400'
              : 'text-white/30 hover:text-white/60'
          }`}
          title="Não útil"
        >
          <ThumbsDown size={14} />
        </button>
      </div>

      {state === 'down_chips' && (
        <ReasonChips
          onSelect={handleReason}
          isLoading={loading}
          selected={selectedReason}
        />
      )}
    </div>
  )
}
