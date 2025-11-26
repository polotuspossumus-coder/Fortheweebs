import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Middleware to verify authentication
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Get user's render jobs
router.get('/jobs', requireAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('render_jobs')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      jobs: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch render jobs' });
  }
});

// Get single render job
router.get('/jobs/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('render_jobs')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;

    res.json({ job: data });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch render job' });
  }
});

// Submit render job
router.post('/jobs', requireAuth, async (req, res) => {
  try {
    const {
      name,
      scene_url,
      resolution,
      quality,
      format,
      frames,
      priority
    } = req.body;

    if (!name || !scene_url || !resolution) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate estimated cost and time
    const resolutionMultiplier = {
      '720p': 1,
      '1080p': 2,
      '2k': 4,
      '4k': 8
    }[resolution] || 1;

    const qualityMultiplier = {
      'draft': 0.5,
      'medium': 1,
      'high': 2,
      'ultra': 3
    }[quality] || 1;

    const frameCount = frames || 1;
    const estimatedMinutes = Math.ceil(frameCount * resolutionMultiplier * qualityMultiplier * 0.5);
    const estimatedCost = estimatedMinutes * 0.10; // $0.10 per minute

    const { data, error } = await supabase
      .from('render_jobs')
      .insert({
        user_id: req.user.id,
        name,
        scene_url,
        resolution,
        quality: quality || 'medium',
        format: format || 'png',
        frames: frameCount,
        priority: priority || 'normal',
        status: 'queued',
        estimated_time: estimatedMinutes,
        estimated_cost: estimatedCost,
        progress: 0
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Trigger actual render job processing
    // This would integrate with a render farm or cloud rendering service

    res.status(201).json({
      job: data,
      estimated_time_minutes: estimatedMinutes,
      estimated_cost_usd: estimatedCost
    });
  } catch (error) {
    console.error('Error submitting job:', error);
    res.status(500).json({ error: 'Failed to submit render job' });
  }
});

// Cancel render job
router.post('/jobs/:id/cancel', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: job } = await supabase
      .from('render_jobs')
      .select('user_id, status')
      .eq('id', id)
      .single();

    if (!job || job.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!['queued', 'rendering'].includes(job.status)) {
      return res.status(400).json({ error: 'Job cannot be cancelled' });
    }

    const { data, error } = await supabase
      .from('render_jobs')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ job: data });
  } catch (error) {
    console.error('Error cancelling job:', error);
    res.status(500).json({ error: 'Failed to cancel job' });
  }
});

// Download render result
router.get('/jobs/:id/download', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: job, error } = await supabase
      .from('render_jobs')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;

    if (job.status !== 'completed') {
      return res.status(400).json({ error: 'Job not completed' });
    }

    if (!job.output_url) {
      return res.status(404).json({ error: 'Output file not found' });
    }

    // Generate signed URL for download
    const { data: signedUrl, error: signError } = await supabase
      .storage
      .from('renders')
      .createSignedUrl(job.output_url, 3600); // 1 hour expiry

    if (signError) throw signError;

    res.json({ download_url: signedUrl.signedUrl });
  } catch (error) {
    console.error('Error getting download URL:', error);
    res.status(500).json({ error: 'Failed to get download URL' });
  }
});

// Get render presets
router.get('/presets', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('render_presets')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({ presets: data });
  } catch (error) {
    console.error('Error fetching presets:', error);
    res.status(500).json({ error: 'Failed to fetch presets' });
  }
});

// Create custom preset
router.post('/presets', requireAuth, async (req, res) => {
  try {
    const { name, settings } = req.body;

    if (!name || !settings) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('render_presets')
      .insert({
        user_id: req.user.id,
        name,
        settings
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ preset: data });
  } catch (error) {
    console.error('Error creating preset:', error);
    res.status(500).json({ error: 'Failed to create preset' });
  }
});

// Get user's render stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const daysAgo = parseInt(timeframe) || 30;
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    const [totalJobs, completedJobs, totalTime, totalCost] = await Promise.all([
      supabase
        .from('render_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.user.id)
        .gte('created_at', startDate),
      supabase
        .from('render_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.user.id)
        .eq('status', 'completed')
        .gte('created_at', startDate),
      supabase
        .from('render_jobs')
        .select('render_time')
        .eq('user_id', req.user.id)
        .eq('status', 'completed')
        .gte('created_at', startDate),
      supabase
        .from('render_jobs')
        .select('final_cost')
        .eq('user_id', req.user.id)
        .eq('status', 'completed')
        .gte('created_at', startDate)
    ]);

    const totalRenderTime = totalTime.data?.reduce((sum, job) => sum + (job.render_time || 0), 0) || 0;
    const totalSpent = totalCost.data?.reduce((sum, job) => sum + (job.final_cost || 0), 0) || 0;

    res.json({
      stats: {
        total_jobs: totalJobs.count || 0,
        completed_jobs: completedJobs.count || 0,
        total_render_time_minutes: Math.round(totalRenderTime),
        total_spent_usd: totalSpent.toFixed(2),
        timeframe: `${daysAgo} days`
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Webhook to update job status (internal use)
router.post('/webhook/status', async (req, res) => {
  try {
    // Verify webhook secret
    const secret = req.headers['x-webhook-secret'];
    if (secret !== process.env.RENDER_WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    const { job_id, status, progress, output_url, render_time, final_cost, error_message } = req.body;

    const updates = { status, progress };
    if (output_url) updates.output_url = output_url;
    if (render_time) updates.render_time = render_time;
    if (final_cost) updates.final_cost = final_cost;
    if (error_message) updates.error_message = error_message;
    if (status === 'completed') updates.completed_at = new Date().toISOString();

    const { error } = await supabase
      .from('render_jobs')
      .update(updates)
      .eq('id', job_id);

    if (error) throw error;

    res.json({ message: 'Status updated' });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ error: 'Failed to update job status' });
  }
});

export default router;
