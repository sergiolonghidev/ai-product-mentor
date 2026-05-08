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

type ExportState = 'idle' | 'loading' | 'exported' | 'error'

type Props = {
  story: Pick<UserStory, 'persona' | 'action' | 'benefit' | 'acceptanceCriteria'>
  storyId?: string
  sessionId?: string
}

export function StoryBlock({ story, storyId, sessionId }: Props) {
  const [exportState, setExportState] = useState<ExportState>('idle')
  const [issueIdentifier, setIssueIdentifier] = useState<string | null>(null)
  const [issueUrl, setIssueUrl] = useState<string | null>(null)

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

  return (
    <div className="space-y-4">
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
              </div>
            ))}
          </div>
        </div>
      )}

      {storyId && (
        <div className="pt-1">
          {exportState === 'exported' && issueIdentifier && issueUrl ? (
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
          ) : (
            <button
              onClick={handleExport}
              disabled={exportState === 'loading'}
              className="text-xs text-white/40 hover:text-white/60 underline transition-colors disabled:opacity-50"
            >
              {exportState === 'loading' ? 'Exportando...' : 'Exportar para Linear'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
