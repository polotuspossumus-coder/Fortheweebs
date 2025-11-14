#!/usr/bin/env node

// This script injects Supabase environment variables before the build
// These are PUBLIC keys safe to expose - protected by Row Level Security

const fs = require('fs');
const path = require('path');

// Supabase public credentials (anon key is designed to be public)
const envVars = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://iqipomerawkvtojbtvom.supabase.co',
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaXBvbWVyYXdrdnRvamJ0dm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NTgyMjYsImV4cCI6MjA3ODIzNDIyNn0.DmvVhLUCdWCbjzGB6w-oSYVA40wGi7TKW26MbLKrVVw'
};

console.log('✓ Injecting Supabase environment variables for build...');
console.log(`  VITE_SUPABASE_URL: ${envVars.VITE_SUPABASE_URL}`);
console.log(`  VITE_SUPABASE_ANON_KEY: ${envVars.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...`);

// Create .env.production file
const envContent = Object.entries(envVars)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync(path.join(__dirname, '..', '.env.production'), envContent);

console.log('✓ Environment variables injected successfully!');
