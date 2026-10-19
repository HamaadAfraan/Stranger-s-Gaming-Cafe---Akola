import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || 'https://ftpcjyecegugofftcoco.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cGNqeWVjZWd1Z29mZnRjb2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTMyNjcsImV4cCI6MjEwNjUyOTI2N30.SuT6ir8EMKmLgC2gAIsbDEr95XPEv-ic4RRCmmfbnec';

// iOS Safari WebKit connection hanging & API key forwarding fix
const iOSSafariFetch = (url, options = {}) => {
  const customHeaders = new Headers(options.headers || {});
  
  // Explicitly ensure apikey & authorization headers are passed
  if (!customHeaders.has('apikey')) {
    customHeaders.set('apikey', supabaseAnonKey);
  }
  if (!customHeaders.has('Authorization')) {
    customHeaders.set('Authorization', `Bearer ${supabaseAnonKey}`);
  }

  return fetch(url, {
    ...options,
    keepalive: false,
    cache: 'no-store',
    headers: customHeaders,
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