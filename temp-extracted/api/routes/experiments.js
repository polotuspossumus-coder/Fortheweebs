/**
 * A/B Testing Experiments API Route
 * Feature flag and experiment management
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Get Active Experiments
 * GET /api/routes/experiments/active
 */
router.get('/active', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('experiments')
            .select('*')
            .eq('status', 'active');

        if (error) throw error;

        res.json({ experiments: data || [] });
    } catch (error) {
        console.error('Get experiments error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get User Variant
 * GET /api/routes/experiments/variant/:experimentId/:userId
 */
router.get('/variant/:experimentId/:userId', async (req, res) => {
    try {
        const { experimentId, userId } = req.params;

        // Check if user already assigned to variant
        let { data: assignment, error: assignError } = await supabase
            .from('experiment_assignments')
            .select('variant')
            .eq('experiment_id', experimentId)
            .eq('user_id', userId)
            .single();

        if (assignError && assignError.code !== 'PGRST116') throw assignError;

        // If not assigned, assign randomly
        if (!assignment) {
            const variant = Math.random() < 0.5 ? 'control' : 'treatment';
            
            const { data: newAssignment, error: insertError } = await supabase
                .from('experiment_assignments')
                .insert({
                    experiment_id: experimentId,
                    user_id: userId,
                    variant: variant,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (insertError) throw insertError;
            assignment = newAssignment;
        }

        res.json({ variant: assignment.variant });
    } catch (error) {
        console.error('Get variant error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Track Experiment Event
 * POST /api/routes/experiments/track
 */
router.post('/track', async (req, res) => {
    try {
        const { experimentId, userId, eventType, eventData } = req.body;

        if (!experimentId || !userId || !eventType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('experiment_events')
            .insert({
                experiment_id: experimentId,
                user_id: userId,
                event_type: eventType,
                event_data: eventData,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ tracked: true });
    } catch (error) {
        console.error('Track experiment error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
