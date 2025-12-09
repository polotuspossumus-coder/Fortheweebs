/**
 * AI Style Learning API
 * Learn user editing patterns and suggest improvements
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Record Edit Pattern
 * POST /api/ai-style-learning/record
 */
router.post('/record', async (req, res) => {
    try {
        const { userId, editType, parameters } = req.body;

        if (!userId || !editType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('edit_patterns')
            .insert({
                user_id: userId,
                edit_type: editType,
                parameters: parameters,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ pattern: data });
    } catch (error) {
        console.error('Record edit pattern error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Style Suggestions
 * GET /api/ai-style-learning/suggestions/:userId
 */
router.get('/suggestions/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Mock suggestions based on learned patterns
        res.json({
            suggestions: [
                { type: 'color-correction', confidence: 0.88, reason: 'You often adjust saturation' },
                { type: 'crop-aspect', confidence: 0.75, reason: 'Common 16:9 crops detected' }
            ]
        });
    } catch (error) {
        console.error('Get style suggestions error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
