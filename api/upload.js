const express = require('express');
const { put } = require('@vercel/blob');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Upload AR/VR content to Vercel Blob Storage
 * POST /api/upload/vr-content
 * 
 * Body: { file: base64, filename: string, userId: string, contentType: string }
 */
router.post('/vr-content', async (req, res) => {
    try {
        const { file, filename, userId, contentType = 'model/gltf-binary' } = req.body;

        if (!file || !filename || !userId) {
            return res.status(400).json({
                error: 'file, filename, and userId are required'
            });
        }

        // Check if Vercel Blob token is configured
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            return res.status(503).json({
                error: 'Blob storage not configured. Add BLOB_READ_WRITE_TOKEN to environment variables.',
                setup_guide: 'https://vercel.com/docs/storage/vercel-blob/quickstart'
            });
        }

        // Decode base64 file
        const buffer = Buffer.from(file.split(',')[1] || file, 'base64');

        // Upload to Vercel Blob
        const blob = await put(filename, buffer, {
            access: 'public',
            contentType: contentType,
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        // Save metadata to Supabase
        const { data, error } = await supabase
            .from('vr_content')
            .insert({
                user_id: userId,
                filename: filename,
                blob_url: blob.url,
                content_type: contentType,
                size_bytes: buffer.length,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            // Still return blob URL even if database save fails
        }

        res.json({
            success: true,
            url: blob.url,
            filename: filename,
            size: buffer.length,
            contentType: contentType,
            metadata: data
        });

    } catch (error) {
        console.error('VR content upload error:', error);
        res.status(500).json({
            error: error.message || 'Failed to upload VR content',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * Upload avatar image
 * POST /api/upload/avatar
 */
router.post('/avatar', async (req, res) => {
    try {
        const { file, userId } = req.body;

        if (!file || !userId) {
            return res.status(400).json({
                error: 'file and userId are required'
            });
        }

        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            return res.status(503).json({
                error: 'Blob storage not configured'
            });
        }

        const buffer = Buffer.from(file.split(',')[1] || file, 'base64');
        const filename = `avatar-${userId}-${Date.now()}.png`;

        const blob = await put(filename, buffer, {
            access: 'public',
            contentType: 'image/png',
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        // Update user's avatar URL in Supabase
        const { error } = await supabase
            .from('users')
            .update({ avatar_url: blob.url })
            .eq('id', userId);

        if (error) {
            console.error('Avatar update error:', error);
        }

        res.json({
            success: true,
            url: blob.url,
            filename: filename
        });

    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({
            error: error.message || 'Failed to upload avatar'
        });
    }
});

/**
 * List user's uploaded content
 * GET /api/upload/list/:userId
 */
router.get('/list/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('vr_content')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            content: data || [],
            count: data?.length || 0
        });

    } catch (error) {
        console.error('List content error:', error);
        res.status(500).json({
            error: error.message || 'Failed to list content'
        });
    }
});

/**
 * Delete uploaded content
 * DELETE /api/upload/:contentId
 */
router.delete('/:contentId', async (req, res) => {
    try {
        const { contentId } = req.params;
        const { userId } = req.body;

        // Delete from Supabase (blob cleanup would need Vercel API)
        const { error } = await supabase
            .from('vr_content')
            .delete()
            .eq('id', contentId)
            .eq('user_id', userId);

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            message: 'Content deleted'
        });

    } catch (error) {
        console.error('Delete content error:', error);
        res.status(500).json({
            error: error.message || 'Failed to delete content'
        });
    }
});

module.exports = router;
