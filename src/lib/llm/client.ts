import { GoogleGenAI } from '@google/genai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set')
}

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// Timeout helper para chamadas
export const withTimeout = <T>(promise: Promise<T>, ms: number = 30000): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('LLM_UNAVAILABLE: Timeout exceeded'))
    }, ms)

    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}
