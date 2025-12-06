console.log('🚀 Starting ForTheWeebs API Server...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);

const express = require('express');
const http = require('http');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

console.log('✅ Express and dotenv loaded');

// ============================================================================
// ENVIRONMENT VARIABLE VALIDATION
// ============================================================================
const REQUIRED_ENV = ['STRIPE_SECRET_KEY', 'OPENAI_API_KEY', 'JWT_SECRET'];
const OPTIONAL_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'PHOTODNA_API_KEY'];

const missing = REQUIRED_ENV.filter(key => !process.env[key]);
const optional_missing = OPTIONAL_ENV.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ CRITICAL: Missing required environment variables:', missing.join(', '));
  console.error('💡 Add these to your .env file before starting the server');
  process.exit(1);
}

if (optional_missing.length > 0) {
  console.warn('⚠️  Optional environment variables missing:', optional_missing.join(', '));
  console.warn('💡 Some features may be disabled without these');
}

console.log('✅ Environment validation passed');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Trust Railway/Vercel proxy for rate limiting
app.set('trust proxy', true);

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

// ============================================================================
// REQUEST ID TRACING MIDDLEWARE
// ============================================================================
app.use((req, res, next) => {
  req.id = crypto.randomUUID().slice(0, 8);
  req.startTime = Date.now();

  // Log all requests with timing
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const status = res.statusCode;
    const emoji = status < 400 ? '✅' : status < 500 ? '⚠️' : '❌';
    console.log(`[${req.id}] ${emoji} ${req.method} ${req.path} - ${status} (${duration}ms)`);
  });

  next();
});

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

// Feature flags
const { featureFlags } = require('./config/featureFlags');

// Health check with feature status
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        features: featureFlags.getStatus()
    });
});

