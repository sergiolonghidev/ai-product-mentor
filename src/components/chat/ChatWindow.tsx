'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/types'
import { MessageBubble } from './MessageBubble'

type Props = {
  messages: Message[]
  sessionId: string
  isStreaming: boolean
  streamingContent: string
  onRefinement: (content: string, messageId: string) => void
}

export function ChatWindow({
  messages,
  sessionId,
  isStreaming,
  streamingContent,
  onRefinement,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          sessionId={sessionId}
          onRefinement={onRefinement}
        />
      ))}

      {isStreaming && streamingContent && (
        <div className="flex justify-start mb-4">
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 bg-white/5 border border-white/10">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">
              {streamingContent}
            </p>
            <span className="inline-block w-1 h-4 bg-white/50 animate-pulse ml-0.5" />
          </div>
        </div>
      )}

      {isStreaming && !streamingContent && (
        <div className="flex justify-start mb-4">
          <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white/5 border border-white/10">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
