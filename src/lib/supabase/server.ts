/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _db: SupabaseClient | null = null

function getDb(): SupabaseClient {
  if (!_db) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
    if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
    _db = createClient(url, key)
  }
  return _db
}

export const db: any = new Proxy({} as any, {
  get(_target: any, prop: string) {
    return (getDb() as any)[prop]
  },
})
