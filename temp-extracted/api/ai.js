/**
 * AI General API
 * General AI features powered by OpenAI GPT-4
 */

const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * AI Text Completion
 * POST /api/ai/complete
 */
router.post('/complete', async (req, res) => {
    try {
        const { prompt, maxTokens = 150 } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Missing prompt' });
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens
        });

        res.json({ text: completion.choices[0].message.content });
    } catch (error) {
        console.error('AI completion error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * AI Image Analysis
 * POST /api/ai/analyze-image
 */
router.post('/analyze-image', async (req, res) => {
    try {
        const { imageUrl, prompt = 'Describe this image in detail' } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: 'Missing image URL' });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4-vision-preview',
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: imageUrl } }
                ]
            }],
            max_tokens: 300
        });

        res.json({ analysis: response.choices[0].message.content });
    } catch (error) {
        console.error('AI image analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * AI Content Moderation
 * POST /api/ai/moderate
 */
router.post('/moderate', async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Missing content' });
        }

        const moderation = await openai.moderations.create({
            input: content
        });

        const result = moderation.results[0];

        res.json({
            flagged: result.flagged,
            categories: result.categories,
            categoryScores: result.category_scores
        });
    } catch (error) {
        console.error('AI moderation error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
