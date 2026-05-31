'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PRD } from '@/types'
import { PRDEditor } from '@/components/prd/PRDEditor'

function PRDEditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prdId = searchParams.get('id')

  const [prd, setPrd] = useState<PRD | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!prdId) { router.replace('/prd/onboarding'); return }

    // Fetch PRD from Supabase via a dedicated GET endpoint or use the data passed via query
    // For now, fetch from the generate endpoint result stored in sessionStorage
    const cached = sessionStorage.getItem(`prd-${prdId}`)
    if (cached) {
      try {
        setPrd(JSON.parse(cached))
        setLoading(false)
        return
      } catch { /* fall through to fetch */ }
    }

    // Fallback: fetch from API
    fetch(`/api/prd/${prdId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error.message)
        else setPrd(data.prd)
      })
      .catch(() => setError('Erro ao carregar PRD'))
      .finally(() => setLoading(false))
  }, [prdId, router])

  if (!prdId) return null

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <h1 className="text-sm font-semibold text-white">ProdPilot AI</h1>
          <p className="text-xs text-white/40">Editor de PRD</p>
        </div>
        <button
          onClick={() => router.push('/prd/onboarding')}
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Novo PRD
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl w-full mx-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-16 space-y-3">
            <p className="text-sm text-white/50">{error}</p>
            <button
              onClick={() => router.push('/prd/onboarding')}
              className="text-xs text-white/30 hover:text-white/60 underline"
            >
              Gerar novo PRD
            </button>
          </div>
        )}

        {prd && <PRDEditor initialPrd={prd} />}
      </div>
    </main>
  )
}

export default function PRDEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <PRDEditorContent />
    </Suspense>
  )
}
