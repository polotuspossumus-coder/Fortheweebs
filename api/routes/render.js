import express from 'express';
import { supabase } from '../../lib/supabaseClient.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/render-jobs/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 * 1024 } // 5GB limit
});

// Get all render jobs for user
router.get('/jobs', authenticateToken, async (req, res) => {
  try {
    const { data: jobs, error } = await supabase
      .from('render_jobs')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ jobs: jobs || [] });
  } catch (error) {
    console.error('Error fetching render jobs:', error);
    res.status(500).json({ error: 'Failed to fetch render jobs' });
  }
});

// Get render statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get active jobs
    const { data: activeJobs } = await supabase
      .from('render_jobs')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'processing');

    // Get queued jobs
    const { data: queuedJobs } = await supabase
      .from('render_jobs')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'queued');

    // Get completed today
    const { data: completedToday } = await supabase
      .from('render_jobs')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', today.toISOString());

    // Get average render time
    const { data: completedJobs } = await supabase
      .from('render_jobs')
      .select('render_time')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .not('render_time', 'is', null);

    const avgRenderTime = completedJobs?.length 
      ? Math.round(completedJobs.reduce((sum, job) => sum + (job.render_time || 0), 0) / completedJobs.length)
      : 0;

    // Get available nodes
    const { data: availableNodes } = await supabase
      .from('render_nodes')
      .select('id')
      .eq('status', 'idle');

    res.json({
      activeJobs: activeJobs?.length || 0,
      queuedJobs: queuedJobs?.length || 0,
      completedToday: completedToday?.length || 0,
      avgRenderTime,
      availableNodes: availableNodes?.length || 0
    });
  } catch (error) {
    console.error('Error fetching render stats:', error);
    res.status(500).json({ error: 'Failed to fetch render stats' });
  }
});

// Get render nodes
router.get('/nodes', authenticateToken, async (req, res) => {
  try {
    const { data: nodes, error } = await supabase
      .from('render_nodes')
      .select('*')
      .order('name');

    if (error) throw error;

    res.json({ nodes: nodes || [] });
  } catch (error) {
    console.error('Error fetching render nodes:', error);
    res.status(500).json({ error: 'Failed to fetch render nodes' });
  }
});

// Create new render job
router.post('/jobs', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { jobData } = req.body;
    const parsedData = JSON.parse(jobData);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload file to Supabase Storage
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = `render-sources/${req.user.id}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('render-files')
      .upload(filePath, req.file.buffer);

    if (uploadError) throw uploadError;

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('render_jobs')
      .insert({
        user_id: req.user.id,
        name: parsedData.name,
        type: parsedData.type,
        priority: parsedData.priority,
        quality: parsedData.quality,
        resolution: parsedData.resolution,
        fps: parsedData.fps,
        format: parsedData.format,
        source_file: filePath,
        file_size: req.file.size,
        output_settings: parsedData.outputSettings,
        status: 'queued'
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // Trigger render queue processor (would be handled by background worker)
    processRenderQueue();

    res.json({ success: true, job });
  } catch (error) {
    console.error('Error creating render job:', error);
    res.status(500).json({ error: 'Failed to create render job' });
  }
});

// Cancel render job
router.post('/jobs/:jobId/cancel', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;

    const { data: job, error } = await supabase
      .from('render_jobs')
      .update({ 
        status: 'cancelled',
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    // Free up the render node if assigned
    if (job.node_id) {
      await supabase
        .from('render_nodes')
        .update({ 
          status: 'idle',
          current_job: null,
          utilization: 0
        })
        .eq('id', job.node_id);
    }

    res.json({ success: true, job });
  } catch (error) {
    console.error('Error canceling render job:', error);
    res.status(500).json({ error: 'Failed to cancel render job' });
  }
});

// Retry failed job
router.post('/jobs/:jobId/retry', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;

    const { data: job, error } = await supabase
      .from('render_jobs')
      .update({ 
        status: 'queued',
        error: null,
        node_id: null,
        progress: 0
      })
      .eq('id', jobId)
      .eq('user_id', req.user.id)
      .eq('status', 'failed')
      .select()
      .single();

    if (error) throw error;

    processRenderQueue();

    res.json({ success: true, job });
  } catch (error) {
    console.error('Error retrying render job:', error);
    res.status(500).json({ error: 'Failed to retry render job' });
  }
});

// Background queue processor (simplified - would be separate worker service)
async function processRenderQueue() {
  try {
    // Get available nodes
    const { data: availableNodes } = await supabase
      .from('render_nodes')
      .select('*')
      .eq('status', 'idle')
      .limit(1);

    if (!availableNodes || availableNodes.length === 0) {
      return; // No available nodes
    }

    // Get next queued job by priority
    const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
    const { data: queuedJobs } = await supabase
      .from('render_jobs')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true });

    if (!queuedJobs || queuedJobs.length === 0) {
      return; // No queued jobs
    }

    // Sort by priority
    queuedJobs.sort((a, b) => 
      priorityOrder[b.priority] - priorityOrder[a.priority]
    );

    const nextJob = queuedJobs[0];
    const node = availableNodes[0];

    // Assign job to node
    await supabase
      .from('render_jobs')
      .update({
        status: 'processing',
        node_id: node.id,
        started_at: new Date().toISOString()
      })
      .eq('id', nextJob.id);

    await supabase
      .from('render_nodes')
      .update({
        status: 'busy',
        current_job: nextJob.name
      })
      .eq('id', node.id);

    // Simulate render progress (in production, this would be actual render worker)
    simulateRenderProgress(nextJob.id, node.id);

  } catch (error) {
    console.error('Error processing render queue:', error);
  }
}

// Simulate render progress (placeholder for actual render worker)
async function simulateRenderProgress(jobId, nodeId) {
  let progress = 0;
  const startTime = Date.now();

  const interval = setInterval(async () => {
    progress += Math.random() * 15;
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      const renderTime = Math.floor((Date.now() - startTime) / 1000);

      // Mark job as completed
      await supabase
        .from('render_jobs')
        .update({
          status: 'completed',
          progress: 100,
          render_time: renderTime,
          completed_at: new Date().toISOString(),
          output_url: `https://storage.supabase.co/render-outputs/${jobId}.mp4`
        })
        .eq('id', jobId);

      // Free up node
      await supabase
        .from('render_nodes')
        .update({
          status: 'idle',
          current_job: null,
          utilization: 0
        })
        .eq('id', nodeId);

      // Process next job in queue
      processRenderQueue();
    } else {
      // Update progress
      await supabase
        .from('render_jobs')
        .update({ progress: Math.floor(progress) })
        .eq('id', jobId);

      await supabase
        .from('render_nodes')
        .update({ utilization: Math.floor(progress) })
        .eq('id', nodeId);
    }
  }, 2000);
}

export default router;
