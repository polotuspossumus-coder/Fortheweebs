/**
 * Mico Hybrid API
 * Combines Mico (Claude) with other AI models for enhanced capabilities
 */

const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Hybrid Analysis
 * POST /api/mico-hybrid/analyze
 */
router.post('/analyze', async (req, res) => {
    try {
        const { content, type = 'text' } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Missing content' });
        }

        // Run both Claude and GPT-4 analysis in parallel
        const [claudeResponse, gptResponse] = await Promise.all([
            anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 500,
                messages: [{
                    role: 'user',
                    content: `Analyze this ${type}: ${content}`
                }]
            }),
            openai.chat.completions.create({
                model: 'gpt-4',
                messages: [{
                    role: 'user',
                    content: `Analyze this ${type}: ${content}`
                }],
                max_tokens: 500
            })
        ]);

        res.json({
            claude: {
                analysis: claudeResponse.content[0].text,
                model: claudeResponse.model
            },
            gpt4: {
                analysis: gptResponse.choices[0].message.content,
                model: gptResponse.model
            }
        });

    } catch (error) {
        console.error('Hybrid analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Hybrid Moderation (Best-of-Both)
 * POST /api/mico-hybrid/moderate
 */
router.post('/moderate', async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Missing content' });
        }

        // Use both Claude and OpenAI moderation
        const [claudeResponse, openaiMod] = await Promise.all([
            anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 200,
                messages: [{
                    role: 'user',
                    content: `Is this content safe and appropriate? "${content}"`
                }]
            }),
            openai.moderations.create({ input: content })
        ]);

        const claudeSafe = claudeResponse.content[0].text.toLowerCase().includes('safe');
        const openaiSafe = !openaiMod.results[0].flagged;

        res.json({
            safe: claudeSafe && openaiSafe,
            claude: { safe: claudeSafe, response: claudeResponse.content[0].text },
            openai: { safe: openaiSafe, categories: openaiMod.results[0].categories }
        });

    } catch (error) {
        console.error('Hybrid moderation error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
