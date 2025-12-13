/**
 * Creator Discovery API
 * Search, trending, recommendations - all PhotoDNA-free
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * GET /api/discovery/search
 * Search creators by name, bio, tags, niche
 */
router.get('/search', async (req, res) => {
    try {
        const { query, tags, niche, minFollowers, verified, page = 1, limit = 20 } = req.query;
        
        if (!query && !tags && !niche) {
            return res.status(400).json({ error: 'Provide query, tags, or niche' });
        }

        let dbQuery = supabase
            .from('creators')
            .select('id, username, display_name, bio, avatar_url, niche, tags, follower_count, verified, created_at')
            .eq('status', 'active')
            .order('follower_count', { ascending: false });

        // Text search across name and bio
        if (query) {
            dbQuery = dbQuery.or(`username.ilike.%${query}%,display_name.ilike.%${query}%,bio.ilike.%${query}%`);
        }

        // Tag filtering
        if (tags) {
            const tagArray = tags.split(',').map(t => t.trim());
            dbQuery = dbQuery.contains('tags', tagArray);
        }

        // Niche filtering
        if (niche) {
            dbQuery = dbQuery.eq('niche', niche);
        }

        // Minimum followers
        if (minFollowers) {
            dbQuery = dbQuery.gte('follower_count', parseInt(minFollowers));
        }

        // Verified only
        if (verified === 'true') {
            dbQuery = dbQuery.eq('verified', true);
        }

        // Pagination
        const offset = (page - 1) * limit;
        dbQuery = dbQuery.range(offset, offset + limit - 1);

        const { data, error } = await dbQuery;

        if (error) throw error;

        res.json({
            results: data,
            page: parseInt(page),
            limit: parseInt(limit),
            hasMore: data.length === parseInt(limit)
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed', details: error.message });
    }
});

/**
 * GET /api/discovery/trending
 * Get trending creators based on recent growth and engagement
 */
router.get('/trending', async (req, res) => {
    try {
        const { userId, timeframe = '7d', niche, limit = 20 } = req.query;

        // Validate and sanitize inputs
        const validTimeframes = { '1d': '1 day', '7d': '7 days', '30d': '30 days' };
        const safeTimeframe = validTimeframes[timeframe] || '7 days';
        const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
        const safeNiche = niche ? String(niche).replace(/[^a-zA-Z0-9_-]/g, '') : null;

        // Use safe ORM query to prevent SQL injection
        let query = supabase
            .from('creators')
            .select('id, username, display_name, bio, avatar_url, niche, tags, follower_count, verified')
            .eq('status', 'active')
            .order('follower_count', { ascending: false })
            .limit(safeLimit);

        if (safeNiche) {
            query = query.eq('niche', safeNiche);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        res.json({
            trending: data || [],
            timeframe,
            note: 'Sorted by follower count (complex trending calculation disabled for security)'
        });

    } catch (error) {
        console.error('Trending error:', error);
        res.status(500).json({ error: 'Failed to fetch trending creators', details: error.message });
    }
});

/**
 * GET /api/discovery/recommendations/:userId
 * Personalized creator recommendations based on user's interests
 */
router.get('/recommendations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;

        // Get user's followed creators and their niches/tags
        const { data: following, error: followError } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', userId);

        if (followError) throw followError;

        const followingIds = following.map(f => f.following_id);

        // Get niches and tags from followed creators
        const { data: followedCreators, error: creatorError } = await supabase
            .from('creators')
            .select('niche, tags')
            .in('id', followingIds);

        if (creatorError) throw creatorError;

        // Extract popular niches and tags
        const niches = [...new Set(followedCreators.map(c => c.niche).filter(Boolean))];
        const allTags = followedCreators.flatMap(c => c.tags || []);
        const tagCounts = {};
        allTags.forEach(tag => tagCounts[tag] = (tagCounts[tag] || 0) + 1);
        const popularTags = Object.keys(tagCounts)
            .sort((a, b) => tagCounts[b] - tagCounts[a])
            .slice(0, 5);

        // Find similar creators not yet followed
        let query = supabase
            .from('creators')
            .select('id, username, display_name, bio, avatar_url, niche, tags, follower_count, verified')
            .eq('status', 'active')
            .not('id', 'in', `(${[userId, ...followingIds].join(',')})`)
            .order('follower_count', { ascending: false })
            .limit(limit);

        // Filter by niche or tags if we have data
        if (niches.length > 0) {
            query = query.in('niche', niches);
        } else if (popularTags.length > 0) {
            query = query.overlaps('tags', popularTags);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({
            recommendations: data,
            basedOn: {
                niches: niches.slice(0, 3),
                tags: popularTags.slice(0, 3)
            }
        });

    } catch (error) {
        console.error('Recommendations error:', error);
        res.status(500).json({ error: 'Failed to generate recommendations', details: error.message });
    }
});

/**
 * GET /api/discovery/featured
 * Platform-curated featured creators
 */
router.get('/featured', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const { data, error } = await supabase
            .from('creators')
            .select('id, username, display_name, bio, avatar_url, niche, tags, follower_count, verified')
            .eq('status', 'active')
            .eq('featured', true)
            .order('featured_order', { ascending: true })
            .limit(limit);

        if (error) throw error;

        // If no featured creators, return top verified creators
        if (!data || data.length === 0) {
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('creators')
                .select('id, username, display_name, bio, avatar_url, niche, tags, follower_count, verified')
                .eq('status', 'active')
                .eq('verified', true)
                .order('follower_count', { ascending: false })
                .limit(limit);

            if (fallbackError) throw fallbackError;

            return res.json({
                featured: fallbackData,
                note: 'Showing top verified creators (no featured list configured)'
            });
        }

        res.json({
            featured: data
        });

    } catch (error) {
        console.error('Featured error:', error);
        res.status(500).json({ error: 'Failed to fetch featured creators', details: error.message });
    }
});

