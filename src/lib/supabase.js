import { createClient } from '@supabase/supabase-js';

// Get env vars - Vercel/Netlify injects these at build time
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing. Check environment variables in Vercel/Netlify dashboard.');
  console.error('Missing:', {
    url: !supabaseUrl,
    key: !supabaseAnonKey
  });
}

console.log('🔌 Supabase initializing...', supabaseUrl ? 'URL present' : 'URL missing');

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;
