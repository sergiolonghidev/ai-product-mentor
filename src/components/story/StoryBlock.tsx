'use client'

import { useState } from 'react'
import { UserStory, AcceptanceCriterion } from '@/types'

const categoryColors: Record<AcceptanceCriterion['category'], string> = {
  functional: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  compliance: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  ux: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  performance: 'bg-green-500/20 text-green-300 border-green-500/30',
}

const categoryLabels: Record<AcceptanceCriterion['category'], string> = {
  functional: 'Funcional',
  compliance: 'Compliance',
  ux: 'UX',
  performance: 'Performance',
}

const CATEGORIES = Object.keys(categoryLabels) as AcceptanceCriterion['category'][]

const GENERIC_PHRASES = [
  'funcionar corretamente',
  'funcione corretamente',
  'deve funcionar',
  'estar disponível',
  'esteja disponível',
]

function isGenericCriterion(description: string): boolean {
  const lower = description.toLowerCase()
  return GENERIC_PHRASES.some((p) => lower.includes(p))
}

function hasFormatWarning(
  persona: string,
  action: string,
  benefit: string
): boolean {
  return (
    !persona.startsWith('Como ') ||
    !action.startsWith('Quero ') ||
    (!benefit.startsWith('Para que ') && !benefit.startsWith('Para '))
  )
}

type ExportState = 'idle' | 'loading' | 'exported' | 'error'

type Props = {
  story: Pick<UserStory, 'persona' | 'action' | 'benefit' | 'acceptanceCriteria'>
  storyId?: string
  sessionId?: string
  onUpdate?: (updated: Pick<UserStory, 'persona' | 'action' | 'benefit' | 'acceptanceCriteria'>) => void
  onRequestLint?: () => void
}

