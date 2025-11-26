const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const supabase = require('../../lib/supabaseClient');

/**
 * GET /api/experiments
 * Get all A/B testing experiments
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data: experiments, error } = await supabase
      .from('experiments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      experiments: experiments || []
    });

  } catch (error) {
    console.error('Get experiments error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch experiments' 
    });
  }
});

/**
 * POST /api/experiments
 * Create a new A/B test experiment
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      type, 
      variants, 
      metrics, 
      startDate, 
      endDate 
    } = req.body;

    const { data: experiment, error } = await supabase
      .from('experiments')
      .insert({
        name,
        description,
        type,
        variants: variants || [
          { id: 'A', name: 'Control', traffic: 50, conversions: 0, views: 0 },
          { id: 'B', name: 'Test', traffic: 50, conversions: 0, views: 0 }
        ],
        metrics: metrics || ['conversion_rate'],
        start_date: startDate,
        end_date: endDate,
        status: 'draft',
        winner: null,
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      experiment
    });

  } catch (error) {
    console.error('Create experiment error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create experiment' 
    });
  }
});

/**
 * POST /api/experiments/:id/start
 * Start an A/B test experiment
 */
router.post('/:id/start', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: experiment, error } = await supabase
      .from('experiments')
      .update({ 
        status: 'active',
        start_date: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      experiment
    });

  } catch (error) {
    console.error('Start experiment error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to start experiment' 
    });
  }
});

/**
 * POST /api/experiments/:id/stop
 * Stop an A/B test experiment
 */
router.post('/:id/stop', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: experiment, error } = await supabase
      .from('experiments')
      .update({ 
        status: 'completed',
        end_date: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      experiment
    });

  } catch (error) {
    console.error('Stop experiment error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to stop experiment' 
    });
  }
});

/**
 * POST /api/experiments/:id/track
 * Track event for A/B test (view or conversion)
 */
router.post('/:id/track', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { variantId, eventType } = req.body; // eventType: 'view' or 'conversion'

    // Get experiment
    const { data: experiment, error: fetchError } = await supabase
      .from('experiments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Update variant stats
    const updatedVariants = experiment.variants.map(v => {
      if (v.id === variantId) {
        return {
          ...v,
          views: eventType === 'view' ? v.views + 1 : v.views,
          conversions: eventType === 'conversion' ? v.conversions + 1 : v.conversions
        };
      }
      return v;
    });

    const { error: updateError } = await supabase
      .from('experiments')
      .update({ variants: updatedVariants })
      .eq('id', id);

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('Track experiment error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to track experiment event' 
    });
  }
});

/**
 * POST /api/experiments/:id/winner
 * Declare winner for A/B test
 */
router.post('/:id/winner', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { winnerId, improvement } = req.body;

    const { data: experiment, error } = await supabase
      .from('experiments')
      .update({ 
        winner: winnerId,
        improvement,
        status: 'completed',
        end_date: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      experiment
    });

  } catch (error) {
    console.error('Declare winner error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to declare winner' 
    });
  }
});

module.exports = router;
