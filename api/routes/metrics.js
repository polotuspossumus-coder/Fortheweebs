/**
 * Metrics API Routes
 * Provides governance metrics, security summaries, and impact analysis
 */

const express = require('express');
const router = express.Router();
const metrics = require('../services/metrics');
const { getLedgerStats } = require('../services/externalLedger');

/**
 * GET /api/metrics/snapshot
 * Get current metrics snapshot
 */
router.get('/snapshot', (_req, res) => {
  try {
    const data = metrics.snapshot();
    res.json(data);
  } catch (error) {
    console.error('Error getting metrics snapshot:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

/**
 * GET /api/metrics/security
 * Get security summary (threats, blocks, etc.)
 */
router.get('/security', (_req, res) => {
  try {
    const data = metrics.getSecuritySummary();
    res.json(data);
  } catch (error) {
    console.error('Error getting security summary:', error);
    res.status(500).json({ error: 'Failed to get security summary' });
  }
});

/**
 * GET /api/metrics/impact
 * Get governance impact metrics
 */
router.get('/impact', (_req, res) => {
  try {
    const data = metrics.getImpactMetrics();
    res.json(data);
  } catch (error) {
    console.error('Error getting impact metrics:', error);
    res.status(500).json({ error: 'Failed to get impact metrics' });
  }
});

/**
 * GET /api/metrics/history
 * Get event history
 * Query params: ?limit=100&type=OVERRIDE
 */
router.get('/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const type = req.query.type;

    const data = metrics.getHistory({ limit, type });
    res.json(data);
  } catch (error) {
    console.error('Error getting metrics history:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

/**
 * GET /api/metrics/ledger
 * Get external ledger stats
 */
router.get('/ledger', (_req, res) => {
  try {
    const data = getLedgerStats();
    res.json(data);
  } catch (error) {
    console.error('Error getting ledger stats:', error);
    res.status(500).json({ error: 'Failed to get ledger stats' });
  }
});

/**
 * GET /api/metrics/dashboard
 * Get comprehensive dashboard data (all metrics in one call)
 */
router.get('/dashboard', (_req, res) => {
  try {
    const data = {
      snapshot: metrics.snapshot(),
      security: metrics.getSecuritySummary(),
      impact: metrics.getImpactMetrics(),
      ledger: getLedgerStats(),
      timestamp: new Date().toISOString(),
    };

    res.json(data);
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

module.exports = router;
