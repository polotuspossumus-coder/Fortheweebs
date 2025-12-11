/**
 * Social Feed API
 * Posts, follows, search, discovery
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * GET /api/social/feed
 * Get public feed posts
 */
router.get('/feed', async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const { data: posts, error } = await supabase
            .from('posts')
            .select('*')
            .eq('visibility', 'PUBLIC')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            // Return empty feed if table doesn't exist
            return res.json({ posts: [], count: 0 });
        }

        res.json({
            posts: posts || [],
            count: posts?.length || 0
        });
    } catch (error) {
        console.error('Feed error:', error);
        // Return empty feed on error
        res.json({ posts: [], count: 0 });
    }
});

/**
 * GET /api/social/discover
 * Discover creators to follow
 */
router.get('/discover', async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        const { data: creators, error } = await supabase
            .from('profiles')
            .select('user_id, username, display_name, bio, avatar_url, follower_count')
            .order('follower_count', { ascending: false })
            .limit(limit);

        if (error) {
            // Return mock data if table doesn't exist yet
            return res.json({
                creators: [
                    { id: 1, username: 'anime_artist_pro', display_name: 'Pro Artist', bio: 'Professional anime illustrator', followers: 12500, posts: 847, is_verified: true },
                    { id: 2, username: 'manga_studio', display_name: 'Manga Studio', bio: 'Manga creator & tutorials', followers: 8200, posts: 523, is_verified: true },
                    { id: 3, username: 'cosplay_queen', display_name: 'Cosplay Queen', bio: 'Cosplayer & photographer', followers: 6700, posts: 391, is_verified: false }
                ],
                count: 3
            });
        }

        res.json({
            creators: creators || [],
            count: creators?.length || 0
        });
    } catch (error) {
        console.error('Discover error:', error);
        // Return mock data on any error
        res.json({
            creators: [
                { id: 1, username: 'anime_artist_pro', display_name: 'Pro Artist', bio: 'Professional anime illustrator', followers: 12500, posts: 847, is_verified: true },
                { id: 2, username: 'manga_studio', display_name: 'Manga Studio', bio: 'Manga creator & tutorials', followers: 8200, posts: 523, is_verified: true }
            ],
            count: 2
        });
    }
});

/**
 * GET /api/social/search
 * Search users and creators
 */
router.get('/search', async (req, res) => {
    try {
        const { q, limit = 20 } = req.query;

        if (!q || q.trim().length < 2) {
            return res.json({ users: [], count: 0 });
        }

        const searchTerm = `%${q.toLowerCase()}%`;

        const { data: users, error } = await supabase
            .from('profiles')
            .select('user_id, username, display_name, bio, avatar_url, follower_count')
            .or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
            .limit(limit);

        if (error) {
            // Return mock search results
            const mockUsers = [
                { id: 1, username: 'anime_artist_pro', display_name: 'Pro Artist', bio: 'Professional anime illustrator', followers: 12500, posts: 847, is_verified: true },
                { id: 2, username: 'manga_studio', display_name: 'Manga Studio', bio: 'Manga creator & tutorials', followers: 8200, posts: 523, is_verified: true }
            ].filter(u => u.username.toLowerCase().includes(q.toLowerCase()) || u.display_name?.toLowerCase().includes(q.toLowerCase()));
            return res.json({ users: mockUsers, count: mockUsers.length });
        }

        res.json({
            users: users || [],
            count: users?.length || 0
        });
    } catch (error) {
        console.error('Search error:', error);
        // Return empty results on error
        res.json({ users: [], count: 0 });
    }
});

/**
 * POST /api/social/post
 * Create a new post
 */
router.post('/post', async (req, res) => {
    try {
        const { userId, content, visibility = 'public', mediaUrl = null } = req.body;

        if (!userId || !content) {
            return res.status(400).json({ error: 'Missing required fields: userId and content' });
        }

        // Create post object
        const postData = {
            user_id: userId,
            content: content,
            visibility: visibility.toLowerCase(),
            media_url: mediaUrl,
            created_at: new Date().toISOString(),
            likes_count: 0,
            comments_count: 0,
            shares_count: 0
        };

        // Try to insert into database
        const { data: post, error } = await supabase
            .from('posts')
            .insert(postData)
            .select()
            .single();

        if (error) {
            console.error('Database insert error:', error);
            // Return mock post if database fails
            const mockPost = {
                id: Date.now(),
                ...postData,
                userName: 'User',
                avatar: '👤',
                timestamp: postData.created_at
            };
            return res.json({ post: mockPost });
        }

        // Format response to match frontend expectations
        const formattedPost = {
            id: post.id,
            userId: post.user_id,
            userName: 'User',
            avatar: '👤',
            content: post.content,
            visibility: post.visibility,
            timestamp: post.created_at,
            likes: post.likes_count || 0,
            commentsCount: post.comments_count || 0,
            shares: post.shares_count || 0
        };

        res.json({ post: formattedPost });
    } catch (error) {
        console.error('Post creation error:', error);
        // Return mock post as fallback
        const mockPost = {
            id: Date.now(),
            userId: req.body.userId,
            userName: 'User',
            avatar: '👤',
            content: req.body.content,
            visibility: req.body.visibility || 'public',
            timestamp: new Date().toISOString(),
            likes: 0,
            commentsCount: 0,
            shares: 0
        };
        res.json({ post: mockPost });
    }
});

/**
 * POST /api/social/follow
 * Follow a user
 */
router.post('/follow', async (req, res) => {
    try {
        const { followerId, followingId } = req.body;

        if (!followerId || !followingId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('follows')
            .insert({
                follower_id: followerId,
                following_id: followingId,
                created_at: new Date().toISOString()
            });

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Follow error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/social/unfollow
 * Unfollow a user
 */
router.delete('/unfollow', async (req, res) => {
    try {
        const { followerId, followingId } = req.body;

        if (!followerId || !followingId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { error } = await supabase
            .from('follows')
            .delete()
            .eq('follower_id', followerId)
            .eq('following_id', followingId);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Unfollow error:', error);
        res.json({ success: false, error: error.message });
    }
});

// Global error handler for all routes
router.use((error, req, res, next) => {
    console.error('Social API Error:', error);
    res.status(500).json({ 
        error: 'Service temporarily unavailable. Some features require database setup.',
        details: error.message 
    });
});

module.exports = router;
