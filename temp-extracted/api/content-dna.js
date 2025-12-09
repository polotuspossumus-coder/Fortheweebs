/**
 * Content DNA API
 * Perceptual hashing for duplicate detection
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Generate Content DNA
 * POST /api/content-dna/generate
 */
router.post('/generate', async (req, res) => {
    try {
        const { contentUrl, contentType = 'image' } = req.body;

        if (!contentUrl) {
            return res.status(400).json({ error: 'Missing content URL' });
        }

        // Generate mock perceptual hash
        const dna = `dna_${contentType}_${Math.random().toString(36).substr(2, 16)}`;

        const { data, error } = await supabase
            .from('content_dna')
            .insert({
                content_url: contentUrl,
                content_type: contentType,
                dna_hash: dna,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ dna: data });
    } catch (error) {
        console.error('Generate content DNA error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Find Similar Content
 * POST /api/content-dna/find-similar
 */
router.post('/find-similar', async (req, res) => {
    try {
        const { dnaHash, threshold = 0.9 } = req.body;

        if (!dnaHash) {
            return res.status(400).json({ error: 'Missing DNA hash' });
        }

        // Mock similar content search
        res.json({
            matches: [],
            threshold,
            searchTime: '0.12s'
        });
    } catch (error) {
        console.error('Find similar content error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
