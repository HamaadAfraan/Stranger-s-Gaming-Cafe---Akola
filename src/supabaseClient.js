import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key Length:", supabaseAnonKey?.length);

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)