/**
 * AI Content Generation API
 * Generate various types of content using AI
 */

const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate Text Content
 * POST /api/ai-content/generate-text
 */
router.post('/generate-text', async (req, res) => {
    try {
        const { prompt, style = 'creative', length = 'medium' } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Missing prompt' });
        }

        const lengthTokens = { short: 100, medium: 250, long: 500 };
        const maxTokens = lengthTokens[length] || 250;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{
                role: 'system',
                content: `You are a ${style} content writer.`
            }, {
                role: 'user',
                content: prompt
            }],
            max_tokens: maxTokens
        });

        res.json({ content: completion.choices[0].message.content });
    } catch (error) {
        console.error('AI text generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Generate Image Prompt
 * POST /api/ai-content/generate-image-prompt
 */
router.post('/generate-image-prompt', async (req, res) => {
    try {
        const { description } = req.body;

        if (!description) {
            return res.status(400).json({ error: 'Missing description' });
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{
                role: 'system',
                content: 'You are an expert at writing detailed image generation prompts for AI art tools.'
            }, {
                role: 'user',
                content: `Create a detailed image generation prompt for: ${description}`
            }],
            max_tokens: 150
        });

        res.json({ prompt: completion.choices[0].message.content });
    } catch (error) {
        console.error('AI prompt generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Generate Character Description
 * POST /api/ai-content/generate-character
 */
router.post('/generate-character', async (req, res) => {
    try {
        const { traits, genre = 'anime' } = req.body;

        if (!traits) {
            return res.status(400).json({ error: 'Missing character traits' });
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{
                role: 'system',
                content: `You are a ${genre} character designer.`
            }, {
                role: 'user',
                content: `Create a detailed character description with these traits: ${traits}`
            }],
            max_tokens: 300
        });

        res.json({ character: completion.choices[0].message.content });
    } catch (error) {
        console.error('AI character generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Improve Content
 * POST /api/ai-content/improve
 */
router.post('/improve', async (req, res) => {
    try {
        const { content, improvementType = 'grammar' } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Missing content' });
        }

        const prompts = {
            grammar: 'Fix grammar and spelling errors while preserving the original meaning.',
            style: 'Improve the writing style and flow while keeping the same message.',
            clarity: 'Make this content clearer and easier to understand.',
            concise: 'Make this content more concise without losing important information.'
        };

        const systemPrompt = prompts[improvementType] || prompts.grammar;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{
                role: 'system',
                content: systemPrompt
            }, {
                role: 'user',
                content: content
            }],
            max_tokens: 500
        });

        res.json({ improved: completion.choices[0].message.content });
    } catch (error) {
        console.error('AI content improvement error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
