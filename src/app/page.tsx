import { JobPicker } from '@/components/job-picker/JobPicker'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">ProdPilot AI</h1>
        <p className="text-white/40 text-sm">
          Copiloto de produto com compliance regulatório para fintechs
        </p>
      </div>
      <JobPicker />
    </main>
  )
}
