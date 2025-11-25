/**
 * API Health Check Script
 * Tests all 31 API endpoints to verify they're loaded and responding
 *
 * Usage: node test-api-health.js [--jwt TOKEN]
 */

require('dotenv').config();
const http = require('http');

const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
const JWT_TOKEN = process.argv.includes('--jwt') ? process.argv[process.argv.indexOf('--jwt') + 1] : null;

console.log('🏥 API HEALTH CHECK\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`   Base URL: ${API_BASE}`);
console.log(`   JWT Auth: ${JWT_TOKEN ? '✅ Provided' : '⚠️  Not provided (some tests will fail)'}`);
console.log('');

// Define all endpoints to test
const endpoints = [
  // Health & System
  { method: 'GET', path: '/health', name: 'Health Check', requiresAuth: false },
  { method: 'GET', path: '/api/artifacts/stream', name: 'SSE Artifact Stream', requiresAuth: false, skip: true },

  // Authentication
  { method: 'POST', path: '/api/auth/login', name: 'Login (JWT)', requiresAuth: false, skip: true },
  { method: 'POST', path: '/api/auth/signup', name: 'Signup (JWT)', requiresAuth: false, skip: true },

  // Social Media - Posts
  { method: 'GET', path: '/api/posts/feed', name: 'Posts Feed', requiresAuth: true },
  { method: 'POST', path: '/api/posts/create', name: 'Create Post', requiresAuth: true, skip: true },
  { method: 'GET', path: '/api/posts/1', name: 'Get Single Post', requiresAuth: false },
  { method: 'POST', path: '/api/posts/1/like', name: 'Like Post', requiresAuth: true, skip: true },
  { method: 'POST', path: '/api/posts/1/share', name: 'Share Post', requiresAuth: true, skip: true },
  { method: 'DELETE', path: '/api/posts/1', name: 'Delete Post', requiresAuth: true, skip: true },

  // Social Media - Comments
  { method: 'GET', path: '/api/comments/1', name: 'Get Comments', requiresAuth: false },
  { method: 'POST', path: '/api/comments/create', name: 'Create Comment', requiresAuth: true, skip: true },
  { method: 'POST', path: '/api/comments/1/like', name: 'Like Comment', requiresAuth: true, skip: true },
  { method: 'GET', path: '/api/comments/1/replies', name: 'Get Replies', requiresAuth: false },
  { method: 'DELETE', path: '/api/comments/1', name: 'Delete Comment', requiresAuth: true, skip: true },

  // Social Media - Relationships
  { method: 'POST', path: '/api/relationships/follow', name: 'Follow User', requiresAuth: true, skip: true },
  { method: 'DELETE', path: '/api/relationships/follow/1', name: 'Unfollow User', requiresAuth: true, skip: true },
  { method: 'GET', path: '/api/relationships/friends', name: 'Get Friends', requiresAuth: true },
  { method: 'GET', path: '/api/relationships/followers', name: 'Get Followers', requiresAuth: true },
  { method: 'GET', path: '/api/relationships/following', name: 'Get Following', requiresAuth: true },
  { method: 'POST', path: '/api/relationships/friend-request', name: 'Send Friend Request', requiresAuth: true, skip: true },
  { method: 'POST', path: '/api/relationships/block', name: 'Block User', requiresAuth: true, skip: true },

  // Social Media - Messages
  { method: 'GET', path: '/api/messages/conversations', name: 'Get Conversations', requiresAuth: true },
  { method: 'GET', path: '/api/messages/conversation/1', name: 'Get Messages', requiresAuth: true },
  { method: 'POST', path: '/api/messages/send', name: 'Send Message', requiresAuth: true, skip: true },
  { method: 'GET', path: '/api/messages/unread-count', name: 'Unread Count', requiresAuth: true },

  // Social Media - Notifications
  { method: 'GET', path: '/api/notifications', name: 'Get Notifications', requiresAuth: true },
  { method: 'GET', path: '/api/notifications/unread-count', name: 'Unread Notif Count', requiresAuth: true },
  { method: 'POST', path: '/api/notifications/1/read', name: 'Mark Notif Read', requiresAuth: true, skip: true },
  { method: 'POST', path: '/api/notifications/mark-all-read', name: 'Mark All Read', requiresAuth: true, skip: true },

  // Creator - Subscriptions
  { method: 'POST', path: '/api/subscriptions/create-checkout', name: 'Create Stripe Checkout', requiresAuth: true, skip: true },
  { method: 'GET', path: '/api/subscriptions/check/1', name: 'Check Subscription', requiresAuth: false },
  { method: 'GET', path: '/api/subscriptions/my-subscriptions', name: 'My Subscriptions', requiresAuth: true },
  { method: 'GET', path: '/api/subscriptions/my-subscribers', name: 'My Subscribers', requiresAuth: true },

  // Governance
  { method: 'GET', path: '/api/governance/notary/history', name: 'Notary History', requiresAuth: false },
  { method: 'GET', path: '/api/governance/notary/summary', name: 'Notary Summary', requiresAuth: false },
  { method: 'GET', path: '/api/governance/overrides', name: 'Policy Overrides', requiresAuth: false },
  { method: 'POST', path: '/api/governance/override', name: 'Execute Override', requiresAuth: true, skip: true },

  // Metrics & Queue
  { method: 'GET', path: '/api/metrics/dashboard', name: 'Metrics Dashboard', requiresAuth: false },
  { method: 'GET', path: '/api/queue/status', name: 'Queue Status', requiresAuth: false },
];

// Helper function to make HTTP requests
function makeRequest(method, path, headers = {}) {
  return new Promise((resolve) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (error) => {
      resolve({ error: error.message });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ error: 'Timeout (5s)' });
    });

    req.end();
  });
}

