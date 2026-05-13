'use client'

import { FeedbackReason } from '@/types'

type ChipConfig = { reason: FeedbackReason; label: string }

const CHIPS: ChipConfig[] = [
  { reason: 'too_generic', label: 'Muito genérico' },
  { reason: 'wrong_context', label: 'Não se aplica ao meu contexto' },
  { reason: 'missing_regulatory_detail', label: 'Faltou detalhe regulatório' },
  { reason: 'incorrect_information', label: 'Informação incorreta' },
]

type Props = {
  onSelect: (reason: FeedbackReason) => void
  isLoading: boolean
  selected?: FeedbackReason
}

export function ReasonChips({ onSelect, isLoading, selected }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {CHIPS.map((chip) => (
        <button
          key={chip.reason}
          onClick={() => !isLoading && !selected && onSelect(chip.reason)}
          disabled={isLoading || (!!selected && selected !== chip.reason)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
            selected === chip.reason
              ? 'bg-white/20 border-white/60 text-white'
              : selected
              ? 'border-white/10 text-white/30 cursor-not-allowed'
              : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white/80'
          }`}
        >
          {chip.label}
        </button>
      ))}
      {isLoading && (
        <span className="text-xs text-white/50 self-center ml-1">
          Preparando nova resposta...
        </span>
      )}
    </div>
  )
}
