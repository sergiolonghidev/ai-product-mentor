'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { LintResult, ComplianceRisk } from '@/types'

type Props = {
  lintResult: LintResult | null
  isLoading: boolean
}

const levelIcon = {
  red: <XCircle size={14} className="text-red-400 flex-shrink-0" />,
  amber: <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0" />,
  green: <CheckCircle size={14} className="text-green-400 flex-shrink-0" />,
}

function RiskItem({ risk }: { risk: ComplianceRisk }) {
  const [open, setOpen] = useState(risk.level === 'red')
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors"
      >
        {levelIcon[risk.level]}
        <span className="flex-1 text-sm text-white/80">{risk.title}</span>
        {open ? <ChevronDown size={12} className="text-white/40" /> : <ChevronRight size={12} className="text-white/40" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          <p className="text-xs text-white/60">{risk.description}</p>
          <p className="text-xs text-white/40">
            <span className="font-medium text-white/50">Normativo:</span> {risk.normativeReference}
          </p>
          <div className="bg-white/5 rounded p-2">
            <p className="text-xs text-white/70">
              <span className="font-medium">Sugestão:</span> {risk.suggestion}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export function LinterPanel({ lintResult, isLoading }: Props) {
  const [greenOpen, setGreenOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin" />
        <span className="text-xs text-white/40">Verificando compliance...</span>
      </div>
    )
  }

  if (!lintResult) return null

  const redRisks = lintResult.risks.filter((r) => r.level === 'red')
  const amberRisks = lintResult.risks.filter((r) => r.level === 'amber')
  const greenRisks = lintResult.risks.filter((r) => r.level === 'green')

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium text-white/50 uppercase tracking-widest">
        Análise de Compliance
      </p>

      {redRisks.map((r) => <RiskItem key={r.id} risk={r} />)}
      {amberRisks.map((r) => <RiskItem key={r.id} risk={r} />)}

      {greenRisks.length > 0 && (
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <button
            onClick={() => setGreenOpen((o) => !o)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors"
          >
            <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
            <span className="flex-1 text-sm text-white/60">
              {greenRisks.length} {greenRisks.length === 1 ? 'item verificado' : 'itens verificados'} sem problema
            </span>
            {greenOpen ? <ChevronDown size={12} className="text-white/40" /> : <ChevronRight size={12} className="text-white/40" />}
          </button>
          {greenOpen && (
            <div className="px-3 pb-3 space-y-1">
              {greenRisks.map((r) => (
                <p key={r.id} className="text-xs text-white/40">✓ {r.title}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {lintResult.summary.ok && redRisks.length === 0 && (
        <p className="text-xs text-green-400/70">
          Nenhum risco crítico identificado.
        </p>
      )}
    </div>
  )
}
