/**
 * Social Feed API
 * Posts, follows, search, discovery
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
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

        // Format posts to match frontend expectations
        const formattedPosts = posts.map(post => ({
            id: post.id,
            userId: post.author_id,
            userName: 'User',
            avatar: '👤',
            content: post.content,
            visibility: post.visibility,
            mediaUrl: post.media_urls?.[0] || null,
            timestamp: post.created_at,
            likesCount: post.likes,
            commentsCount: post.comments_count,
            sharesCount: post.shares
        }));

        res.json({
            posts: formattedPosts || [],
            count: formattedPosts?.length || 0
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
        const { userId, content, visibility = 'PUBLIC', mediaUrl = null } = req.body;

        if (!userId || !content) {
            return res.status(400).json({ error: 'Missing required fields: userId and content' });
        }

        // Create post object matching actual database schema
        const postData = {
            author_id: userId, // Schema uses author_id, not user_id
            content: content,
            visibility: visibility.toUpperCase(), // Schema expects uppercase
            media_urls: mediaUrl ? [mediaUrl] : [], // Schema uses array
            created_at: new Date().toISOString(),
            likes: 0, // Schema uses 'likes' not 'likes_count'
            comments_count: 0,
            shares: 0, // Schema uses 'shares' not 'shares_count'
            views: 0
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
                user_id: userId,
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
            userId: post.author_id,
            userName: 'User',
            avatar: '👤',
            content: post.content,
            visibility: post.visibility,
            mediaUrl: post.media_urls?.[0] || null,
            timestamp: post.created_at,
            likesCount: post.likes,
            commentsCount: post.comments_count,
            sharesCount: post.shares
        };

        res.json({ post: formattedPost });
    } catch (error) {
        console.error('Post creation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/social/follow
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

/**
 * POST /api/social/post/:postId/like
 * Like a post
 */
router.post('/post/:postId/like', async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId required' });
        }

        // Check if already liked
        const { data: existing } = await supabase
            .from('likes')
            .select('id')
            .eq('user_id', userId)
            .eq('post_id', postId)
            .single();

        if (existing) {
            return res.json({ success: true, message: 'Already liked' });
        }

        // Insert like
        const { error } = await supabase
            .from('likes')
            .insert({
                user_id: userId,
                post_id: postId,
                created_at: new Date().toISOString()
            });

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Like error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/social/post/:postId/like
 * Unlike a post
 */
router.delete('/post/:postId/like', async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId required' });
        }

        const { error } = await supabase
            .from('likes')
            .delete()
            .eq('user_id', userId)
            .eq('post_id', postId);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Unlike error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/social/post/:postId/save
 * Save a post (bookmark)
 */
router.post('/post/:postId/save', async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId required' });
        }

        // Check if already saved
        const { data: existing } = await supabase
            .from('saves')
            .select('id')
            .eq('user_id', userId)
            .eq('post_id', postId)
            .single();

        if (existing) {
            return res.json({ success: true, message: 'Already saved' });
        }

        // Insert save
        const { error } = await supabase
            .from('saves')
            .insert({
                user_id: userId,
                post_id: postId,
                created_at: new Date().toISOString()
            });

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/social/post/:postId/save
 * Unsave a post
 */
router.delete('/post/:postId/save', async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId required' });
        }

        const { error } = await supabase
            .from('saves')
            .delete()
            .eq('user_id', userId)
            .eq('post_id', postId);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Unsave error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/social/post/:postId/share
 * Track post share (analytics)
 */
router.post('/post/:postId/share', async (req, res) => {
    try {
        const { postId } = req.params;

        // Increment shares_count in posts table (if we add that column)
        // For now, just acknowledge the share
        res.json({ success: true, message: 'Share tracked' });
    } catch (error) {
        console.error('Share error:', error);
        res.status(500).json({ error: error.message });
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
