/**
 * Creator Copyright API
 * AI-validated copyright requests from creators
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Submit Copyright Request
 * POST /api/creator-copyright/submit
 */
router.post('/submit', async (req, res) => {
    try {
        const { creatorId, contentUrl, originalWorkUrl, description } = req.body;

        if (!creatorId || !contentUrl || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // AI validation of copyright claim
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{
                role: 'system',
                content: 'You are an expert at validating copyright claims. Analyze if the claim appears legitimate.'
            }, {
                role: 'user',
                content: `Analyze this copyright claim: ${description}`
            }],
            max_tokens: 200
        });

        const aiAnalysis = completion.choices[0].message.content;
        const confidence = aiAnalysis.toLowerCase().includes('legitimate') ? 0.8 : 0.4;

        const { data, error } = await supabase
            .from('copyright_requests')
            .insert({
                creator_id: creatorId,
                content_url: contentUrl,
                original_work_url: originalWorkUrl,
                description: description,
                ai_analysis: aiAnalysis,
                ai_confidence: confidence,
                status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ request: data, aiAnalysis });
    } catch (error) {
        console.error('Submit copyright request error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Copyright Requests
 * GET /api/creator-copyright/requests/:creatorId
 */
router.get('/requests/:creatorId', async (req, res) => {
    try {
        const { creatorId } = req.params;

        const { data, error } = await supabase
            .from('copyright_requests')
            .select('*')
            .eq('creator_id', creatorId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ requests: data || [] });
    } catch (error) {
        console.error('Get copyright requests error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
