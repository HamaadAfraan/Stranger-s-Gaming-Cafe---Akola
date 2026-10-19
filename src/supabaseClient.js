import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()


export const supabase = createClient(supabaseUrl, supabaseAnonKey,{
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : null,
    persistSession: true,
    autoRefreshToken: true,
  }
});