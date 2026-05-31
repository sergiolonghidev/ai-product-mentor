'use client'

type HandoffIssue = {
  storyId: string
  title: string
  description: string
  isSpike: boolean
  removed: boolean
}

type Props = {
  issue: HandoffIssue
  epicId: string
  allEpicIds: { id: string; name: string }[]
  onToggleRemove: (storyId: string) => void
  onToggleSpike: (storyId: string) => void
  onMove: (storyId: string, targetEpicId: string) => void
}

export function IssueRow({ issue, epicId, allEpicIds, onToggleRemove, onToggleSpike, onMove }: Props) {
  const otherEpics = allEpicIds.filter((e) => e.id !== epicId)

  return (
    <div className={`flex items-start gap-3 py-2 px-3 rounded-lg transition-colors ${
      issue.removed ? 'opacity-40' : 'hover:bg-white/[0.03]'
    }`}>
      {/* Spike badge */}
      <button
        onClick={() => onToggleSpike(issue.storyId)}
        title={issue.isSpike ? 'Desmarcar spike' : 'Marcar como spike'}
        className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded border font-medium mt-0.5 transition-colors ${
          issue.isSpike
            ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
            : 'bg-white/5 text-white/20 border-white/10 hover:text-white/40'
        }`}
      >
        {issue.isSpike ? 'Spike' : '○'}
      </button>

      {/* Title */}
      <p className={`flex-1 text-sm leading-relaxed ${
        issue.removed ? 'line-through text-white/30' : 'text-white/80'
      }`}>
        {issue.isSpike ? <span className="text-violet-400">[Spike] </span> : null}
        {issue.title}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Move to epic */}
        {!issue.removed && otherEpics.length > 0 && (
          <select
            value=""
            onChange={(e) => { if (e.target.value) onMove(issue.storyId, e.target.value) }}
            className="text-[10px] bg-white/5 border border-white/10 rounded px-1 py-0.5 text-white/30 focus:outline-none focus:border-white/20 cursor-pointer"
          >
            <option value="">Mover →</option>
            {otherEpics.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        )}

        {/* Remove / undo */}
        <button
          onClick={() => onToggleRemove(issue.storyId)}
          className={`text-xs transition-colors ${
            issue.removed
              ? 'text-white/40 hover:text-white/70'
              : 'text-white/20 hover:text-red-400'
          }`}
          title={issue.removed ? 'Desfazer remoção' : 'Remover do handoff'}
        >
          {issue.removed ? 'Desfazer' : '✕'}
        </button>
      </div>
    </div>
  )
}
