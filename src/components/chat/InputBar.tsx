'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

type Props = {
  onSend: (message: string) => void
  onGenerateStory: (description: string) => void
  disabled?: boolean
}

export function InputBar({ onSend, onGenerateStory, disabled }: Props) {
  const [value, setValue] = useState('')
  const [mode, setMode] = useState<'chat' | 'story'>('chat')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    if (mode === 'story') {
      onGenerateStory(trimmed)
    } else {
      onSend(trimmed)
    }
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    }
  }

  return (
    <div className="border-t border-white/10 p-4 bg-gray-950">
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setMode('chat')}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            mode === 'chat'
              ? 'bg-white/10 border-white/30 text-white'
              : 'border-white/10 text-white/40 hover:text-white/60'
          }`}
        >
          Conversa
        </button>
        <button
          onClick={() => setMode('story')}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            mode === 'story'
              ? 'bg-white/10 border-white/30 text-white'
              : 'border-white/10 text-white/40 hover:text-white/60'
          }`}
        >
          Gerar User Story
        </button>
      </div>

      <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-white/25 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={
            mode === 'story'
              ? 'Descreva a funcionalidade para gerar uma User Story...'
              : 'Digite sua mensagem...'
          }
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 focus:outline-none resize-none min-h-[24px] max-h-40 leading-relaxed disabled:opacity-40"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="p-1.5 rounded-lg text-white/40 hover:text-white disabled:opacity-20 transition-colors flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
      <p className="text-xs text-white/20 mt-1.5 text-center">
        Enter para enviar · Shift+Enter para quebrar linha
      </p>
    </div>
  )
}
