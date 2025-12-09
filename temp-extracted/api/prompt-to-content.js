/**
 * Prompt-to-Content API
 * Text-to-media generation
 */

const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate Image from Prompt
 * POST /api/prompt-to-content/image
 */
router.post('/image', async (req, res) => {
    try {
        const { prompt, size = '1024x1024' } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Missing prompt' });
        }

        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: prompt,
            size: size,
            n: 1
        });

        res.json({
            imageUrl: response.data[0].url,
            prompt: prompt
        });
    } catch (error) {
        console.error('Prompt to image error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Generate Text from Prompt
 * POST /api/prompt-to-content/text
 */
router.post('/text', async (req, res) => {
    try {
        const { prompt, length = 'medium' } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Missing prompt' });
        }

        const lengthTokens = { short: 100, medium: 250, long: 500 };

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: lengthTokens[length] || 250
        });

        res.json({
            text: completion.choices[0].message.content,
            prompt: prompt
        });
    } catch (error) {
        console.error('Prompt to text error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