/**
 * GET /api/discovery/niches
 * Get all available creator niches with counts
 */
router.get('/niches', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('creators')
            .select('niche')
            .eq('status', 'active');

        if (error) throw error;

        // Count occurrences
        const nicheCounts = {};
        data.forEach(c => {
            if (c.niche) {
                nicheCounts[c.niche] = (nicheCounts[c.niche] || 0) + 1;
            }
        });

        const niches = Object.entries(nicheCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        res.json({
            niches,
            total: Object.keys(nicheCounts).length
        });

    } catch (error) {
        console.error('Niches error:', error);
        res.status(500).json({ error: 'Failed to fetch niches', details: error.message });
    }
});

/**
 * GET /api/discovery/tags
 * Get all popular tags across creators
 */
router.get('/tags', async (req, res) => {
    try {
        const { limit = 50 } = req.query;

        const { data, error } = await supabase
            .from('creators')
            .select('tags')
            .eq('status', 'active');

        if (error) throw error;

        // Flatten and count tags
        const tagCounts = {};
        data.forEach(c => {
            if (c.tags && Array.isArray(c.tags)) {
                c.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        const tags = Object.entries(tagCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);

        res.json({
            tags,
            total: Object.keys(tagCounts).length
        });

    } catch (error) {
        console.error('Tags error:', error);
        res.status(500).json({ error: 'Failed to fetch tags', details: error.message });
    }
});

/**
 * GET /api/discovery/new
 * Get newest creators on the platform
 */
router.get('/new', async (req, res) => {
    try {
        const { limit = 20, niche } = req.query;

        let query = supabase
            .from('creators')
            .select('id, username, display_name, bio, avatar_url, niche, tags, follower_count, verified, created_at')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (niche) {
            query = query.eq('niche', niche);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({
            newCreators: data
        });

    } catch (error) {
        console.error('New creators error:', error);
        res.status(500).json({ error: 'Failed to fetch new creators', details: error.message });
    }
});

module.exports = router;
