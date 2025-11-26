#!/usr/bin/env node
/**
 * Test Supabase database connection
 * Run: node test-supabase-connection.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 Testing Supabase Connection...\n');

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL not found in .env');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env');
  console.log('\n📝 To fix this:');
  console.log('1. Go to: https://app.supabase.com/project/iqipomerawkvtojbtvom/settings/api');
  console.log('2. Copy the "service_role" key (NOT the anon key)');
  console.log('3. Add to .env: SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  process.exit(1);
}

console.log('✅ Supabase URL:', supabaseUrl);
console.log('✅ Service key found (hidden)');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    // Test 1: Check if users table exists
    console.log('\n🧪 Test 1: Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (usersError) {
      if (usersError.message.includes('relation "public.users" does not exist')) {
        console.log('⚠️  Users table not created yet');
        console.log('📝 Next step: Run SQL schemas from SUPABASE_DATABASE_SETUP.md');
        console.log('   Go to: https://app.supabase.com/project/iqipomerawkvtojbtvom/sql');
        return;
      }
      throw usersError;
    }
    
    console.log('✅ Users table exists');

    // Test 2: Check if posts table exists
    console.log('\n🧪 Test 2: Checking posts table...');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('count')
      .limit(1);
    
    if (postsError) {
      if (postsError.message.includes('relation "public.posts" does not exist')) {
        console.log('⚠️  Posts table not created yet');
        console.log('📝 Next step: Run SQL schemas from SUPABASE_DATABASE_SETUP.md');
        return;
      }
      throw postsError;
    }
    
    console.log('✅ Posts table exists');

    // Test 3: Check if comments table exists
    console.log('\n🧪 Test 3: Checking comments table...');
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('count')
      .limit(1);
    
    if (commentsError) {
      if (commentsError.message.includes('relation "public.comments" does not exist')) {
        console.log('⚠️  Comments table not created yet');
        console.log('📝 Next step: Run SQL schemas from SUPABASE_DATABASE_SETUP.md');
        return;
      }
      throw commentsError;
    }
    
    console.log('✅ Comments table exists');

    // Success!
    console.log('\n✅ DATABASE CONNECTION SUCCESSFUL!\n');
    console.log('🎉 All core tables exist. Ready to wire API routes!\n');

  } catch (error) {
    console.error('\n❌ Connection test failed:');
    console.error(error.message);
    console.log('\n📝 Troubleshooting steps:');
    console.log('1. Verify Supabase project is running');
    console.log('2. Check service role key is correct');
    console.log('3. Ensure database schemas are created');
    console.log('4. Check RLS policies are configured');
    process.exit(1);
  }
}

testConnection();
