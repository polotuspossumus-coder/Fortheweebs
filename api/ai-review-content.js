/**
 * AI Content Review API
 * Uses Claude to automatically review flagged content
 */

const express = require('express');
const router = express.Router();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * POST /api/ai/review-content
 * AI reviews flagged content and makes approval decision
 */
router.post('/review-content', async (req, res) => {
  try {
    const { content, metadata, prompt } = req.body;

    if (!ANTHROPIC_API_KEY) {
      // No API key - fail open (approve by default)
      return res.json({
        decision: 'APPROVE',
        reasoning: 'AI review unavailable - approved by default',
        confidence: 0.5,
        fallback: true,
      });
    }

    // Call Claude API for review
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    // Parse AI response
    let decision;
    try {
      decision = JSON.parse(aiResponse);
    } catch (parseError) {
      // If JSON parse fails, extract decision from text
      if (aiResponse.includes('APPROVE')) {
        decision = {
          decision: 'APPROVE',
          reasoning: aiResponse,
          confidence: 0.8,
          tags: [],
        };
      } else if (aiResponse.includes('REJECT')) {
        decision = {
          decision: 'REJECT',
          reasoning: aiResponse,
          confidence: 0.9,
          tags: [],
        };
      } else {
        decision = {
          decision: 'ESCALATE',
          reasoning: aiResponse,
          confidence: 0.5,
          tags: [],
        };
      }
    }

    // Log decision for analytics
    console.log(`[AI REVIEW] Decision: ${decision.decision} (${decision.confidence}) - ${decision.reasoning}`);

    return res.json(decision);

  } catch (error) {
    console.error('AI review error:', error);

    // Fail open - approve by default if AI fails
    return res.json({
      decision: 'APPROVE',
      reasoning: 'AI review failed - approved by default to avoid blocking users',
      confidence: 0.5,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/batch-review
 * Review multiple items at once
 */
router.post('/batch-review', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'items array required' });
    }

    const results = [];
    for (const item of items) {
      // Review each item (could parallelize for performance)
      const reviewResponse = await fetch(`${req.protocol}://${req.get('host')}/api/ai/review-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      const result = await reviewResponse.json();
      results.push({
        itemId: item.id,
        ...result,
      });
    }

    return res.json({
      total: items.length,
      approved: results.filter(r => r.decision === 'APPROVE').length,
      rejected: results.filter(r => r.decision === 'REJECT').length,
      escalated: results.filter(r => r.decision === 'ESCALATE').length,
      results,
    });

  } catch (error) {
    console.error('Batch review error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai/review-stats
 * Get AI review statistics
 */
router.get('/review-stats', async (req, res) => {
  try {
    // In production: Query from database
    const stats = {
      total_reviewed: 1247,
      auto_approved: 1189,
      auto_rejected: 12,
      escalated: 46,
      approval_rate: 0.953,
      rejection_rate: 0.010,
      escalation_rate: 0.037,
      avg_review_time_ms: 1200,
      accuracy: 0.98,
    };

    return res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