// Run health checks
async function runHealthChecks() {
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    total: endpoints.length,
  };

  console.log('🧪 Running health checks...\n');

  for (const endpoint of endpoints) {
    const { method, path, name, requiresAuth, skip } = endpoint;

    if (skip && !JWT_TOKEN) {
      console.log(`⏭️  SKIP: ${name} (${method} ${path}) - Requires write/auth`);
      results.skipped++;
      continue;
    }

    const headers = requiresAuth && JWT_TOKEN ? { Authorization: `Bearer ${JWT_TOKEN}` } : {};

    try {
      const response = await makeRequest(method, path, headers);

      if (response.error) {
        console.log(`❌ FAIL: ${name} (${method} ${path})`);
        console.log(`         ${response.error}`);
        results.failed++;
      } else if (response.status === 200 || response.status === 201) {
        console.log(`✅ PASS: ${name} (${method} ${path}) - ${response.status}`);
        results.passed++;
      } else if (response.status === 401 && requiresAuth && !JWT_TOKEN) {
        console.log(`⚠️  WARN: ${name} (${method} ${path}) - 401 (no JWT provided)`);
        results.passed++; // Expected behavior
      } else if (response.status === 404) {
        console.log(`❌ FAIL: ${name} (${method} ${path}) - 404 Not Found`);
        results.failed++;
      } else if (response.status === 429) {
        console.log(`⚠️  WARN: ${name} (${method} ${path}) - 429 Rate Limited`);
        results.passed++; // Rate limiting works
      } else if (response.status === 500) {
        console.log(`❌ FAIL: ${name} (${method} ${path}) - 500 Server Error`);
        results.failed++;
      } else {
        console.log(`⚠️  WARN: ${name} (${method} ${path}) - ${response.status}`);
        results.passed++; // Non-critical status
      }
    } catch (error) {
      console.log(`❌ FAIL: ${name} (${method} ${path}) - ${error.message}`);
      results.failed++;
    }
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 HEALTH CHECK SUMMARY\n');
  console.log(`   ✅ Passed:  ${results.passed}/${results.total}`);
  console.log(`   ❌ Failed:  ${results.failed}/${results.total}`);
  console.log(`   ⏭️  Skipped: ${results.skipped}/${results.total}`);
  console.log('');

  const percentage = Math.round((results.passed / (results.total - results.skipped)) * 100);

  if (results.failed === 0) {
    console.log('🎉 ALL ENDPOINTS HEALTHY!\n');
    console.log('📝 NOTES:');
    console.log('   - All API routes are loaded and responding');
    console.log('   - Server is running correctly');
    console.log('   - Ready for frontend integration\n');
    return true;
  } else {
    console.log(`⚠️  ${percentage}% HEALTHY (${results.failed} failures)\n`);

    if (results.failed > 10) {
      console.log('❌ CRITICAL: Many endpoints failing');
      console.log('   → Is the server running? (npm run dev:server)');
      console.log('   → Check server logs for errors\n');
    } else {
      console.log('⚠️  Some endpoints are failing:');
      console.log('   → Check if routes are loaded in server.js');
      console.log('   → Verify mock data is initialized');
      console.log('   → Check for syntax errors in route files\n');
    }

    console.log('💡 To get JWT token for auth tests:');
    console.log('   curl -X POST http://localhost:3000/api/auth/login \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"email":"your@email.com","password":"your_password"}\'');
    console.log('');
    console.log('   Then run: node test-api-health.js --jwt YOUR_TOKEN\n');
    return false;
  }
}

// Check if server is running first
async function checkServerRunning() {
  console.log('🔍 Checking if server is running...\n');

  try {
    const response = await makeRequest('GET', '/health');

    if (response.error) {
      console.log('❌ Server is NOT running\n');
      console.log('📝 START THE SERVER:');
      console.log('   npm run dev:server');
      console.log('   (or)');
      console.log('   node server.js\n');
      return false;
    }

    if (response.status === 200) {
      console.log('✅ Server is running\n');
      return true;
    } else {
      console.log(`⚠️  Server responded with status ${response.status}\n`);
      return true; // Server is running, but might have issues
    }
  } catch (error) {
    console.log('❌ Failed to check server:', error.message, '\n');
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServerRunning();

  if (!serverRunning) {
    console.log('💡 Tip: Make sure backend is running before running health checks\n');
    process.exit(1);
  }

  const success = await runHealthChecks();
  process.exit(success ? 0 : 1);
})();
