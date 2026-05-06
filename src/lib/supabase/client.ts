import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// As variáveis de ambiente devem estar definidas no .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente Supabase para uso geral
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
