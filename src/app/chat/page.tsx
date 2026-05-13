'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/session'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { InputBar } from '@/components/chat/InputBar'
import { Message } from '@/types'

export default function ChatPage() {
  const router = useRouter()
  const { sessionId, context, messages, addMessage } = useSessionStore()
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')

  useEffect(() => {
    if (!sessionId) {
      router.replace('/onboarding')
    }
  }, [sessionId, router])

  const handleRefinement = useCallback(
    (content: string, msgId: string) => {
      addMessage({
        id: msgId,
        sessionId: sessionId!,
        createdAt: new Date().toISOString(),
        role: 'assistant',
        content,
        metadata: { type: 'refinement' },
      })
    },
    [sessionId, addMessage]
  )

  const streamFromEndpoint = async (
    endpoint: string,
    body: Record<string, string>,
    type: 'general' | 'user_story'
  ) => {
    if (!sessionId) return

    setIsStreaming(true)
    setStreamingContent('')

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
        body: JSON.stringify({ sessionId, ...body }),
      })

      if (!res.ok || !res.body) {
        throw new Error('Stream failed')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let finalMessageId: string | null = null
      let finalStoryId: string | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.text !== undefined) {
                accumulated += data.text
                setStreamingContent(accumulated)
              }
              if (data.messageId) finalMessageId = data.messageId
              if (data.storyId) finalStoryId = data.storyId
            } catch {
              // skip malformed
            }
          }
        }
      }

      if (accumulated) {
        addMessage({
          id: finalMessageId ?? crypto.randomUUID(),
          sessionId,
          createdAt: new Date().toISOString(),
          role: 'assistant',
          content: accumulated,
          metadata: { type, storyId: finalStoryId ?? undefined },
        })
      }
    } catch (err) {
      console.error('Stream error:', err)
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
    }
  }

  const handleSend = (content: string) => {
    addMessage({
      id: crypto.randomUUID(),
      sessionId: sessionId!,
      createdAt: new Date().toISOString(),
      role: 'user',
      content,
    })
    streamFromEndpoint('/api/chat/message', { content }, 'general')
  }

  const handleGenerateStory = (description: string) => {
    addMessage({
      id: crypto.randomUUID(),
      sessionId: sessionId!,
      createdAt: new Date().toISOString(),
      role: 'user',
      content: description,
    })
    streamFromEndpoint('/api/story/generate', { description }, 'user_story')
  }

  if (!sessionId) return null

  return (
    <div className="h-screen bg-gray-950 flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <h1 className="text-sm font-semibold text-white">AI Product Mentor</h1>
          {context && (
            <p className="text-xs text-white/40">{context.squad}</p>
          )}
        </div>
        <button
          onClick={() => {
            useSessionStore.getState().clearSession()
            router.push('/onboarding')
          }}
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Nova sessão
        </button>
      </header>

      <ChatWindow
        messages={messages as Message[]}
        sessionId={sessionId}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
        onRefinement={handleRefinement}
      />

      <InputBar
        onSend={handleSend}
        onGenerateStory={handleGenerateStory}
        disabled={isStreaming}
      />
    </div>
  )
}
