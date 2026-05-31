'use client'

import { useState } from 'react'
import { PRD } from '@/types'
import { PRDSection } from './PRDSection'
import { RegulatoryCard } from './RegulatoryCard'

const phaseLabels = {
  discovery: { label: 'Discovery', color: 'text-violet-400 border-violet-500/30 bg-violet-500/10' },
  ready_to_build: { label: 'Pronto para desenvolver', color: 'text-green-400 border-green-500/30 bg-green-500/10' },
  post_launch: { label: 'Pós-lançamento', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
}

const categoryColors: Record<string, string> = {
  functional: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  compliance:  'bg-orange-500/20 text-orange-300 border-orange-500/30',
  ux:          'bg-purple-500/20 text-purple-300 border-purple-500/30',
  performance: 'bg-green-500/20 text-green-300 border-green-500/30',
}

const categoryLabels: Record<string, string> = {
  functional: 'Funcional', compliance: 'Compliance', ux: 'UX', performance: 'Performance',
}

const TEXT_SECTIONS: { field: keyof PRD; label: string }[] = [
  { field: 'context',       label: 'Contexto' },
  { field: 'problem',       label: 'Problema central' },
  { field: 'impactedUsers', label: 'Usuários impactados' },
  { field: 'solution',      label: 'Solução proposta' },
  { field: 'metrics',       label: 'Métricas de sucesso' },
  { field: 'dependencies',  label: 'Dependências' },
  { field: 'risks',         label: 'Riscos e incertezas' },
]

type Props = {
  initialPrd: PRD
}

export function PRDEditor({ initialPrd }: Props) {
  const [prd, setPrd] = useState<PRD>(initialPrd)
  const phase = phaseLabels[prd.phase]

  const handleSaved = (field: string, value: string) =>
    setPrd((prev) => ({ ...prev, [field]: value }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${phase.color}`}>
            {phase.label}
          </span>
          <span className="text-xs text-white/30">{prd.squad}</span>
        </div>
        <h2 className="text-lg font-semibold text-white">{prd.title}</h2>
        {prd.phase === 'discovery' && (
          <p className="text-xs text-violet-400/80 bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-2">
            Linguagem de hipótese — revise antes de compartilhar com stakeholders
          </p>
        )}
      </div>

      {/* Regulatory restrictions — always first (CA#2) */}
      <RegulatoryCard restrictions={prd.regulatoryRestrictions} />

      {/* Text sections */}
      {TEXT_SECTIONS.map(({ field, label }) => (
        <PRDSection
          key={field}
          label={label}
          value={String(prd[field] ?? '')}
          prdId={prd.id}
          field={field}
          onSaved={handleSaved}
        />
      ))}

      {/* Acceptance criteria (read-only for now) */}
      {prd.acceptanceCriteria.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest">
            Critérios de Aceite
          </p>
          {prd.acceptanceCriteria.map((ac) => (
            <div key={ac.id} className="flex items-start gap-2">
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0 mt-0.5 ${categoryColors[ac.category] ?? ''}`}>
                {categoryLabels[ac.category] ?? ac.category}
              </span>
              <p className="text-sm text-white/80">{ac.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
