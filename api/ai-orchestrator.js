/**
 * AI ORCHESTRATOR API
 *
 * Endpoints to control the multi-agent AI system
 */

const express = require('express');
const router = express.Router();
const { isOwner, isVIP } = require('../utils/vipAccess');

// This will be initialized with your API keys from environment
let orchestrator = null;

// VIP & Owner only middleware
const requireVIPOrOwner = (req, res, next) => {
  const userEmail = req.headers['x-user-email'] || req.body.userEmail || req.query.userEmail;
  const userId = req.headers['x-user-id'] || req.body.userId || req.query.userId;

  // Owner gets full access
  if (isOwner(userEmail) || userId === 'owner') {
    req.isOwner = true;
    req.isVIP = false;
    return next();
  }

  // VIPs get full access too
  if (isVIP(userEmail)) {
    req.isOwner = false;
    req.isVIP = true;
    return next();
  }

  // Everyone else gets basic shit
  return res.status(403).json({
    error: 'VIP or Owner access required',
    message: 'The AI Orchestrator is a premium feature. Upgrade to VIP for full access.',
    upgradeUrl: '/pricing'
  });
};

// Apply to all routes
router.use(requireVIPOrOwner);

// Initialize on first use
function getOrchestrator() {
  if (!orchestrator) {
    const { initializeOrchestrator } = require('../src/ai-orchestrator.ts');
    orchestrator = initializeOrchestrator(
      process.env.ANTHROPIC_API_KEY,
      process.env.OPENAI_API_KEY
    );
    orchestrator.start();
  }
  return orchestrator;
}

// --------------------------------------------------------------------------
// TASK SUBMISSION
// --------------------------------------------------------------------------

/**
 * POST /api/orchestrator/task
 * Submit a new task to the orchestrator
 */
router.post('/task', async (req, res) => {
  try {
    const { type, input, priority } = req.body;

    if (!type || !input) {
      return res.status(400).json({ error: 'Missing type or input' });
    }

    const orch = getOrchestrator();
    const taskId = await orch.submitTask(type, input, priority || 'medium');

    res.json({ success: true, taskId });
  } catch (error) {
    console.error('Task submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/orchestrator/task/:taskId
 * Get task status
 */
router.get('/task/:taskId', (req, res) => {
  try {
    const { taskId } = req.params;
    const orch = getOrchestrator();
    const task = orch.getTask(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Task lookup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------------------------------------
// WORKFLOW SHORTCUTS
// --------------------------------------------------------------------------

/**
 * POST /api/orchestrator/auto-create-content
 * Automated content creation workflow
 */
router.post('/auto-create-content', async (req, res) => {
  try {
    const { userId, prompt, style } = req.body;
    const orch = getOrchestrator();

    const result = await orch.autoCreateContent(userId, prompt, style);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Auto-create error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/orchestrator/auto-moderate
 * Batch moderate content
 */
router.post('/auto-moderate', async (req, res) => {
  try {
    const { contentBatch } = req.body;
    const orch = getOrchestrator();

    const tasks = await orch.autoModerateUploads(contentBatch);
    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Auto-moderate error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/orchestrator/daily-report
 * Generate daily business intelligence report
 */
router.post('/daily-report', async (req, res) => {
  try {
    const orch = getOrchestrator();
    const taskId = await orch.generateDailyReport();

    res.json({ success: true, taskId });
  } catch (error) {
    console.error('Daily report error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------------------------------------
// STATUS & MONITORING
// --------------------------------------------------------------------------

/**
 * GET /api/orchestrator/status
 * Get orchestrator status and agent stats
 */
router.get('/status', (req, res) => {
  try {
    const orch = getOrchestrator();
    const status = orch.getStatus();

    res.json({ success: true, ...status });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/orchestrator/start
 * Start the orchestrator
 */
router.post('/start', (req, res) => {
  try {
    const orch = getOrchestrator();
    orch.start();

    res.json({ success: true, message: 'Orchestrator started' });
  } catch (error) {
    console.error('Start error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/orchestrator/stop
 * Stop the orchestrator
 */
router.post('/stop', (req, res) => {
  try {
    const orch = getOrchestrator();
    orch.stop();

    res.json({ success: true, message: 'Orchestrator stopped' });
  } catch (error) {
    console.error('Stop error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
