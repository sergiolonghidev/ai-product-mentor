import { JobCard } from './JobCard'

const JOBS = [
  {
    icon: '📝',
    title: 'Criar User Story',
    description: 'Gere histórias com critérios de aceite e compliance regulatório',
    status: 'active' as const,
    href: '/onboarding',
  },
  {
    icon: '📄',
    title: 'Escrever PRD',
    description: 'Documente features com contexto regulatório e critérios de descoberta',
    status: 'active' as const,
    href: '/prd/onboarding',
  },
  {
    icon: '🗺️',
    title: 'Planejar Roadmap',
    description: 'Organize prioridades e entregas com visão de impacto regulatório',
    status: 'soon' as const,
  },
  {
    icon: '🔍',
    title: 'Pesquisar Concorrentes',
    description: 'Analise mercado e benchmarks no segmento de fintechs e agrotechs',
    status: 'soon' as const,
  },
]

export function JobPicker() {
  return (
    <div className="w-full max-w-lg space-y-3">
      <p className="text-xs font-medium text-white/30 uppercase tracking-widest mb-5">
        O que você quer fazer?
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {JOBS.map((job) => (
          <JobCard key={job.title} {...job} />
        ))}
      </div>
    </div>
  )
}
