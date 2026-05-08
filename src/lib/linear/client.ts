import { LinearClient } from '@linear/sdk'

let _linear: LinearClient | null = null

export function getLinearClient(): LinearClient {
  if (!_linear) {
    const key = process.env.LINEAR_API_KEY
    if (!key) throw new Error('LINEAR_API_KEY is not set')
    _linear = new LinearClient({ apiKey: key })
  }
  return _linear
}
