'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ContextQuestion } from './ContextQuestion'
import { useSessionStore } from '@/store/session'
import { SessionContext, FunctionalityType } from '@/types'

type WizardState = {
  step: 1 | 2 | 3
  squad: string
  functionalityType: string
  currentPain: string
  loading: boolean
  welcomeMessage: string
  error: string | null
}

export function OnboardingWizard() {
  const router = useRouter()
  const setSession = useSessionStore((s) => s.setSession)
  const addMessage = useSessionStore((s) => s.addMessage)

  const [state, setState] = useState<WizardState>({
    step: 1,
    squad: '',
    functionalityType: '',
    currentPain: '',
    loading: false,
    welcomeMessage: '',
    error: null,
  })

  const updateField = (field: keyof WizardState, value: string) =>
    setState((s) => ({ ...s, [field]: value }))

  const isCurrentStepValid = () => {
    if (state.step === 1) return state.squad.trim().length > 0
    if (state.step === 2) return state.functionalityType.length > 0
    if (state.step === 3) return state.currentPain.trim().length > 0
    return false
  }

  const handleNext = async () => {
    if (state.step < 3) {
      setState((s) => ({ ...s, step: (s.step + 1) as 1 | 2 | 3 }))
      return
    }

    // Submit
    setState((s) => ({ ...s, loading: true, error: null }))

    try {
      const context: SessionContext = {
        squad: state.squad,
        functionalityType: state.functionalityType as FunctionalityType,
        currentPain: state.currentPain,
      }

      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error?.message ?? 'Erro ao iniciar sessão')
      }

      const data = await res.json()
      const { session, welcomeMessage } = data

      setSession(session.id, context)
      addMessage({
        id: welcomeMessage.id,
        sessionId: session.id,
        createdAt: new Date().toISOString(),
        role: 'assistant',
        content: welcomeMessage.content,
        metadata: { type: 'onboarding_response' },
      })

      router.push('/chat')
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Erro inesperado',
      }))
    }
  }

  const handleBack = () => {
    if (state.step > 1) {
      setState((s) => ({ ...s, step: (s.step - 1) as 1 | 2 | 3, error: null }))
    }
  }

  if (state.loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <p className="text-white/70 text-sm">Preparando seu mentor...</p>
      </div>
    )
  }

  const questions = [
    {
      step: 1 as const,
      question: 'Em qual squad ou área você atua?',
      type: 'text' as const,
      value: state.squad,
      field: 'squad' as const,
    },
    {
      step: 2 as const,
      question: 'Com que tipo de funcionalidade você trabalha mais?',
      type: 'chips' as const,
      value: state.functionalityType,
      field: 'functionalityType' as const,
    },
    {
      step: 3 as const,
      question: 'Qual é o maior desafio que você está enfrentando agora?',
      type: 'textarea' as const,
      value: state.currentPain,
      field: 'currentPain' as const,
    },
  ]

  const current = questions[state.step - 1]

  return (
    <div className="flex flex-col gap-4">
      <ContextQuestion
        step={current.step}
        question={current.question}
        type={current.type}
        value={current.value}
        onChange={(v) => updateField(current.field, v)}
        onNext={handleNext}
        onBack={state.step > 1 ? handleBack : undefined}
        isNextDisabled={!isCurrentStepValid()}
      />
      {state.error && (
        <p className="text-red-400 text-sm text-center">{state.error}</p>
      )}
    </div>
  )
}
