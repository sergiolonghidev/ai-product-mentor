import { ai, withTimeout } from '../src/lib/llm/client'
import { buildOnboardingPrompt } from '../src/lib/prompts/onboarding.prompt'
import { config } from 'dotenv'
import { resolve } from 'path'

// Carrega as variáveis do .env.local
config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  console.log('Testando Google Gemini API...')
  
  const prompt = buildOnboardingPrompt({
    squad: 'Credit Cards',
    functionalityType: 'parcelamento',
    currentPain: 'Não sei quais critérios de compliance usar na user story'
  })

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-1.5-pro',
        contents: prompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 1500,
        }
      })
    )

    console.log('\n--- Resposta ---')
    console.log(response.text)
    console.log('----------------\n')
  } catch (error) {
    console.error('Erro ao chamar a LLM:', error)
  }
}

main()