export function StoryBlock({ story, storyId, sessionId, onUpdate, onRequestLint }: Props) {
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [draft, setDraft] = useState({
    persona: story.persona,
    action: story.action,
    benefit: story.benefit,
    acceptanceCriteria: story.acceptanceCriteria,
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [exportState, setExportState] = useState<ExportState>('idle')
  const [issueIdentifier, setIssueIdentifier] = useState<string | null>(null)
  const [issueUrl, setIssueUrl] = useState<string | null>(null)

  const enterEdit = () => {
    setDraft({
      persona: story.persona,
      action: story.action,
      benefit: story.benefit,
      acceptanceCriteria: story.acceptanceCriteria,
    })
    setSaveError(null)
    setMode('edit')
  }

  const cancelEdit = () => setMode('view')

  const updateDraftAC = (id: string, field: 'description' | 'category', value: string) => {
    setDraft((d) => ({
      ...d,
      acceptanceCriteria: d.acceptanceCriteria.map((ac) =>
        ac.id === id ? { ...ac, [field]: value } : ac
      ),
    }))
  }

  const removeAC = (id: string) => {
    setDraft((d) => ({
      ...d,
      acceptanceCriteria: d.acceptanceCriteria.filter((ac) => ac.id !== id),
    }))
  }

  const addAC = () => {
    setDraft((d) => ({
      ...d,
      acceptanceCriteria: [
        ...d.acceptanceCriteria,
        { id: `ac-${Date.now()}`, description: '', category: 'functional' as const },
      ],
    }))
  }

  const handleSave = async () => {
    if (!storyId || !sessionId) return
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/story/${storyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          persona: draft.persona,
          action: draft.action,
          benefit: draft.benefit,
          acceptanceCriteria: draft.acceptanceCriteria,
        }),
      })
      if (!res.ok) {
        setSaveError('Falha ao salvar. Tente novamente.')
        return
      }
      onUpdate?.({
        persona: draft.persona,
        action: draft.action,
        benefit: draft.benefit,
        acceptanceCriteria: draft.acceptanceCriteria,
      })
      onRequestLint?.()
      setMode('view')
    } catch {
      setSaveError('Erro inesperado. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    if (!storyId || !sessionId) return
    setExportState('loading')
    try {
      const res = await fetch('/api/story/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, sessionId }),
      })
      const data = await res.json()
      if (res.ok) {
        setIssueIdentifier(data.issueIdentifier)
        setIssueUrl(data.issueUrl)
        setExportState('exported')
      } else {
        setExportState('error')
      }
    } catch {
      setExportState('error')
    }
  }

  const formatWarning = hasFormatWarning(story.persona, story.action, story.benefit)

  if (mode === 'edit') {
    return (
      <div className="space-y-4">
        {/* Persona / Action / Benefit textareas */}
        <div className="space-y-2">
          {(['persona', 'action', 'benefit'] as const).map((field) => (
            <textarea
              key={field}
              value={draft[field]}
              onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
              rows={2}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white/90 resize-none focus:outline-none focus:border-white/30 placeholder:text-white/20"
              placeholder={
                field === 'persona' ? 'Como [persona]...' :
                field === 'action' ? 'Quero [ação]...' :
                'Para que [benefício]...'
              }
            />
          ))}
        </div>

        {/* Acceptance criteria */}
        <div>
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-2">
            Critérios de Aceite
          </p>
          <div className="space-y-2">
            {draft.acceptanceCriteria.map((ac) => (
              <div key={ac.id} className="flex items-start gap-2">
                <select
                  value={ac.category}
                  onChange={(e) => updateDraftAC(ac.id, 'category', e.target.value)}
                  className="text-[10px] bg-white/5 border border-white/15 rounded px-1.5 py-1 text-white/70 flex-shrink-0 focus:outline-none focus:border-white/30"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{categoryLabels[c]}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={ac.description}
                  onChange={(e) => updateDraftAC(ac.id, 'description', e.target.value)}
                  className="flex-1 bg-white/5 border border-white/15 rounded px-2 py-1 text-sm text-white/90 focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={() => removeAC(ac.id)}
                  disabled={draft.acceptanceCriteria.length <= 1}
                  className="text-white/30 hover:text-red-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors flex-shrink-0 text-sm leading-none pt-1"
                  aria-label="Remover critério"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addAC}
            className="mt-2 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            + Adicionar critério
          </button>
        </div>

        {saveError && (
          <p className="text-xs text-red-400">{saveError}</p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            onClick={cancelEdit}
            disabled={saving}
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  // View mode
  return (
    <div className="space-y-4">
      {formatWarning && (
        <div className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          Formato fora do padrão — edite antes de exportar
        </div>
      )}

      <div className="space-y-1">
        <p className="text-white/90 text-sm">{story.persona}</p>
        <p className="text-white/90 text-sm">{story.action}</p>
        <p className="text-white/90 text-sm">{story.benefit}</p>
      </div>

      {story.acceptanceCriteria.length > 0 && (
        <div>
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-2">
            Critérios de Aceite
          </p>
          <div className="space-y-2">
            {story.acceptanceCriteria.map((ac) => (
              <div key={ac.id} className="flex items-start gap-2">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0 mt-0.5 ${categoryColors[ac.category]}`}
                >
                  {categoryLabels[ac.category]}
                </span>
                <p className="text-sm text-white/80">{ac.description}</p>
                {isGenericCriterion(ac.description) && (
                  <span
                    title="Critério muito genérico — considere torná-lo mais específico"
                    className="flex-shrink-0 text-amber-400 text-xs mt-0.5 cursor-help"
                  >
                    ⚠
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        {storyId && (
          <button
            onClick={enterEdit}
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Editar
          </button>
        )}

        {storyId && exportState === 'exported' && issueIdentifier && issueUrl ? (
          <a
            href={issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            <span>↗</span>
            <span>{issueIdentifier}</span>
            <span className="text-white/30">· Ver no Linear</span>
          </a>
        ) : exportState === 'error' ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">Falha ao exportar</span>
            <button
              onClick={handleExport}
              className="text-xs text-white/40 hover:text-white/60 underline transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : storyId ? (
          <button
            onClick={handleExport}
            disabled={exportState === 'loading'}
            className="text-xs text-white/40 hover:text-white/60 underline transition-colors disabled:opacity-50"
          >
            {exportState === 'loading' ? 'Exportando...' : 'Exportar para Linear'}
          </button>
        ) : null}
      </div>
    </div>
  )
}
