/**
 * Metrics API Route
 * Governance metrics and monitoring
 */

const express = require('express');
const router = express.Router();
const queueControl = require('../services/queueControl');

/**
 * Get Queue Metrics
 * GET /api/routes/metrics/queues
 */
router.get('/queues', (req, res) => {
    try {
        const stats = queueControl.getStats();
        res.json(stats);
    } catch (error) {
        console.error('Get queue metrics error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get System Metrics
 * GET /api/routes/metrics/system
 */
router.get('/system', (req, res) => {
    try {
        const memoryUsage = process.memoryUsage();
        
        res.json({
            uptime: process.uptime(),
            memory: {
                heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
                heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
                rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Get system metrics error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Policy Metrics
 * GET /api/routes/metrics/policy
 */
router.get('/policy', (req, res) => {
    try {
        const policyEngine = global.policyEngine;
        
        if (!policyEngine) {
            return res.status(503).json({ error: 'Policy engine not available' });
        }

        const allPolicies = policyEngine.getAllPolicies();
        const stats = policyEngine.getStats();

        res.json({
            policies: allPolicies,
            stats: stats
        });
    } catch (error) {
        console.error('Get policy metrics error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Notary Metrics
 * GET /api/routes/metrics/notary
 */
router.get('/notary', (req, res) => {
    try {
        const notary = require('../services/notary');
        const stats = notary.getLedgerStats();

        res.json(stats);
    } catch (error) {
        console.error('Get notary metrics error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
