/**
 * Family Access API
 * Generate special access codes for family/friends
 * - Full free access codes (for Mom, Dad, testers)
 * - Supporter plan codes ($20/month toward $1000 tier)
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * List all access codes (admin only)
 * GET /api/family-access/list
 */
router.get('/list', async (req, res) => {
    try {
        const { data: codes, error } = await supabase
            .from('family_access_codes')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Database error:', error);
            const mockCodes = [{
                id: 'fac_001',
                code: 'FAMILY-MOM-2024',
                name: 'Mom',
                type: 'free',
                notes: 'Full free access for testing',
                link: `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/redeem?code=FAMILY-MOM-2024`,
                created_at: new Date().toISOString(),
                used_count: 0,
                active: true
            }];
            return res.status(200).json({ codes: mockCodes, usingMockData: true });
        }

        res.status(200).json({ codes });
    } catch (error) {
        console.error('Error listing access codes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Generate new access code (admin only)
 * POST /api/family-access/generate
 */
router.post('/generate', async (req, res) => {
    try {
        const { adminId, name, type, notes } = req.body;

        if (!adminId || !name || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const code = `FAMILY-${name.toUpperCase().replace(/\s+/g, '-')}-${Date.now().toString(36).toUpperCase()}`;

        const baseUrl = process.env.VITE_FRONTEND_URL || 'http://localhost:3000';
        const link = `${baseUrl}/redeem?code=${code}`;

        const { data, error } = await supabase
            .from('family_access_codes')
            .insert({
                code: code,
                name: name,
                type: type,
                notes: notes,
                link: link,
                active: true,
                created_by: adminId,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ code: data, link });
    } catch (error) {
        console.error('Error generating access code:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Verify access code
 * GET /api/family-access/verify?code=XXX
 */
router.get('/verify', async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ error: 'Missing code' });
        }

        const { data, error } = await supabase
            .from('family_access_codes')
            .select('*')
            .eq('code', code)
            .eq('active', true)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Invalid or expired code' });
        }

        res.status(200).json({ valid: true, code: data });
    } catch (error) {
        console.error('Error verifying access code:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Redeem access code
 * POST /api/family-access/redeem
 */
router.post('/redeem', async (req, res) => {
    try {
        const { userId, code } = req.body;

        if (!userId || !code) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify code
        const { data: accessCode, error: codeError } = await supabase
            .from('family_access_codes')
            .select('*')
            .eq('code', code)
            .eq('active', true)
            .single();

        if (codeError || !accessCode) {
            return res.status(404).json({ error: 'Invalid or expired code' });
        }

        // Update user tier based on code type
        const tierUpdates = {
            free: { tier: 'elite', subscription_status: 'active', payment_method: 'family_access' },
            supporter: { tier: 'enhanced', subscription_status: 'active', payment_method: 'supporter' }
        };

        const updates = tierUpdates[accessCode.type] || tierUpdates.free;

        const { error: userError } = await supabase
            .from('users')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (userError) throw userError;

        // Increment used count
        await supabase
            .from('family_access_codes')
            .update({ used_count: (accessCode.used_count || 0) + 1 })
            .eq('id', accessCode.id);

        res.status(200).json({ success: true, tier: updates.tier });
    } catch (error) {
        console.error('Error redeeming access code:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Delete access code (admin only)
 * DELETE /api/family-access/delete
 */
router.delete('/delete', async (req, res) => {
    try {
        const { adminId, codeId } = req.body;

        if (!adminId || !codeId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { error } = await supabase
            .from('family_access_codes')
            .update({ active: false })
            .eq('id', codeId);

        if (error) throw error;

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error deleting access code:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
