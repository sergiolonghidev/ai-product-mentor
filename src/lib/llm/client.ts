import { GoogleGenAI } from '@google/genai'

let _ai: GoogleGenAI | null = null

export function getAI(): GoogleGenAI {
  if (!_ai) {
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new Error('GEMINI_API_KEY is not set')
    _ai = new GoogleGenAI({ apiKey: key })
  }
  return _ai
}

// Keep named export for backwards compatibility
export const ai = {
  models: {
    generateContent: (...args: Parameters<GoogleGenAI['models']['generateContent']>) =>
      getAI().models.generateContent(...args),
    generateContentStream: (...args: Parameters<GoogleGenAI['models']['generateContentStream']>) =>
      getAI().models.generateContentStream(...args),
  },
}

export const withTimeout = <T>(promise: Promise<T>, ms: number = 30000): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('LLM_UNAVAILABLE: Timeout exceeded'))
    }, ms)
    promise
      .then((value) => { clearTimeout(timer); resolve(value) })
      .catch((error) => { clearTimeout(timer); reject(error) })
  })
}
