'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/session'
import { HandoffPlanner } from '@/components/handoff/HandoffPlanner'

type Epic = {
  id: string
  name: string
  type: 'development' | 'compliance' | 'spike' | 'custom'
  issues: { storyId: string; title: string; description: string; isSpike: boolean; removed: boolean }[]
}

export default function HandoffPage() {
  const router = useRouter()
  const { sessionId, context } = useSessionStore()
  const [epics, setEpics] = useState<Epic[] | null>(null)
  const [analyticsAlert, setAnalyticsAlert] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) { router.replace('/onboarding'); return }

    fetch('/api/handoff/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error.code === 'NO_STORIES'
            ? 'Não há User Stories para exportar nesta sessão.'
            : data.error.message)
        } else {
          setEpics(data.epics)
          setAnalyticsAlert(data.analyticsAlert)
        }
      })
      .catch(() => setError('Erro ao carregar o plano. Tente novamente.'))
      .finally(() => setLoading(false))
  }, [sessionId, router])

  if (!sessionId) return null

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <h1 className="text-sm font-semibold text-white">Handoff para o Linear</h1>
          {context && <p className="text-xs text-white/40">{context.squad}</p>}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl w-full mx-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center space-y-4 py-16">
            <p className="text-sm text-white/50">{error}</p>
            <button
              onClick={() => router.push('/chat')}
              className="text-xs text-white/30 hover:text-white/60 underline"
            >
              Voltar ao chat
            </button>
          </div>
        )}

        {epics && sessionId && (
          <HandoffPlanner
            initialEpics={epics}
            analyticsAlert={analyticsAlert}
            sessionId={sessionId}
            squad={context?.squad ?? 'Squad'}
          />
        )}
      </div>
    </main>
  )
}
