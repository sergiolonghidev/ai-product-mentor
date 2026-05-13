import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
            AI Product Mentor
          </h1>
          <p className="text-white/50 text-sm">
            Mentor de produto com compliance regulatório para fintechs
          </p>
        </div>
        <OnboardingWizard />
      </div>
    </main>
  )
}
