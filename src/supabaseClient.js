import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ftpcjyecegugofftcoco.supabase.co'
const supabaseAnonJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cGNqeWVjZWd1Z29mZnRjb2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTMyNjcsImV4cCI6MjEwNjUyOTI2N30.SuT6ir8EMKmLgC2gAIsbDEr95XPEv-ic4RRCmmfbnec'

export const supabase = createClient(supabaseUrl, supabaseAnonJwt, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : null,
  },
  global: {
    headers: { 'x-client-info': 'strangers-gaming-vite' },
  },
})