'use client'

import { FunctionalityType } from '@/types'

type ChipOption = {
  label: string
  value: FunctionalityType
  icon: string
}

const CHIP_OPTIONS: ChipOption[] = [
  { label: 'Fatura', value: 'fatura', icon: '🧾' },
  { label: 'Parcelamento', value: 'parcelamento', icon: '📦' },
  { label: 'Recompensas', value: 'recompensa', icon: '🎁' },
  { label: 'Limite', value: 'limite', icon: '📊' },
  { label: 'Tokenização', value: 'tokenizacao', icon: '🔐' },
  { label: 'Aquisição', value: 'aquisicao', icon: '🎯' },
  { label: 'Outro', value: 'outro', icon: '➕' },
]

type Props = {
  step: 1 | 2 | 3
  question: string
  type: 'text' | 'chips' | 'textarea'
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack?: () => void
  isNextDisabled: boolean
}

export function ContextQuestion({
  step,
  question,
  type,
  value,
  onChange,
  onNext,
  onBack,
  isNextDisabled,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 items-center">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-white' : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      <div>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-3">
          Passo {step} de 3
        </p>
        <h2 className="text-xl font-semibold text-white leading-snug">{question}</h2>
      </div>

      {type === 'text' && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ex: Credit Cards — Aquisição"
          maxLength={200}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 transition-colors"
          onKeyDown={(e) => e.key === 'Enter' && !isNextDisabled && onNext()}
          autoFocus
        />
      )}

      {type === 'chips' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CHIP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                value === opt.value
                  ? 'bg-white text-gray-900 border-white'
                  : 'bg-white/10 text-white border-white/20 hover:border-white/40'
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}

      {type === 'textarea' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ex: Preciso escrever uma user story para o novo fluxo de limite emergencial e não sei quais critérios de compliance incluir."
          maxLength={1000}
          rows={4}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 transition-colors resize-none"
          autoFocus
        />
      )}

      <div className="flex gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 py-3 rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors font-medium"
          >
            Voltar
          </button>
        )}
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className="flex-1 py-3 rounded-lg bg-white text-gray-900 font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 transition-colors"
        >
          {step === 3 ? 'Começar' : 'Próxima'}
        </button>
      </div>
    </div>
  )
}
