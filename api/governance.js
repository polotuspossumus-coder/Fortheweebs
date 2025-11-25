/**
 * Governance API: Endpoints for Mico's authority controls
 * Provides governance notary and policy override management
 */

const express = require('express');
const router = express.Router();

// Import TypeScript modules (will be compiled)
let governanceNotary, policyOverrides, artifactLogger;

try {
  governanceNotary = require('./agents/governanceNotary');
  policyOverrides = require('./agents/policyOverrides');
  artifactLogger = require('./agents/artifactLogger');
} catch (error) {
  console.error('Failed to load governance modules:', error.message);
}

/**
 * GET /api/governance/notary/history
 * Query governance history
 */
router.get('/notary/history', async (req, res) => {
  try {
    if (!governanceNotary) {
      return res.status(503).json({ error: 'Governance notary not available' });
    }

    const { actionType, entityType, entityId, authorizedBy, hours, limit } = req.query;

    const filters = {
      actionType,
      entityType,
      entityId,
      authorizedBy,
      since: hours ? new Date(Date.now() - hours * 60 * 60 * 1000) : undefined,
      limit: limit ? parseInt(limit) : 50,
    };

    const history = await governanceNotary.queryGovernanceHistory(filters);
    res.json({ history, count: history.length });
  } catch (error) {
    console.error('Failed to query governance history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/governance/notary/summary
 * Get governance summary stats
 */
router.get('/notary/summary', async (req, res) => {
  try {
    if (!governanceNotary) {
      return res.status(503).json({ error: 'Governance notary not available' });
    }

    const hours = req.query.hours ? parseInt(req.query.hours) : 24;
    const summary = await governanceNotary.getGovernanceSummary(hours);
    res.json(summary);
  } catch (error) {
    console.error('Failed to get governance summary:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/governance/notary/audit/:entityType/:entityId
 * Get audit trail for specific entity
 */
router.get('/notary/audit/:entityType/:entityId', async (req, res) => {
  try {
    if (!governanceNotary) {
      return res.status(503).json({ error: 'Governance notary not available' });
    }

    const { entityType, entityId } = req.params;
    const trail = await governanceNotary.getAuditTrail(entityType, entityId);
    res.json({ entityType, entityId, trail, count: trail.length });
  } catch (error) {
    console.error('Failed to get audit trail:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/governance/notary/inscribe
 * Inscribe a governance decision (Mico only)
 */
router.post('/notary/inscribe', async (req, res) => {
  try {
    if (!governanceNotary) {
      return res.status(503).json({ error: 'Governance notary not available' });
    }

    const { actionType, entityType, entityId, beforeState, afterState, justification, authorizedBy } = req.body;

    if (!actionType || !justification) {
      return res.status(400).json({ error: 'actionType and justification are required' });
    }

    const recordId = await governanceNotary.inscribeDecision({
      actionType,
      entityType,
      entityId,
      beforeState,
      afterState,
      justification,
      authorizedBy: authorizedBy || 'mico',
    });

    res.json({ success: true, recordId });
  } catch (error) {
    console.error('Failed to inscribe decision:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/governance/overrides
 * Get all active policy overrides
 */
router.get('/overrides', async (req, res) => {
  try {
    if (!policyOverrides) {
      return res.status(503).json({ error: 'Policy overrides not available' });
    }

    const overrides = await policyOverrides.getAllOverrides();
    res.json({ overrides, count: overrides.length });
  } catch (error) {
    console.error('Failed to get policy overrides:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/governance/overrides/:key
 * Get specific policy override
 */
router.get('/overrides/:key', async (req, res) => {
  try {
    if (!policyOverrides) {
      return res.status(503).json({ error: 'Policy overrides not available' });
    }

    const override = await policyOverrides.getOverride(req.params.key);
    if (!override) {
      return res.status(404).json({ error: 'Override not found' });
    }
    res.json(override);
  } catch (error) {
    console.error('Failed to get policy override:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/governance/overrides
 * Set a policy override (Mico only)
 */
router.post('/overrides', async (req, res) => {
  try {
    if (!policyOverrides) {
      return res.status(503).json({ error: 'Policy overrides not available' });
    }

    const { overrideKey, overrideType, overrideValue, active, expiresAt, setBy, reason } = req.body;

    if (!overrideKey || !overrideType || !overrideValue) {
      return res.status(400).json({ error: 'overrideKey, overrideType, and overrideValue are required' });
    }

    const overrideId = await policyOverrides.setOverride({
      overrideKey,
      overrideType,
      overrideValue,
      active,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      setBy: setBy || 'mico',
      reason,
    });

    res.json({ success: true, overrideId });
  } catch (error) {
    console.error('Failed to set policy override:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/governance/overrides/:key
 * Deactivate a policy override
 */
router.delete('/overrides/:key', async (req, res) => {
  try {
    if (!policyOverrides) {
      return res.status(503).json({ error: 'Policy overrides not available' });
    }

    const reason = req.body.reason || 'Manual deactivation';
    await policyOverrides.deactivateOverride(req.params.key, reason);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to deactivate override:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/governance/threshold
 * Set moderation threshold (runtime override)
 */
router.post('/threshold', async (req, res) => {
  try {
    if (!policyOverrides) {
      return res.status(503).json({ error: 'Policy overrides not available' });
    }

    const { contentType, flagType, threshold, reason, setBy } = req.body;

    if (!contentType || !flagType || threshold === undefined || !reason) {
      return res.status(400).json({ error: 'contentType, flagType, threshold, and reason are required' });
    }

    await policyOverrides.setModerationThreshold(contentType, flagType, threshold, reason, setBy || 'mico');
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to set moderation threshold:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/governance/lanes
 * Get all active priority lanes
 */
router.get('/lanes', async (req, res) => {
  try {
    if (!policyOverrides) {
      return res.status(503).json({ error: 'Policy overrides not available' });
    }

    const lanes = await policyOverrides.getPriorityLanes();
    res.json({ lanes, count: lanes.length });
  } catch (error) {
    console.error('Failed to get priority lanes:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/governance/lanes/:name/pause
 * Pause a priority lane
 */
router.post('/lanes/:name/pause', async (req, res) => {
  try {
    if (!policyOverrides) {
      return res.status(503).json({ error: 'Policy overrides not available' });
    }

    const reason = req.body.reason || 'Manual pause';
    await policyOverrides.pausePriorityLane(req.params.name, reason);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to pause priority lane:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/governance/lanes/:name/resume
 * Resume a priority lane
 */
router.post('/lanes/:name/resume', async (req, res) => {
  try {
    if (!policyOverrides) {
      return res.status(503).json({ error: 'Policy overrides not available' });
    }

    await policyOverrides.resumePriorityLane(req.params.name);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to resume priority lane:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/governance/artifacts/stream
 * Server-Sent Events stream of real-time artifacts
 */
router.get('/artifacts/stream', async (req, res) => {
  try {
    if (!artifactLogger) {
      return res.status(503).json({ error: 'Artifact logger not available' });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

    // Query recent artifacts every 2 seconds
    let lastTimestamp = new Date();
    const interval = setInterval(async () => {
      try {
        const artifacts = await artifactLogger.queryArtifacts({
          since: lastTimestamp,
          limit: 10,
        });

        if (artifacts.length > 0) {
          lastTimestamp = new Date(artifacts[0].timestamp);
          artifacts.forEach((artifact) => {
            res.write(`data: ${JSON.stringify({ type: 'artifact', artifact })}\n\n`);
          });
        }
      } catch (error) {
        console.error('SSE stream error:', error);
      }
    }, 2000);

    // Clean up on disconnect
    req.on('close', () => {
      clearInterval(interval);
    });
  } catch (error) {
    console.error('Failed to start SSE stream:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/governance/artifacts/recent
 * Get recent artifacts (last 50)
 */
router.get('/artifacts/recent', async (req, res) => {
  try {
    if (!artifactLogger) {
      return res.status(503).json({ error: 'Artifact logger not available' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const artifacts = await artifactLogger.queryArtifacts({ limit });
    res.json({ artifacts, count: artifacts.length });
  } catch (error) {
    console.error('Failed to get recent artifacts:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
