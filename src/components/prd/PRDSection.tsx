'use client'

import { useState } from 'react'

type Props = {
  label: string
  value: string
  prdId: string
  field: string
  onSaved: (field: string, value: string) => void
}

export function PRDSection({ label, value, prdId, field, onSaved }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/prd/${prdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: draft }),
      })
      if (res.ok) {
        onSaved(field, draft)
        setEditing(false)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setDraft(value)
    setEditing(false)
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-white/40 uppercase tracking-widest">{label}</p>

      {editing ? (
        <div className="space-y-2">
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={Math.max(3, draft.split('\n').length + 1)}
            className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white/90 resize-y focus:outline-none focus:border-white/30"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !draft.trim()}
              className="text-xs bg-white/10 hover:bg-white/15 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
            >
              {saving ? 'Salvando...' : 'Salvar seção'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(value); setEditing(true) }}
          className="w-full text-left group"
        >
          <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap group-hover:text-white/90 transition-colors">
            {value}
          </p>
          <span className="text-[10px] text-white/20 group-hover:text-white/40 transition-colors">
            clique para editar
          </span>
        </button>
      )}
    </div>
  )
}
