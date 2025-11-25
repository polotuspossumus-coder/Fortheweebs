/**
 * Queue Control Routes
 * Protected by sovereign key authentication
 */

const express = require('express');
const router = express.Router();
const queueControl = require('../services/queueControl');

const SOVEREIGN_KEY = process.env.SOVEREIGN_KEY;

/**
 * Middleware: Verify sovereign key
 */
function verifySovereignKey(req, res, next) {
  const providedKey = req.headers['x-sovereign-key'] || req.body.sovereignKey || req.query.sovereignKey;

  if (!providedKey) {
    console.warn('⚠️ Queue control attempt without sovereign key', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    return res.status(401).json({
      error: 'Sovereign key required',
      code: 'NO_SOVEREIGN_KEY',
    });
  }

  if (providedKey !== SOVEREIGN_KEY) {
    console.warn('🚨 Queue control attempt with invalid sovereign key', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      providedKey: providedKey.slice(0, 4) + '***',
    });

    // Push security event to artifact stream
    if (global.artifactStream) {
      global.artifactStream.push({
        timestamp: new Date().toISOString(),
        type: 'SENTINEL',
        severity: 'critical',
        message: `⚠ Invalid sovereign key attempt on ${req.path}`,
        data: { ip: req.ip, path: req.path },
      });
    }

    return res.status(403).json({
      error: 'Invalid sovereign key',
      code: 'INVALID_SOVEREIGN_KEY',
    });
  }

  next();
}

/**
 * POST /api/queue/pause
 * Pause the moderation queue
 *
 * Body: { sovereignKey, actor, reason }
 */
router.post('/pause', verifySovereignKey, (req, res) => {
  try {
    const { actor = 'system', reason = 'Manual pause' } = req.body;

    const result = queueControl.pauseQueue(actor, reason);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error pausing queue:', error);
    res.status(500).json({
      error: 'Failed to pause queue',
      message: error.message,
    });
  }
});

/**
 * POST /api/queue/resume
 * Resume the moderation queue
 *
 * Body: { sovereignKey, actor }
 */
router.post('/resume', verifySovereignKey, (req, res) => {
  try {
    const { actor = 'system' } = req.body;

    const result = queueControl.resumeQueue(actor);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error resuming queue:', error);
    res.status(500).json({
      error: 'Failed to resume queue',
      message: error.message,
    });
  }
});

/**
 * POST /api/queue/priority
 * Set priority for a specific creator
 *
 * Body: { sovereignKey, creatorId, priority, actor }
 */
router.post('/priority', verifySovereignKey, (req, res) => {
  try {
    const { creatorId, priority, actor = 'system' } = req.body;

    if (!creatorId) {
      return res.status(400).json({
        error: 'creatorId is required',
      });
    }

    if (priority === undefined || priority === null) {
      return res.status(400).json({
        error: 'priority is required (1-10)',
      });
    }

    const result = queueControl.setPriority(creatorId, priority, actor);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error setting priority:', error);
    res.status(500).json({
      error: 'Failed to set priority',
      message: error.message,
    });
  }
});

/**
 * GET /api/queue/snapshot
 * Get current queue state
 *
 * Query: ?sovereignKey=xxx
 */
router.get('/snapshot', verifySovereignKey, (req, res) => {
  try {
    const snapshot = queueControl.getQueueSnapshot();
    res.json(snapshot);
  } catch (error) {
    console.error('❌ Error getting queue snapshot:', error);
    res.status(500).json({
      error: 'Failed to get queue snapshot',
      message: error.message,
    });
  }
});

module.exports = router;
