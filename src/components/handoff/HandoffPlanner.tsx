'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EpicCard } from './EpicCard'
import { ConfirmationModal } from './ConfirmationModal'

type HandoffIssue = {
  storyId: string
  title: string
  description: string
  isSpike: boolean
  removed: boolean
}

type Epic = {
  id: string
  name: string
  type: 'development' | 'compliance' | 'spike' | 'custom'
  issues: HandoffIssue[]
}

type ExportResult = {
  exported: { epicId: string; epicName: string; linearProjectId?: string; issues: { storyId: string; issueId: string; issueUrl: string }[] }[]
  errors: { storyId: string; error: string }[]
}

type Props = {
  initialEpics: Epic[]
  analyticsAlert: boolean
  sessionId: string
  squad: string
}

export function HandoffPlanner({ initialEpics, analyticsAlert, sessionId, squad }: Props) {
  const router = useRouter()
  const [epics, setEpics] = useState<Epic[]>(initialEpics)
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [result, setResult] = useState<ExportResult | null>(null)

  const allEpicRefs = epics.map((e) => ({ id: e.id, name: e.name }))

  const renameEpic = (epicId: string, name: string) =>
    setEpics((prev) => prev.map((e) => e.id === epicId ? { ...e, name } : e))

  const toggleRemoveIssue = (epicId: string, storyId: string) =>
    setEpics((prev) => prev.map((e) =>
      e.id !== epicId ? e : {
        ...e,
        issues: e.issues.map((i) => i.storyId === storyId ? { ...i, removed: !i.removed } : i),
      }
    ))

  const toggleSpikeIssue = (epicId: string, storyId: string) =>
    setEpics((prev) => prev.map((e) =>
      e.id !== epicId ? e : {
        ...e,
        issues: e.issues.map((i) => i.storyId === storyId ? { ...i, isSpike: !i.isSpike } : i),
      }
    ))

  const moveIssue = (storyId: string, fromEpicId: string, toEpicId: string) => {
    setEpics((prev) => {
      const issue = prev.find((e) => e.id === fromEpicId)?.issues.find((i) => i.storyId === storyId)
      if (!issue) return prev
      return prev.map((e) => {
        if (e.id === fromEpicId) return { ...e, issues: e.issues.filter((i) => i.storyId !== storyId) }
        if (e.id === toEpicId) return { ...e, issues: [...e.issues, issue] }
        return e
      })
    })
  }

  const addAnalyticsIssue = () => {
    const devEpic = epics.find((e) => e.type === 'development') ?? epics[0]
    if (!devEpic) return

    const analyticsIssue: HandoffIssue = {
      storyId: `analytics-${Date.now()}`,
      title: `Como PM do squad ${squad}, quero rastrear os eventos principais da funcionalidade`,
      description: [
        '## User Story',
        `**Como** PM do squad ${squad}, **quero** rastrear os eventos principais da funcionalidade, **para** validar as métricas de sucesso definidas no PRD.`,
        '',
        '## Critérios de Aceite',
        '- **[Funcional]** Eventos de início, conclusão e erro do fluxo principal são rastreados',
        '- **[Funcional]** Dashboard de analytics reflete os eventos em até 24h',
        '- **[Performance]** Taxa de captura de eventos ≥ 99% em condições normais',
      ].join('\n'),
      isSpike: false,
      removed: false,
    }

    setEpics((prev) => prev.map((e) =>
      e.id === devEpic.id ? { ...e, issues: [...e.issues, analyticsIssue] } : e
    ))
    setAlertDismissed(true)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/handoff/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, epics }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        setShowConfirm(false)
      }
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setExporting(false)
    }
  }

  const totalActive = epics.reduce(
    (sum, e) => sum + e.issues.filter((i) => !i.removed).length, 0
  )

  if (result) {
    const totalExported = result.exported.reduce((s, e) => s + e.issues.length, 0)
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-white">Handoff concluído</p>
          <p className="text-sm text-white/50">
            {totalExported} issue{totalExported !== 1 ? 's' : ''} criado{totalExported !== 1 ? 's' : ''} no Linear
          </p>
        </div>
        <div className="space-y-3">
          {result.exported.map((e) => (
            <div key={e.epicId} className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 space-y-2">
              <p className="text-sm font-semibold text-white">{e.epicName}</p>
              {e.issues.map((i) => (
                <a
                  key={i.issueId}
                  href={i.issueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <span>↗</span>
                  <span>{i.issueId}</span>
                </a>
              ))}
            </div>
          ))}
          {result.errors.length > 0 && (
            <p className="text-xs text-red-400">
              {result.errors.length} issue{result.errors.length !== 1 ? 's' : ''} com erro — verifique o Linear e tente novamente.
            </p>
          )}
        </div>
        <button
          onClick={() => router.push('/chat')}
          className="w-full text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          Voltar ao chat
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analytics alert (CA#7) */}
      {analyticsAlert && !alertDismissed && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-xs text-amber-400/90">
            Nenhum issue de tracking identificado
          </p>
          <button
            onClick={addAnalyticsIssue}
            className="flex-shrink-0 text-xs text-amber-400 hover:text-amber-300 border border-amber-500/30 rounded px-2 py-1 transition-colors"
          >
            + Adicionar analytics
          </button>
        </div>
      )}

      {/* Epic list */}
      <div className="space-y-4">
        {epics.map((epic) => (
          <EpicCard
            key={epic.id}
            epic={epic}
            allEpics={allEpicRefs}
            onRename={renameEpic}
            onToggleRemoveIssue={toggleRemoveIssue}
            onToggleSpikeIssue={toggleSpikeIssue}
            onMoveIssue={moveIssue}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => router.push('/chat')}
          className="text-sm text-white/30 hover:text-white/60 transition-colors"
        >
          ← Voltar
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={totalActive === 0}
          className="text-sm bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg transition-colors"
        >
          Enviar ao Linear ({totalActive})
        </button>
      </div>

      {showConfirm && (
        <ConfirmationModal
          epics={epics}
          onConfirm={handleExport}
          onCancel={() => setShowConfirm(false)}
          exporting={exporting}
        />
      )}
    </div>
  )
}
