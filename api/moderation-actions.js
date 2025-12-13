/**
 * AI CSAM Moderation API
 * Active content moderation for CSAM and harmful content
 * Uses AI-powered detection systems
 */

const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Scan Image for CSAM
 * POST /api/moderation-active/scan-image
 */
router.post('/scan-image', async (req, res) => {
    try {
        const { userId, imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: 'Missing image URL' });
        }

        // Use OpenAI moderation
        const moderation = await openai.moderations.create({
            input: imageUrl
        });

        const result = moderation.results[0];
        const isFlagged = result.flagged || result.categories['sexual/minors'];

        // Log moderation event
        await supabase.from('moderation_logs').insert({
            user_id: userId,
            content_type: 'image',
            content_url: imageUrl,
            flagged: isFlagged,
            categories: result.categories,
            created_at: new Date().toISOString()
        });

        // If flagged, take immediate action
        if (isFlagged) {
            
            // Block user immediately
            await supabase
                .from('users')
                .update({
                    account_status: 'suspended',
                    suspension_reason: 'CSAM_DETECTED',
                    suspended_at: new Date().toISOString()
                })
                .eq('id', userId);

            // Alert administrators
            if (global.artifactStream) {
                global.artifactStream.push({
                    timestamp: new Date().toISOString(),
                    type: 'CRITICAL_ALERT',
                    severity: 'critical',
                    message: '🚨 CSAM DETECTED - User suspended',
                    data: { userId, imageUrl }
                });
            }
        }

        res.json({
            safe: !isFlagged,
            flagged: isFlagged,
            categories: result.categories,
            action: isFlagged ? 'SUSPENDED' : 'NONE'
        });

    } catch (error) {
        console.error('CSAM scan error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Scan Text for Harmful Content
 * POST /api/moderation-active/scan-text
 */
router.post('/scan-text', async (req, res) => {
    try {
        const { userId, text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Missing text' });
        }

        const moderation = await openai.moderations.create({
            input: text
        });

        const result = moderation.results[0];

        // Log moderation event
        await supabase.from('moderation_logs').insert({
            user_id: userId,
            content_type: 'text',
            content_text: text.substring(0, 1000),
            flagged: result.flagged,
            categories: result.categories,
            created_at: new Date().toISOString()
        });

        res.json({
            safe: !result.flagged,
            flagged: result.flagged,
            categories: result.categories
        });

    } catch (error) {
        console.error('Text scan error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Moderation History
 * GET /api/moderation-active/history/:userId
 */
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('moderation_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        res.json({ history: data || [] });

    } catch (error) {
        console.error('Get moderation history error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Report Content
 * POST /api/moderation-active/report
 */
router.post('/report', async (req, res) => {
    try {
        const { reporterId, contentType, contentId, reason } = req.body;

        if (!reporterId || !contentType || !contentId || !reason) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('content_reports')
            .insert({
                reporter_id: reporterId,
                content_type: contentType,
                content_id: contentId,
                reason: reason,
                status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ report: data });

    } catch (error) {
        console.error('Report content error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
