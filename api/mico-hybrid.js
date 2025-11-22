/**
 * HYBRID MICO + CLAUDE SYSTEM
 *
 * Mico (Microsoft Copilot) does what she CAN do
 * Claude AI automatically handles what she CAN'T do
 *
 * Mico's capabilities:
 * - Basic Q&A
 * - Simple code suggestions
 * - File operations
 *
 * Claude's capabilities (automated):
 * - Complex feature implementation
 * - Bug fixes with GitHub deployment
 * - Advanced code generation
 * - Evaluation of suggestions
 */

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const REPO_NAME = process.env.GITHUB_REPO_NAME;

/**
 * Route user requests to either Mico or Claude based on complexity
 */
router.post('/process', async (req, res) => {
  try {
    const { userId, email, tier, requestType, data } = req.body;

    // Determine handler based on request type
    switch (requestType) {
      case 'chat':
        // Try Mico first, fallback to Claude if she can't handle it
        return await handleChat(req, res, { userId, email, tier, data });

      case 'suggestion':
        // Suggestions go to Claude for auto-implementation
        return await handleSuggestion(req, res, { userId, email, tier, data });

      case 'bug_report':
        // Bug reports go to Claude for auto-fixing
        return await handleBugReport(req, res, { userId, email, tier, data });

      case 'code_generation':
        // Complex code generation goes straight to Claude
        return await handleCodeGeneration(req, res, { userId, email, tier, data });

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid request type'
        });
    }
  } catch (error) {
    console.error('Hybrid Mico error:', error);
    return res.status(500).json({
      success: false,
      error: 'System error'
    });
  }
});

/**
 * CHAT: Try Mico first, use Claude if she fails
 */
async function handleChat(req, res, { userId, email, tier, data }) {
  const { question, conversationHistory } = data;

  try {
    // First, try Microsoft Copilot (Mico)
    const micoResponse = await tryMicoCopilot(question, conversationHistory);

    if (micoResponse.success) {
      return res.json({
        success: true,
        answer: micoResponse.answer,
        source: 'mico'
      });
    }

    // Mico failed or couldn't handle it - use Claude
    console.log('Mico failed, falling back to Claude:', micoResponse.error);
    const claudeAnswer = await getClaudeAnswer(question, tier, conversationHistory);

    return res.json({
      success: true,
      answer: claudeAnswer,
      source: 'claude'
    });

  } catch (error) {
    console.error('Chat handler error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get answer'
    });
  }
}

/**
 * SUGGESTIONS: Always go to Claude for auto-implementation
 */
async function handleSuggestion(req, res, { userId, email, tier, data }) {
  const { suggestion } = data;

  // Forward to auto-implement endpoint
  try {
    const response = await fetch(`${req.protocol}://${req.get('host')}/api/auto-implement-suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email,
        tier,
        suggestion
      })
    });

    const result = await response.json();
    return res.json(result);

  } catch (error) {
    console.error('Suggestion forwarding error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process suggestion'
    });
  }
}

/**
 * BUG REPORTS: Always go to Claude for auto-fixing
 */
async function handleBugReport(req, res, { userId, email, tier, data }) {
  // Forward to debugger-to-cloud endpoint
  try {
    const response = await fetch(`${req.protocol}://${req.get('host')}/api/debugger-to-cloud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email,
        tier,
        ...data
      })
    });

    const result = await response.json();
    return res.json(result);

  } catch (error) {
    console.error('Bug report forwarding error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process bug report'
    });
  }
}

/**
 * CODE GENERATION: Always Claude (complex task)
 */
async function handleCodeGeneration(req, res, { userId, email, tier, data }) {
  const { prompt, context } = data;

  if (!ANTHROPIC_API_KEY) {
    return res.status(503).json({
      success: false,
      error: 'AI code generation temporarily unavailable'
    });
  }

  try {
    const systemPrompt = `You are an expert code generator for ForTheWeebs platform.
Generate complete, production-ready code based on user requirements.

Tech stack:
- React frontend
- Node.js backend
- PostgreSQL (Supabase)
- Stripe payments

Respond with working code only. Include comments for clarity.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Context: ${context || 'None'}\n\nRequest: ${prompt}`
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Claude API failed');
    }

    const aiData = await response.json();
    const generatedCode = aiData.content[0].text;

    return res.json({
      success: true,
      code: generatedCode,
      source: 'claude'
    });

  } catch (error) {
    console.error('Code generation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate code'
    });
  }
}

/**
 * Try to use Microsoft Copilot API (Mico)
 */
async function tryMicoCopilot(question, conversationHistory = []) {
  // Microsoft Copilot integration would go here
  // For now, return failure to always use Claude
  // You can add actual Copilot API calls when available

  return {
    success: false,
    error: 'Mico not configured'
  };

  /* Example if you have Copilot API access:
  try {
    const response = await fetch('https://api.bing.microsoft.com/v7.0/chat', {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.MICROSOFT_COPILOT_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: question,
        conversationHistory: conversationHistory
      })
    });

    if (!response.ok) {
      return { success: false, error: 'Mico API failed' };
    }

    const data = await response.json();
    return {
      success: true,
      answer: data.answer
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
  */
}

/**
 * Get answer from Claude (fallback)
 */
async function getClaudeAnswer(question, tier, conversationHistory = []) {
  if (!ANTHROPIC_API_KEY) {
    return "I'm currently offline. Please try again later.";
  }

  const messages = conversationHistory.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  messages.push({
    role: 'user',
    content: question
  });

  const systemPrompt = `You are Mico, the AI assistant for ForTheWeebs.

Platform Features:
- For Fans: Browse content, support creators, upgrade tiers ($15/mo to $1000)
- For Creators: Upload content, accept tips/subscriptions/commissions, 0% fees for paid users
- Tier System: Free, $15/mo Adult, $50-$1000 Sovereign tiers with increasing perks
- Upgrade credits: Previous payments apply to next tier
- Crypto accepted: Bitcoin, Ethereum, USDC

User Tier: ${tier}

Be helpful, friendly, concise. Don't make promises about new features.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error('Claude API failed');
    }

    const data = await response.json();
    return data.content[0].text;

  } catch (error) {
    console.error('Claude answer error:', error);
    return "I'm having trouble right now. Please try again in a moment.";
  }
}

module.exports = router;
