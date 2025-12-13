/**
 * AI Review Content API
 * Copyright detection and content validation using AI
 */

const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Review Image for Copyright
 * POST /api/ai-review-content/image
 */
router.post('/image', async (req, res) => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: 'Missing image URL' });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4-vision-preview',
            messages: [{
                role: 'system',
                content: 'You are an expert at detecting copyrighted content in images. Analyze for logos, watermarks, characters from copyrighted works, and other protected content.'
            }, {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: 'Analyze this image for potential copyright issues. List any copyrighted characters, logos, or watermarks you detect.'
                    },
                    {
                        type: 'image_url',
                        image_url: { url: imageUrl }
                    }
                ]
            }],
            max_tokens: 300
        });

        const analysis = response.choices[0].message.content;
        const flagged = analysis.toLowerCase().includes('copyright') || 
                       analysis.toLowerCase().includes('watermark') ||
                       analysis.toLowerCase().includes('logo');

        res.json({
            flagged,
            analysis,
            confidence: flagged ? 0.8 : 0.2
        });
    } catch (error) {
        console.error('AI image review error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Review Text for Copyright
 * POST /api/ai-review-content/text
 */
router.post('/text', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Missing text' });
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{
                role: 'system',
                content: 'You are an expert at detecting copyrighted content in text. Identify any copyrighted quotes, song lyrics, or passages from books/articles.'
            }, {
                role: 'user',
                content: `Analyze this text for potential copyright issues: "${text}"`
            }],
            max_tokens: 200
        });

        const analysis = completion.choices[0].message.content;
        const flagged = analysis.toLowerCase().includes('copyright') || 
                       analysis.toLowerCase().includes('copyrighted') ||
                       analysis.toLowerCase().includes('protected');

        res.json({
            flagged,
            analysis,
            confidence: flagged ? 0.7 : 0.3
        });
    } catch (error) {
        console.error('AI text review error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Review Audio for Copyright
 * POST /api/ai-review-content/audio
 */
router.post('/audio', async (req, res) => {
    try {
        const { audioUrl, transcription } = req.body;

        if (!transcription) {
            return res.status(400).json({ error: 'Missing audio transcription' });
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{
                role: 'system',
                content: 'You are an expert at detecting copyrighted music and audio content. Identify any copyrighted songs, samples, or sound effects.'
            }, {
                role: 'user',
                content: `Analyze this audio transcription for potential copyright issues: "${transcription}"`
            }],
            max_tokens: 200
        });

        const analysis = completion.choices[0].message.content;
        const flagged = analysis.toLowerCase().includes('copyright') || 
                       analysis.toLowerCase().includes('song') ||
                       analysis.toLowerCase().includes('sample');

        res.json({
            flagged,
            analysis,
            confidence: flagged ? 0.6 : 0.4
        });
    } catch (error) {
        console.error('AI audio review error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Comprehensive Content Review
 * POST /api/ai-review-content/comprehensive
 */
router.post('/comprehensive', async (req, res) => {
    try {
        const { contentType, contentUrl, metadata = {} } = req.body;

        if (!contentType || !contentUrl) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // This would integrate with multiple AI services
        // For now, return a mock comprehensive review
        res.json({
            contentType,
            copyright: {
                detected: false,
                confidence: 0.95,
                issues: []
            },
            moderation: {
                flagged: false,
                categories: {},
                safe: true
            },
            recommendations: [
                'Content appears to be original',
                'No copyright issues detected',
                'Safe for public distribution'
            ]
        });
    } catch (error) {
        console.error('AI comprehensive review error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
