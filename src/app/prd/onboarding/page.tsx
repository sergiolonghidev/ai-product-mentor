'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/session'

type Phase = 'discovery' | 'ready_to_build' | 'post_launch'

const PHASE_OPTIONS: { value: Phase; label: string; description: string }[] = [
  { value: 'discovery',       label: 'Discovery',               description: 'Ainda explorando o problema e a solução' },
  { value: 'ready_to_build',  label: 'Pronto para desenvolver', description: 'Solução definida, pronto para spec técnica' },
  { value: 'post_launch',     label: 'Pós-lançamento',          description: 'Feature lançada, avaliando impacto' },
]

export default function PRDOnboardingPage() {
  const router = useRouter()
  const { context } = useSessionStore()

  const [squad, setSquad] = useState(context?.squad ?? '')
  const [phase, setPhase] = useState<Phase>('discovery')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = squad.trim().length > 0 && input.trim().length >= 10

  const handleGenerate = async () => {
    if (!isValid) return
    setLoading(true)
    setError(null)

    const sessionId = useSessionStore.getState().sessionId

    try {
      const res = await fetch('/api/prd/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ squad, phase, input, sessionId }),
      })

      if (!res.ok || !res.body) throw new Error('Falha ao iniciar geração')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let prdId: string | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.prdId) prdId = data.prdId
            } catch { /* skip */ }
          }
        }
      }

      if (prdId) {
        router.push(`/prd/editor?id=${prdId}`)
      } else {
        setError('PRD gerado mas não foi possível salvar. Tente novamente.')
      }
    } catch {
      setError('Erro ao gerar PRD. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <h1 className="text-sm font-semibold text-white">ProdPilot AI</h1>
          <p className="text-xs text-white/40">Escrever PRD</p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          ← Voltar
        </button>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-white">Descreva a feature ou cole a ata</h2>
            <p className="text-xs text-white/40">O ProdPilot gera o PRD estruturado com restrições regulatórias</p>
          </div>

          {/* Squad */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest">Squad ou Produto</label>
            <input
              type="text"
              value={squad}
              onChange={(e) => setSquad(e.target.value)}
              placeholder="ex: Credit Cards — Aquisição"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"
            />
          </div>

          {/* Phase */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest">Fase do produto</label>
            <div className="space-y-2">
              {PHASE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                    phase === opt.value
                      ? 'border-white/20 bg-white/5'
                      : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="phase"
                    value={opt.value}
                    checked={phase === opt.value}
                    onChange={() => setPhase(opt.value)}
                    className="mt-0.5 accent-violet-500"
                  />
                  <div>
                    <p className="text-sm text-white/80 font-medium">{opt.label}</p>
                    <p className="text-xs text-white/40">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
              Descrição da feature ou ata de reunião
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
              placeholder="Descreva a feature, cole uma ata de reunião ou escreva o contexto que você tem. Quanto mais contexto, melhor o PRD gerado."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 resize-y"
            />
            <p className="text-xs text-white/20 text-right">{input.length} chars</p>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={!isValid || loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? 'Gerando PRD...' : 'Gerar PRD'}
          </button>
        </div>
      </div>
    </main>
  )
}
