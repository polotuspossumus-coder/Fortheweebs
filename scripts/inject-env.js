#!/usr/bin/env node

// Netlify injects env vars automatically - just verify they exist
const envVars = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY
};

// Check if variables exist
if (!envVars.VITE_SUPABASE_URL || !envVars.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ ERROR: Supabase environment variables not found!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify dashboard');
  process.exit(1);
}

console.log('✓ Environment variables verified. Netlify will inject them at build time.');
