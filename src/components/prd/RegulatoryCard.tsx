import { RegulatoryRestriction } from '@/types'

const levelConfig: Record<RegulatoryRestriction['level'], { label: string; color: string }> = {
  blocker:   { label: 'Bloqueante', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
  attention: { label: 'Atenção',    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  info:      { label: 'Info',       color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
}

type Props = {
  restrictions: RegulatoryRestriction[]
}

export function RegulatoryCard({ restrictions }: Props) {
  if (restrictions.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
        <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-1">
          Restrições Regulatórias
        </p>
        <p className="text-xs text-white/30 italic">
          Nenhuma restrição regulatória identificada. Revise manualmente antes de compartilhar.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 space-y-3">
      <p className="text-xs font-medium text-amber-400/80 uppercase tracking-widest">
        Restrições Regulatórias
      </p>
      {restrictions.map((r) => {
        const cfg = levelConfig[r.level]
        return (
          <div key={r.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${cfg.color}`}>
                {cfg.label}
              </span>
              <span className="text-xs text-white/60 font-medium">{r.normative}</span>
            </div>
            <p className="text-xs text-white/70">{r.requirement}</p>
            <p className="text-xs text-white/40">Impacto: {r.impact}</p>
          </div>
        )
      })}
    </div>
  )
}
