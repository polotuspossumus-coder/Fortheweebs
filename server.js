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

// Middleware
app.use(cors({
    origin: process.env.VITE_APP_URL || 'http://localhost:3002',
    credentials: true
}));

// For Stripe webhook (raw body)
app.use('/api/stripe-webhook', express.raw({ type: 'application/json' }));

// For all other routes (JSON)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// API Routes
try {
    const stripeRoutes = require('./api/stripe');
    const aiRoutes = require('./api/ai');
    const aiContentRoutes = require('./api/ai-content');
    const userTierRoutes = require('./api/user-tier');
    const uploadRoutes = require('./api/upload');
    const issuesRoutes = require('./api/issues');
    const familyAccessRoutes = require('./api/family-access');
    const micoRoutes = require('./api/mico');

    app.use('/api', stripeRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/ai-content', aiContentRoutes);
    app.use('/api', userTierRoutes);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/issues', issuesRoutes);
    app.use('/api/family-access', familyAccessRoutes);
    app.use('/api/mico', micoRoutes);
} catch (error) {
    console.error('Failed to load API routes:', error);
    console.error('Server will start without some routes');
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