// Feature status endpoint
app.get('/api/features/status', (req, res) => {
    res.json({
        status: featureFlags.getStatus(),
        disabled: featureFlags.getDisabledFeatures(),
        message: featureFlags.socialMediaEnabled
            ? 'All features enabled'
            : 'Social media features will be enabled once PhotoDNA API key is configured'
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
    { path: '/api/webhooks/ccbill', file: './api/ccbill-webhook', name: 'CCBill Webhooks (Adult Content)' },
    { path: '/api/crypto', file: './api/crypto-payments', name: 'Crypto Payments' },
    { path: '/api/subscriptions', file: './api/routes/subscriptions', name: 'Subscriptions (Creator Monetization)' },

    // Social Media Core - REQUIRES PhotoDNA
    { path: '/api/posts', file: './api/routes/posts', name: 'Posts (Feed)', requirePhotoDNA: true },
    { path: '/api/comments', file: './api/routes/comments', name: 'Comments & Replies', requirePhotoDNA: true },
    { path: '/api/relationships', file: './api/routes/relationships', name: 'Friends & Follows', requirePhotoDNA: true },
    { path: '/api/messages', file: './api/routes/messages', name: 'Direct Messages', requirePhotoDNA: true },
    { path: '/api/notifications', file: './api/routes/notifications', name: 'Notifications', requirePhotoDNA: true },

    // User & Access Control
    { path: '/api/tier-access', file: './api/tier-access', name: 'Tier Access' },
    { path: '/api/tier-upgrades', file: './api/tier-upgrades', name: 'Tier Upgrades' },
    { path: '/api/blocks', file: './api/block-enforcement', name: 'Block Enforcement' },
    { path: '/api', file: './api/user-tier', name: 'User Tier' },
    { path: '/api/auth', file: './api/auth', name: 'Authentication (JWT)' },
    { path: '/api/family-access', file: './api/family-access', name: 'Family Access' },
    { path: '/api/accounts', file: './api/accounts', name: 'Multi-Account System' },

    // Admin & System
    { path: '/api/admin', file: './api/admin-stats', name: 'Admin Stats & Health' },

    // Content & AI
    { path: '/api/ai', file: './api/ai', name: 'AI' },
    { path: '/api/ai-content', file: './api/ai-content', name: 'AI Content' },
    { path: '/api/ai/review', file: './api/ai-review-content', name: 'AI Auto-Review (Copyright)' },
    { path: '/api/upload', file: './api/upload-protected', name: 'Upload (Protected)' },
    { path: '/api/moderation', file: './api/moderation-actions', name: 'AI CSAM Moderation' },

    // Advanced Features
    { path: '/api/analytics', file: './api/routes/analytics', name: 'Analytics Dashboard' },
    { path: '/api/activity', file: './api/routes/activity', name: 'Real-Time Activity Feed' },
    { path: '/api/experiments', file: './api/routes/experiments', name: 'A/B Testing Framework' },

    // Creator Tools
    { path: '/api/creator-applications', file: './api/creator-applications', name: 'Creator Applications' },
    { path: '/api/trial', file: './api/trial', name: 'Free Trial System' },
    { path: '/api/creator-copyright', file: './api/creator-copyright-requests', name: 'Creator Copyright Requests (AI-Validated)' },

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
    { path: '/api/issues', file: './api/issues', name: 'Issues' },

    // New Feature APIs (Nov 26, 2025 Update)
    { path: '/api/moderation', file: './api/moderation', name: 'Community Moderation System' },
    { path: '/api/merch', file: './api/merch', name: 'Merchandise Store' },
    { path: '/api/rewards', file: './api/rewards', name: 'Fan Rewards & Loyalty' },
    { path: '/api/collaboration', file: './api/collaboration', name: 'Collaboration Rooms' },
    { path: '/api/render', file: './api/render', name: 'Cloud Rendering' },
    { path: '/api/analytics', file: './api/analytics', name: 'Creator Analytics' },
    
    // Epic Features (Dec 3, 2025 - Mico's Vision)
    { path: '/api/epic', file: './api/epic-features', name: 'Epic Features (Style DNA, Proof, Scene Intel, XR Exports)' },
    
    // Sovereignty Epic Features - Phase 2 (Dec 3, 2025)
    { path: '/api/time-machine', file: './api/time-machine', name: 'Time Machine (Version Control)' },
    { path: '/api/virtual-studio', file: './api/virtual-studio', name: 'Virtual Studio (Background Replacement)' },
    { path: '/api/scene-intelligence', file: './api/scene-intelligence', name: 'Scene Intelligence (Cinematic Effects)' },
    { path: '/api/deepfake-protection', file: './api/deepfake-protection', name: 'Deepfake Protection (Face Signatures)' },
    { path: '/api/ai-style-learning', file: './api/ai-style-learning', name: 'AI Style Learning (Edit Patterns)' },
    { path: '/api/scene-removal', file: './api/scene-removal', name: 'Scene Removal (Object Removal)' },
    { path: '/api/prompt-to-content', file: './api/prompt-to-content', name: 'Prompt-to-Content (Text-to-Media)' },
    { path: '/api/invisible-watermark', file: './api/invisible-watermark', name: 'Invisible Watermark (LSB Steganography)' },
    { path: '/api/content-dna', file: './api/content-dna', name: 'Content DNA (Perceptual Hashing)' },
    { path: '/api/collaboration-ghosts', file: './api/collaboration-ghosts', name: 'Collaboration Ghosts (Multiplayer)' },
    { path: '/api/gratitude-logger', file: './api/gratitude-logger', name: 'Gratitude Logger (Artifact Tracking)' },
    { path: '/api/ai/generative-fill', file: './api/ai-generative-fill', name: '🤖 AI Generative Fill (Figma Killer)' },
    { path: '/api/ai/segment-object', file: './api/ai-generative-fill', name: '🎯 Smart Object Selection (SAM)' },
    { path: '/api/ai/inpaint', file: './api/ai-generative-fill', name: '🗑️ AI Object Removal (Inpainting)' },
    { path: '/api/ai/outpaint', file: './api/ai-generative-fill', name: '🔲 AI Image Extension (Outpainting)' },
    
    // AI Audio Production - Logic Pro/Ableton/iZotope Killer
    { path: '/api/audio/stem-split', file: './api/audio-production', name: '🎵 AI Stem Separation (iZotope $399 → FREE)' },
    { path: '/api/audio/master', file: './api/audio-production', name: '🎛️ AI Mastering (LANDR $29/mo → FREE)' },
    { path: '/api/audio/pitch-correct', file: './api/audio-production', name: '🎤 Auto-Tune (Antares $399 → FREE)' },
    { path: '/api/audio/tempo-detect', file: './api/audio-production', name: '⏱️ BPM Detection (Spotify API)' },
    { path: '/api/audio/quantize', file: './api/audio-production', name: '📐 Smart Quantize (Logic Pro Feature)' },
    { path: '/api/audio/session-player', file: './api/audio-production', name: '🎹 AI Session Players (Logic $200 → FREE)' },
    { path: '/api/audio/spatial-audio', file: './api/audio-production', name: '🔊 Spatial Audio (Dolby Atmos)' },
    
    // VR/AR Production - Unity/Unreal Killer
    { path: '/api/vr/generate-3d', file: './api/vr-ar-production', name: '🎨 Text-to-3D (Unity $200/mo → FREE)' },
    { path: '/api/vr/optimize-mesh', file: './api/vr-ar-production', name: '⚡ VR Mesh Optimizer (Quest/VIVE)' },
    { path: '/api/vr/generate-environment', file: './api/vr-ar-production', name: '🌍 AI VR Environment Generator' },
    { path: '/api/vr/export-scene', file: './api/vr-ar-production', name: '📦 Multi-Platform Export (WebXR/Quest/Vision Pro)' },
    { path: '/api/vr/edit-360-video', file: './api/vr-ar-production', name: '🎥 360° Video Editor' },
    { path: '/api/vr/train-gesture', file: './api/vr-ar-production', name: '✋ Hand Gesture Trainer' },
    
    // MICO PRIORITY FEATURES - Critical Migration Tools
    { path: '/api/psd/import-psd', file: './api/psd-support', name: '📁 PSD Import (Photoshop Migration)' },
    { path: '/api/psd/export-psd', file: './api/psd-support', name: '💾 PSD Export (Photoshop Compatibility)' },
    { path: '/api/comic/generate-panels', file: './api/comic-panel-generator', name: '🎨 AI Comic Panel Generator (NO COMPETITOR HAS THIS)' },
    { path: '/api/comic/generate-speech-bubbles', file: './api/comic-panel-generator', name: '💬 AI Speech Bubble Generator' },
    { path: '/api/templates', file: './api/template-marketplace', name: '📚 Template Marketplace (Canva Killer)' }
];

let loadedCount = 0;
let failedCount = 0;
let blockedCount = 0;

const { requirePhotoDNA } = require('./config/featureFlags');

routes.forEach(({ path, file, name, requirePhotoDNA: needsPhotoDNA }) => {
    try {
        const route = require(file);

        // Apply PhotoDNA middleware if required
        if (needsPhotoDNA) {
            if (featureFlags.socialMediaEnabled) {
                app.use(path, route);
                console.log(`✅ ${name}`);
                loadedCount++;
            } else {
                // Block with middleware that returns 503
                app.use(path, requirePhotoDNA);
                console.log(`🔒 ${name} (blocked until PhotoDNA configured)`);
                blockedCount++;
            }
        } else {
            app.use(path, route);
            console.log(`✅ ${name}`);
            loadedCount++;
        }
    } catch (error) {
        console.warn(`⚠️  ${name} (skipped - ${error.message.substring(0, 40)})`);
        failedCount++;
    }
});

console.log(`\n📊 Routes loaded: ${loadedCount}/${routes.length} ${failedCount > 0 ? `(${failedCount} skipped)` : ''}`);
if (blockedCount > 0) {
    console.log(`🔒 ${blockedCount} routes blocked pending PhotoDNA API key`);
    console.log(`💡 Add PHOTODNA_API_KEY to .env to enable social media features`);
}


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
    console.log('🔍 Server is listening and keeping process alive...');
    setInterval(() => {
        console.log('⏰ Keepalive ping:', new Date().toISOString());
    }, 30000);
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
    console.error('💥 Uncaught Exception:', error);
    console.error('Stack:', error.stack);
    // Don't exit immediately - log and continue
    // process.exit(1);
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
