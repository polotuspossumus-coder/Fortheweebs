#!/usr/bin/env node

/**
 * Frontend-Backend Integration Test
 * Tests that all API routes work with real requests
 */

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';

let authToken = null;
let testUserId = null;
let testPostId = null;
let testCommentId = null;

console.log('\n🧪 ForTheWeebs Frontend-Backend Integration Test\n');
console.log(`📍 Testing API at: ${API_BASE}\n`);

// Helper to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP ${response.status}`);
    }

    return { success: true, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message, status: 0 };
  }
}

// Test 1: Health Check
async function testHealthCheck() {
  console.log('1️⃣  Testing Health Check...');
  const result = await apiRequest('/health', { skipAuth: true });

  if (result.success) {
    console.log('   ✅ Health check passed\n');
    return true;
  } else {
    console.log(`   ❌ Health check failed: ${result.error}\n`);
    return false;
  }
}

// Test 2: User Signup
async function testSignup() {
  console.log('2️⃣  Testing User Signup...');
  const timestamp = Date.now();
  const result = await apiRequest('/api/auth/signup', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify({
      email: `test${timestamp}@test.com`,
      username: `testuser${timestamp}`,
      password: 'TestPass123!',
      displayName: 'Test User'
    }),
  });

  if (result.success && result.data.token) {
    authToken = result.data.token;
    testUserId = result.data.user?.id;
    console.log('   ✅ Signup successful');
    console.log(`   👤 User ID: ${testUserId}`);
    console.log(`   🔑 Got auth token\n`);
    return true;
  } else {
    console.log(`   ❌ Signup failed: ${result.error}\n`);
    return false;
  }
}

// Test 3: Create Post
async function testCreatePost() {
  console.log('3️⃣  Testing Create Post...');
  const result = await apiRequest('/api/posts/create', {
    method: 'POST',
    body: JSON.stringify({
      body: 'Test post from integration test! 🚀',
      visibility: 'PUBLIC',
    }),
  });

  if (result.success && result.data.id) {
    testPostId = result.data.id;
    console.log('   ✅ Post created');
    console.log(`   📝 Post ID: ${testPostId}\n`);
    return true;
  } else {
    console.log(`   ❌ Create post failed: ${result.error}\n`);
    return false;
  }
}

// Test 4: Load Feed
async function testLoadFeed() {
  console.log('4️⃣  Testing Load Feed...');
  const result = await apiRequest('/api/posts/feed?limit=10&offset=0');

  if (result.success && result.data.posts) {
    console.log('   ✅ Feed loaded');
    console.log(`   📊 Posts in feed: ${result.data.posts.length}\n`);
    return true;
  } else {
    console.log(`   ❌ Load feed failed: ${result.error}\n`);
    return false;
  }
}

// Test 5: Like Post
async function testLikePost() {
  console.log('5️⃣  Testing Like Post...');
  if (!testPostId) {
    console.log('   ⚠️  Skipped (no post ID)\n');
    return true;
  }

  const result = await apiRequest(`/api/posts/${testPostId}/like`, {
    method: 'POST',
  });

  if (result.success) {
    console.log('   ✅ Post liked');
    console.log(`   ❤️  Liked: ${result.data.liked}\n`);
    return true;
  } else {
    console.log(`   ❌ Like post failed: ${result.error}\n`);
    return false;
  }
}

// Test 6: Create Comment
async function testCreateComment() {
  console.log('6️⃣  Testing Create Comment...');
  if (!testPostId) {
    console.log('   ⚠️  Skipped (no post ID)\n');
    return true;
  }

  const result = await apiRequest('/api/comments/create', {
    method: 'POST',
    body: JSON.stringify({
      postId: testPostId,
      body: 'Great post! 💯',
    }),
  });

  if (result.success && result.data.id) {
    testCommentId = result.data.id;
    console.log('   ✅ Comment created');
    console.log(`   💬 Comment ID: ${testCommentId}\n`);
    return true;
  } else {
    console.log(`   ❌ Create comment failed: ${result.error}\n`);
    return false;
  }
}

// Test 7: Load Comments
async function testLoadComments() {
  console.log('7️⃣  Testing Load Comments...');
  if (!testPostId) {
    console.log('   ⚠️  Skipped (no post ID)\n');
    return true;
  }

  const result = await apiRequest(`/api/comments/${testPostId}`);

  if (result.success && result.data.comments) {
    console.log('   ✅ Comments loaded');
    console.log(`   💬 Comments count: ${result.data.comments.length}\n`);
    return true;
  } else {
    console.log(`   ❌ Load comments failed: ${result.error}\n`);
    return false;
  }
}

// Test 8: Load Relationships
async function testLoadRelationships() {
  console.log('8️⃣  Testing Load Relationships...');

  const [friends, followers, following] = await Promise.all([
    apiRequest('/api/relationships/friends'),
    apiRequest('/api/relationships/followers'),
    apiRequest('/api/relationships/following'),
  ]);

  if (friends.success && followers.success && following.success) {
    console.log('   ✅ Relationships loaded');
    console.log(`   👥 Friends: ${friends.data.friends?.length || 0}`);
    console.log(`   👁️  Followers: ${followers.data.followers?.length || 0}`);
    console.log(`   🔗 Following: ${following.data.following?.length || 0}\n`);
    return true;
  } else {
    console.log(`   ❌ Load relationships failed\n`);
    return false;
  }
}

// Test 9: Load Messages
async function testLoadMessages() {
  console.log('9️⃣  Testing Load Messages...');
  const result = await apiRequest('/api/messages/conversations');

  if (result.success && result.data.conversations) {
    console.log('   ✅ Conversations loaded');
    console.log(`   💬 Conversations: ${result.data.conversations.length}\n`);
    return true;
  } else {
    console.log(`   ❌ Load messages failed: ${result.error}\n`);
    return false;
  }
}

// Test 10: Load Subscriptions
async function testLoadSubscriptions() {
  console.log('🔟 Testing Load Subscriptions...');
  const result = await apiRequest('/api/subscriptions/my-subscriptions');

  if (result.success && result.data.subscriptions) {
    console.log('   ✅ Subscriptions loaded');
    console.log(`   💎 Subscriptions: ${result.data.subscriptions.length}\n`);
    return true;
  } else {
    console.log(`   ❌ Load subscriptions failed: ${result.error}\n`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const results = [];

  results.push(await testHealthCheck());
  results.push(await testSignup());
  results.push(await testCreatePost());
  results.push(await testLoadFeed());
  results.push(await testLikePost());
  results.push(await testCreateComment());
  results.push(await testLoadComments());
  results.push(await testLoadRelationships());
  results.push(await testLoadMessages());
  results.push(await testLoadSubscriptions());

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Test Results: ${passed}/${total} passed\n`);

  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! Frontend-Backend integration is working!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check errors above.\n');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(err => {
  console.error('\n❌ Test suite crashed:', err);
  process.exit(1);
});
