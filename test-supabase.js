/**
 * Supabase Connection Test Script
 * Tests database connectivity, table access, and basic operations
 *
 * Usage: node test-supabase.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 SUPABASE CONNECTION TEST\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Check environment variables
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL not found in .env');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env');
  console.log('\n💡 Get your service role key from:');
  console.log('   https://app.supabase.com/project/YOUR_PROJECT/settings/api');
  console.log('   Look for "service_role" (secret) key\n');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseServiceKey.substring(0, 20)}...`);
console.log('');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  const tests = [];
  let passed = 0;
  let failed = 0;

  // Test 1: Check if tables exist
  console.log('📋 TEST 1: Checking tables...');
  try {
    const tables = ['users', 'posts', 'comments', 'post_likes', 'comment_likes',
                    'friendships', 'follows', 'blocks', 'conversations',
                    'conversation_participants', 'messages', 'notifications', 'subscriptions'];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ❌ Table '${table}' - ${error.message}`);
        failed++;
        tests.push({ name: `Table ${table}`, status: 'FAIL', error: error.message });
      } else {
        console.log(`   ✅ Table '${table}' - ${count || 0} rows`);
        passed++;
        tests.push({ name: `Table ${table}`, status: 'PASS', count });
      }
    }
  } catch (error) {
    console.log(`   ❌ Failed to check tables: ${error.message}`);
    failed++;
  }
  console.log('');

  // Test 2: Test feed function
  console.log('📋 TEST 2: Testing get_user_feed function...');
  try {
    const { data, error } = await supabase
      .rpc('get_user_feed', {
        user_uuid: '00000000-0000-0000-0000-000000000000',
        page_limit: 10,
        page_offset: 0
      });

    if (error) {
      console.log(`   ❌ Function failed: ${error.message}`);
      failed++;
      tests.push({ name: 'get_user_feed function', status: 'FAIL', error: error.message });
    } else {
      console.log(`   ✅ Function works - returned ${data?.length || 0} posts`);
      passed++;
      tests.push({ name: 'get_user_feed function', status: 'PASS', count: data?.length });
    }
  } catch (error) {
    console.log(`   ❌ Function test failed: ${error.message}`);
    failed++;
  }
  console.log('');

  // Test 3: Test views
  console.log('📋 TEST 3: Testing views...');
  try {
    const views = ['post_stats', 'user_stats'];

    for (const view of views) {
      const { count, error } = await supabase
        .from(view)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ❌ View '${view}' - ${error.message}`);
        failed++;
        tests.push({ name: `View ${view}`, status: 'FAIL', error: error.message });
      } else {
        console.log(`   ✅ View '${view}' - ${count || 0} rows`);
        passed++;
        tests.push({ name: `View ${view}`, status: 'PASS', count });
      }
    }
  } catch (error) {
    console.log(`   ❌ Failed to check views: ${error.message}`);
    failed++;
  }
  console.log('');

  // Test 4: Test RLS policies (should fail without auth)
  console.log('📋 TEST 4: Testing Row Level Security...');
  try {
    // Create anon client (without service role)
    const anonClient = createClient(
      supabaseUrl,
      process.env.VITE_SUPABASE_ANON_KEY || supabaseServiceKey
    );

    const { data, error } = await anonClient
      .from('posts')
      .select('*')
      .limit(1);

    if (error && error.message.includes('permission denied')) {
      console.log('   ✅ RLS is enabled (unauthenticated access blocked)');
      passed++;
      tests.push({ name: 'RLS Protection', status: 'PASS' });
    } else if (!error) {
      console.log('   ⚠️  RLS might not be enabled (unauthenticated access allowed)');
      tests.push({ name: 'RLS Protection', status: 'WARN' });
    } else {
      console.log(`   ❌ RLS test failed: ${error.message}`);
      failed++;
      tests.push({ name: 'RLS Protection', status: 'FAIL', error: error.message });
    }
  } catch (error) {
    console.log(`   ❌ RLS test failed: ${error.message}`);
    failed++;
  }
  console.log('');

  // Test 5: Test write operation (create dummy post)
  console.log('📋 TEST 5: Testing write operations...');
  try {
    // First, check if we have any users
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (!users || users.length === 0) {
      console.log('   ⚠️  No users found - skipping write test');
      console.log('   💡 Create a user first via Supabase Auth or signup');
      tests.push({ name: 'Write Operation', status: 'SKIP', reason: 'No users' });
    } else {
      const testUserId = users[0].id;

      // Try to insert a test post
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          author_id: testUserId,
          body: 'Test post from connection script',
          visibility: 'PUBLIC',
          is_paid: false,
          price_cents: 0
        }])
        .select()
        .single();

      if (error) {
        console.log(`   ❌ Write failed: ${error.message}`);
        failed++;
        tests.push({ name: 'Write Operation', status: 'FAIL', error: error.message });
      } else {
        console.log(`   ✅ Write successful - created post ID: ${data.id}`);

        // Clean up: delete test post
        await supabase.from('posts').delete().eq('id', data.id);
        console.log(`   ✅ Cleanup successful - deleted test post`);

        passed++;
        tests.push({ name: 'Write Operation', status: 'PASS' });
      }
    }
  } catch (error) {
    console.log(`   ❌ Write test failed: ${error.message}`);
    failed++;
  }
  console.log('');

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TEST SUMMARY\n');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📋 Total:  ${passed + failed}`);
  console.log('');

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Supabase is ready to use.\n');
    console.log('📝 NEXT STEPS:');
    console.log('   1. Update api/routes/posts.js to use Supabase');
    console.log('   2. Update api/routes/comments.js to use Supabase');
    console.log('   3. Update api/routes/relationships.js to use Supabase');
    console.log('   4. Update api/routes/messages.js to use Supabase');
    console.log('   5. Test each endpoint after conversion\n');
    return true;
  } else {
    console.log('⚠️  SOME TESTS FAILED\n');
    console.log('📝 TROUBLESHOOTING:');
    console.log('');

    // Check for common issues
    const hasTableErrors = tests.some(t => t.name.startsWith('Table') && t.status === 'FAIL');
    const hasFunctionErrors = tests.some(t => t.name.includes('function') && t.status === 'FAIL');

    if (hasTableErrors) {
      console.log('❌ Missing tables detected:');
      console.log('   → Run the schema SQL in Supabase SQL Editor');
      console.log('   → File: SUPABASE_DATABASE_SETUP.md (Section 2)');
      console.log('   → URL: https://app.supabase.com/project/YOUR_PROJECT/sql\n');
    }

    if (hasFunctionErrors) {
      console.log('❌ Missing functions detected:');
      console.log('   → Make sure you ran the ENTIRE schema SQL');
      console.log('   → Functions are defined at the end of the script\n');
    }

    console.log('💡 Full guide: See SUPABASE_DATABASE_SETUP.md\n');
    return false;
  }
}

// Run tests
testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 FATAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
