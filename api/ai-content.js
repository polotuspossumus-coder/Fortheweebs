const express = require('express');
const OpenAI = require('openai');

const router = express.Router();

// Initialize OpenAI for DALL-E
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
}) : null;

/**
 * Generate Image with DALL-E
 * POST /api/ai-content/generate-image
 */
router.post('/generate-image', async (req, res) => {
    try {
        const { prompt, userId, size = '1024x1024' } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt required' });
        }

        if (!openai) {
            return res.status(503).json({
                error: 'AI service not configured. Add OPENAI_API_KEY to environment.'
            });
        }

        // TODO: Check user tier for access

        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt,
            n: 1,
            size,
            quality: 'standard'
        });

        const imageUrl = response.data[0].url;

        res.json({
            success: true,
            url: imageUrl,
            prompt,
            model: 'dall-e-3'
        });
    } catch (error) {
        console.error('DALL-E error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Generate 3D Model Description (placeholder for actual 3D generation)
 * POST /api/ai-content/generate-3d
 */
router.post('/generate-3d', async (req, res) => {
    try {
        const { prompt, userId } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt required' });
        }

        // TODO: Integrate with Meshy.ai or similar 3D generation API
        
        res.json({
            success: true,
            message: '3D generation coming soon',
            prompt,
            note: 'Integrate with Meshy.ai, Shap-E, or similar service'
        });
    } catch (error) {
        console.error('3D generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Generate Text with GPT-4
 * POST /api/ai-content/generate-text
 */
router.post('/generate-text', async (req, res) => {
    try {
        const { prompt, userId, maxTokens = 500 } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt required' });
        }

        if (!openai) {
            return res.status(503).json({
                error: 'AI service not configured'
            });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a creative writing assistant for anime and manga content creators.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: maxTokens,
            temperature: 0.8
        });

        res.json({
            success: true,
            text: response.choices[0].message.content,
            prompt,
            model: 'gpt-4'
        });
    } catch (error) {
        console.error('Text generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
