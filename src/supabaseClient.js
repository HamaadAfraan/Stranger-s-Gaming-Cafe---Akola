import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// iOS Safari WebKit connection hanging fix
const iOSSafariFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    // iOS Safari HTTP/2 connection pooling fix
    keepalive: false,
    cache: 'no-store',
    headers: {
      ...options.headers,
      'Connection': 'close',
    },
  });
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: typeof window !== 'undefined' ? window.localStorage : null,
  },
  global: {
    fetch: iOSSafariFetch,
  },
  realtime: {
    timeout: 20000,
  },
});