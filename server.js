console.log('🚀 Starting ForTheWeebs API Server...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);

const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

console.log('✅ Express and dotenv loaded');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

console.log('📡 Port:', PORT);

// Security Headers
const securityHeaders = require('./utils/securityHeaders');
app.use(securityHeaders);

// Rate Limiting
const { apiLimiter } = require('./utils/apiRateLimiter');
app.use('/api', apiLimiter);

// DATA PRIVACY ENFORCEMENT - WE NEVER SELL USER DATA
const { dataPrivacyMiddleware } = require('./utils/dataPrivacyEnforcement');
app.use('/api', dataPrivacyMiddleware);
console.log('🔒 Data privacy enforcement active - user data selling is BLOCKED');

// Middleware
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(cors({
    origin: process.env.VITE_APP_URL || 'http://localhost:3002',
    credentials: true
}));

// For Stripe webhook (raw body)
app.use('/api/stripe-webhook', express.raw({ type: 'application/json' }));

// For all other routes (JSON)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Disable x-powered-by header for security
app.disable('x-powered-by');

// Initialize Policy Engine and SSE Artifact Stream
const { initArtifactStream, sseRoute } = require('./api/services/sse');
const policyEngine = require('./api/policy/policyEngine');
const { notaryRecord } = require('./api/services/notary');

initArtifactStream();

// Wire policy changes to artifact stream and notary
policyEngine.on('policy:changed', (evt) => {
  // Push to artifact stream
  global.artifactStream.push({
    timestamp: evt.ts,
    type: 'POLICY',
    severity: 'info',
    message: `Updated ${evt.type}.${evt.key}=${evt.value} v${evt.version}`,
    data: evt,
  });

  // Record in notary ledger
  notaryRecord({
    actor: 'policy_engine',
    command: `update_${evt.type}`,
    key: evt.key,
    value: evt.value,
    oldValue: evt.oldValue,
    version: evt.version,
  });
});

// SSE artifact stream endpoint
app.get('/api/artifacts/stream', sseRoute);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Socket.io setup for WebRTC signaling
let io;
try {
    const { Server } = require('socket.io');
    const { router: signalingRouter, setupSignaling } = require('./api/signaling');

    io = new Server(server, {
        cors: {
            origin: process.env.VITE_APP_URL || 'http://localhost:3002',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    setupSignaling(io);
    app.use('/api/calls', signalingRouter);
    console.log('✅ WebRTC signaling server initialized');
} catch (error) {
    console.warn('⚠️ Socket.io not available (install with: npm install socket.io)');
}

// API Routes - Load individually with error handling
const routes = [
    // Payment & Monetization
    { path: '/api', file: './api/stripe', name: 'Stripe' },
    { path: '/api/stripe-connect', file: './api/stripe-connect', name: 'Stripe Connect' },
    { path: '/api/stripe-webhooks', file: './api/stripe-webhooks', name: 'Stripe Webhooks' },
    { path: '/api/crypto', file: './api/crypto-payments', name: 'Crypto Payments' },
    { path: '/api/subscriptions', file: './api/routes/subscriptions', name: 'Subscriptions (Creator Monetization)' },

    // Social Media Core
    { path: '/api/posts', file: './api/routes/posts', name: 'Posts (Feed)' },
    { path: '/api/comments', file: './api/routes/comments', name: 'Comments & Replies' },
    { path: '/api/relationships', file: './api/routes/relationships', name: 'Friends & Follows' },
    { path: '/api/messages', file: './api/routes/messages', name: 'Direct Messages' },
    { path: '/api/notifications', file: './api/routes/notifications', name: 'Notifications' },

    // User & Access Control
    { path: '/api/tier-access', file: './api/tier-access', name: 'Tier Access' },
    { path: '/api/tier-upgrades', file: './api/tier-upgrades', name: 'Tier Upgrades' },
    { path: '/api/blocks', file: './api/block-enforcement', name: 'Block Enforcement' },
    { path: '/api', file: './api/user-tier', name: 'User Tier' },
    { path: '/api/auth', file: './api/auth', name: 'Authentication (JWT)' },
    { path: '/api/family-access', file: './api/family-access', name: 'Family Access' },

    // Content & AI
    { path: '/api/ai', file: './api/ai', name: 'AI' },
    { path: '/api/ai-content', file: './api/ai-content', name: 'AI Content' },
    { path: '/api/upload', file: './api/upload-protected', name: 'Upload (Protected)' },
    { path: '/api/moderation', file: './api/moderation-actions', name: 'AI CSAM Moderation' },

    // Creator Tools
    { path: '/api/creator-applications', file: './api/creator-applications', name: 'Creator Applications' },
    { path: '/api/trial', file: './api/trial', name: 'Free Trial System' },

    // Mico AI & Governance
    { path: '/api/mico', file: './api/mico', name: 'Mico AI' },
    { path: '/api/mico-hybrid', file: './api/mico-hybrid', name: 'Mico Hybrid (Mico + Claude)' },
    { path: '/api/governance', file: './api/governance', name: 'Mico Governance (Notary + Policy Overrides)' },
    { path: '/api/queue', file: './api/routes/queue', name: 'Queue Control (Sovereign)' },
    { path: '/api/metrics', file: './api/routes/metrics', name: 'Governance Metrics' },

    // Developer Tools
    { path: '/api/auto-implement-suggestions', file: './src/routes/auto-implement-suggestions', name: 'Auto-Implement Suggestions' },
    { path: '/api/auto-answer-questions', file: './src/routes/auto-answer-questions', name: 'Auto-Answer Questions' },
    { path: '/api/debugger-to-cloud', file: './src/routes/debugger-to-cloud', name: 'Cloud Bug Fixer' },
    { path: '/api/issues', file: './api/issues', name: 'Issues' }
];

let loadedCount = 0;
let failedCount = 0;

routes.forEach(({ path, file, name }) => {
    try {
        const route = require(file);
        app.use(path, route);
        console.log(`✅ ${name}`);
        loadedCount++;
    } catch (error) {
        console.warn(`⚠️  ${name} (skipped - ${error.message.substring(0, 40)})`);
        failedCount++;
    }
});

console.log(`\n📊 Routes loaded: ${loadedCount}/${routes.length} ${failedCount > 0 ? `(${failedCount} skipped)` : ''}`);


// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
console.log('🎯 Attempting to start server on port', PORT);

server.listen(PORT, '0.0.0.0', (err) => {
    if (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
    console.log(`✅ Server started successfully!`);
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 ForTheWeebs API Server                              ║
║                                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                                 ║
║   Port: ${PORT}                                              ║
║   URL: http://localhost:${PORT}                             ║
║                                                           ║
║   Endpoints:                                              ║
║   - GET  /health                                          ║
║   - POST /api/create-checkout-session                     ║
║   - POST /api/stripe-webhook                              ║
║   - GET  /api/user/:userId/tier                           ║
║   - POST /api/ai/analyze-screenshot                       ║
║   - POST /api/ai/generate-fix                             ║
║   - POST /api/ai/create-pr                                ║
║   - GET  /api/family-access/list                          ║
║   - POST /api/family-access/generate                      ║
║   - GET  /api/family-access/verify                        ║
║   - POST /api/family-access/redeem                        ║
║   - DELETE /api/family-access/delete                      ║
║   - GET  /api/mico/status                🧠               ║
║   - POST /api/mico/chat                  🧠               ║
║   - POST /api/mico/tool/*                🧠               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

module.exports = app;
