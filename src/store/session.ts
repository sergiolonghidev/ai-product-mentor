import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SessionContext, Message } from '@/types'

type SessionStore = {
  sessionId: string | null
  context: SessionContext | null
  messages: Message[]
  setSession: (id: string, context: SessionContext) => void
  addMessage: (message: Message) => void
  updateLastMessage: (content: string) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      sessionId: null,
      context: null,
      messages: [],

      setSession: (id, context) =>
        set({ sessionId: id, context, messages: [] }),

      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

      updateLastMessage: (content) =>
        set((state) => {
          const msgs = [...state.messages]
          if (msgs.length > 0) {
            msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content }
          }
          return { messages: msgs }
        }),

      clearSession: () =>
        set({ sessionId: null, context: null, messages: [] }),
    }),
    { name: 'aipm-session' }
  )
)
