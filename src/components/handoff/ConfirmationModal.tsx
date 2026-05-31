'use client'

import { useState } from 'react'

type Epic = {
  id: string
  name: string
  type: string
  issues: { storyId: string; removed: boolean }[]
}

type Props = {
  epics: Epic[]
  onConfirm: () => void
  onCancel: () => void
  exporting: boolean
}

const CHECKLIST = [
  'Revisei todos os épicos e issues',
  'O épico de Compliance está separado dos épicos técnicos',
  'Issues de spike estão corretamente identificados',
]

export function ConfirmationModal({ epics, onConfirm, onCancel, exporting }: Props) {
  const [checked, setChecked] = useState<boolean[]>(CHECKLIST.map(() => false))

  const allChecked = checked.every(Boolean)

  const toggle = (i: number) =>
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)))

  const activeEpics = epics.map((e) => ({
    ...e,
    activeCount: e.issues.filter((i) => !i.removed).length,
  })).filter((e) => e.activeCount > 0)

  const totalIssues = activeEpics.reduce((sum, e) => sum + e.activeCount, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10">
          <h2 className="text-base font-semibold text-white">Confirmar envio ao Linear</h2>
          <p className="text-xs text-white/40 mt-1">
            {totalIssues} issue{totalIssues !== 1 ? 's' : ''} em {activeEpics.length} épico{activeEpics.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Epic summary */}
        <div className="px-6 py-4 space-y-2 border-b border-white/5">
          {activeEpics.map((e) => (
            <div key={e.id} className="flex items-center justify-between">
              <span className="text-sm text-white/70">{e.name}</span>
              <span className="text-xs text-white/30">{e.activeCount} issue{e.activeCount !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>

        {/* Checklist */}
        <div className="px-6 py-4 space-y-3 border-b border-white/5">
          {CHECKLIST.map((item, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => toggle(i)}
                className="mt-0.5 accent-violet-500 cursor-pointer"
              />
              <span className={`text-sm transition-colors ${
                checked[i] ? 'text-white/60' : 'text-white/80 group-hover:text-white'
              }`}>
                {item}
              </span>
            </label>
          ))}
        </div>

        {/* Warning */}
        <div className="px-6 py-3 border-b border-white/5">
          <p className="text-xs text-amber-400/70">
            Esta ação criará os projetos e issues no Linear. Não é possível desfazer em massa.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={exporting}
            className="text-sm text-white/40 hover:text-white/70 transition-colors disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!allChecked || exporting}
            className="text-sm bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
          >
            {exporting ? 'Enviando...' : 'Confirmar e enviar'}
          </button>
        </div>
      </div>
    </div>
  )
}
