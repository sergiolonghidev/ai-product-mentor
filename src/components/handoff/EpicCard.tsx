'use client'

import { useState } from 'react'
import { IssueRow } from './IssueRow'

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

const typeColors: Record<Epic['type'], string> = {
  development: 'border-blue-500/20',
  compliance:  'border-orange-500/30',
  spike:       'border-violet-500/20',
  custom:      'border-white/10',
}

const typeBadge: Record<Epic['type'], string> = {
  development: 'text-blue-400/70',
  compliance:  'text-orange-400/70',
  spike:       'text-violet-400/70',
  custom:      'text-white/40',
}

const typeLabel: Record<Epic['type'], string> = {
  development: 'Desenvolvimento',
  compliance:  'Compliance',
  spike:       'Spike',
  custom:      'Custom',
}

type Props = {
  epic: Epic
  allEpics: { id: string; name: string }[]
  onRename: (epicId: string, name: string) => void
  onToggleRemoveIssue: (epicId: string, storyId: string) => void
  onToggleSpikeIssue: (epicId: string, storyId: string) => void
  onMoveIssue: (storyId: string, fromEpicId: string, toEpicId: string) => void
}

export function EpicCard({
  epic, allEpics, onRename, onToggleRemoveIssue, onToggleSpikeIssue, onMoveIssue,
}: Props) {
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(epic.name)

  const commitRename = () => {
    const trimmed = nameInput.trim()
    if (trimmed && trimmed !== epic.name) onRename(epic.id, trimmed)
    else setNameInput(epic.name)
    setEditingName(false)
  }

  const activeCount = epic.issues.filter((i) => !i.removed).length

  return (
    <div className={`rounded-xl border bg-white/[0.02] ${typeColors[epic.type]}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <span className={`text-[10px] font-medium uppercase tracking-widest ${typeBadge[epic.type]}`}>
          {typeLabel[epic.type]}
        </span>

        {editingName ? (
          <input
            autoFocus
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === 'Enter') commitRename() }}
            className="flex-1 bg-transparent border-b border-white/20 text-sm font-semibold text-white focus:outline-none pb-0.5"
          />
        ) : (
          <button
            onClick={() => { setNameInput(epic.name); setEditingName(true) }}
            className="flex-1 text-left text-sm font-semibold text-white hover:text-white/70 transition-colors"
            title="Clique para renomear"
          >
            {epic.name}
          </button>
        )}

        <span className="text-xs text-white/30 flex-shrink-0">
          {activeCount} issue{activeCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Issues */}
      <div className="py-1">
        {epic.issues.length === 0 ? (
          <p className="px-4 py-3 text-xs text-white/25 italic">Nenhuma issue</p>
        ) : (
          epic.issues.map((issue) => (
            <IssueRow
              key={issue.storyId}
              issue={issue}
              epicId={epic.id}
              allEpicIds={allEpics}
              onToggleRemove={(sid) => onToggleRemoveIssue(epic.id, sid)}
              onToggleSpike={(sid) => onToggleSpikeIssue(epic.id, sid)}
              onMove={(sid, targetId) => onMoveIssue(sid, epic.id, targetId)}
            />
          ))
        )}
      </div>
    </div>
  )
}
