#!/usr/bin/env node

// This script uses ONLY Netlify's environment variables
// No hardcoded credentials - reads from process.env only
// For local dev, loads from .env file

const fs = require('fs');
const path = require('path');

// Load .env file for local development
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const envVars = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY
};

// Check if variables exist
if (!envVars.VITE_SUPABASE_URL || !envVars.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ ERROR: Supabase environment variables not found!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify dashboard or .env file');
  process.exit(1);
}

console.log('✓ Using Supabase environment variables from Netlify...');

// Create .env.production file
const envContent = Object.entries(envVars)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync(path.join(__dirname, '..', '.env.production'), envContent);

console.log('✓ Environment variables injected successfully!');
