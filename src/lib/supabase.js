import { createClient } from '@supabase/supabase-js';

// Production credentials - these are PUBLIC keys safe to expose
const DEFAULT_URL = 'https://iqipomerawkvtojbtvom.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaXBvbWVyYXdrdnRvamJ0dm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NTgyMjYsImV4cCI6MjA3ODIzNDIyNn0.DmvVhLUCdWCbjzGB6w-oSYVA40wGi7TKW26MbLKrVVw';

// Get env vars with fallback to production defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY;

// Validate URL format
const isValidUrl = (url) => {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

// Use defaults if env vars are invalid
const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : DEFAULT_URL;
const finalKey = supabaseAnonKey && supabaseAnonKey.length > 20 ? supabaseAnonKey : DEFAULT_KEY;

console.log('🔌 Supabase initialized:', finalUrl);

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
