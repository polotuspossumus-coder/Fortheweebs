/**
 * Community Features API
 * Forums, events, discussions - no PhotoDNA required
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * GET /api/community/forums
 * List all community forums
 */
router.get('/forums', async (req, res) => {
    try {
        const { category, page = 1, limit = 20 } = req.query;

        let query = supabase
            .from('forums')
            .select('*, creator:creator_id(username, display_name, avatar_url), post_count, member_count')
            .eq('active', true)
            .order('post_count', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;
        if (error) throw error;

        res.json({
            forums: data,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Forums error:', error);
        res.status(500).json({ error: 'Failed to fetch forums', details: error.message });
    }
});

/**
 * POST /api/community/forums
 * Create a new forum (creator only)
 */
router.post('/forums', async (req, res) => {
    try {
        const { creatorId, title, description, category, rules, isPrivate } = req.body;

        if (!creatorId || !title || !description) {
            return res.status(400).json({ error: 'creatorId, title, and description required' });
        }

        const { data, error } = await supabase
            .from('forums')
            .insert({
                creator_id: creatorId,
                title,
                description,
                category: category || 'general',
                rules: rules || [],
                is_private: isPrivate || false,
                active: true,
                post_count: 0,
                member_count: 1
            })
            .select()
            .single();

        if (error) throw error;

        // Auto-join creator as member
        await supabase
            .from('forum_members')
            .insert({
                forum_id: data.id,
                user_id: creatorId,
                role: 'owner',
                joined_at: new Date().toISOString()
            });

        res.json({
            forum: data,
            message: 'Forum created successfully'
        });

    } catch (error) {
        console.error('Create forum error:', error);
        res.status(500).json({ error: 'Failed to create forum', details: error.message });
    }
});

/**
 * GET /api/community/forums/:forumId/posts
 * Get posts in a forum
 */
router.get('/forums/:forumId/posts', async (req, res) => {
    try {
        const { forumId } = req.params;
        const { sort = 'recent', page = 1, limit = 20 } = req.query;

        let query = supabase
            .from('forum_posts')
            .select('*, author:user_id(id, username, display_name, avatar_url), reply_count, like_count')
            .eq('forum_id', forumId)
            .eq('deleted', false);

        // Sort options
        if (sort === 'recent') {
            query = query.order('created_at', { ascending: false });
        } else if (sort === 'popular') {
            query = query.order('like_count', { ascending: false });
        } else if (sort === 'discussed') {
            query = query.order('reply_count', { ascending: false });
        }

        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;
        if (error) throw error;

        res.json({
            posts: data,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Forum posts error:', error);
        res.status(500).json({ error: 'Failed to fetch posts', details: error.message });
    }
});

/**
 * POST /api/community/forums/:forumId/posts
 * Create a post in a forum
 */
router.post('/forums/:forumId/posts', async (req, res) => {
    try {
        const { forumId } = req.params;
        const { userId, title, content, tags } = req.body;

        if (!userId || !title || !content) {
            return res.status(400).json({ error: 'userId, title, and content required' });
        }

        const { data, error } = await supabase
            .from('forum_posts')
            .insert({
                forum_id: forumId,
                user_id: userId,
                title,
                content,
                tags: tags || [],
                reply_count: 0,
                like_count: 0,
                deleted: false
            })
            .select()
            .single();

        if (error) throw error;

        // Increment forum post count
        await supabase.rpc('increment_forum_posts', { forum_id: forumId });

        res.json({
            post: data,
            message: 'Post created successfully'
        });

    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: 'Failed to create post', details: error.message });
    }
});

/**
 * GET /api/community/events
 * Get upcoming creator events
 */
router.get('/events', async (req, res) => {
    try {
        const { creatorId, upcoming = true, page = 1, limit = 20 } = req.query;

        let query = supabase
            .from('events')
            .select('*, creator:creator_id(username, display_name, avatar_url), attendee_count')
            .eq('cancelled', false);

        if (creatorId) {
            query = query.eq('creator_id', creatorId);
        }

        if (upcoming === 'true') {
            query = query.gte('start_time', new Date().toISOString());
            query = query.order('start_time', { ascending: true });
        } else {
            query = query.lt('start_time', new Date().toISOString());
            query = query.order('start_time', { ascending: false });
        }

        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;
        if (error) throw error;

        res.json({
            events: data,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Events error:', error);
        res.status(500).json({ error: 'Failed to fetch events', details: error.message });
    }
});

/**
 * POST /api/community/events
 * Create a new event (creator only)
 */
router.post('/events', async (req, res) => {
    try {
        const { creatorId, title, description, startTime, endTime, location, maxAttendees, isPaid, ticketPrice } = req.body;

        if (!creatorId || !title || !startTime) {
            return res.status(400).json({ error: 'creatorId, title, and startTime required' });
        }

        const { data, error } = await supabase
            .from('events')
            .insert({
                creator_id: creatorId,
                title,
                description,
                start_time: startTime,
                end_time: endTime,
                location: location || 'online',
                max_attendees: maxAttendees,
                is_paid: isPaid || false,
                ticket_price: ticketPrice || 0,
                attendee_count: 0,
                cancelled: false
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            event: data,
            message: 'Event created successfully'
        });

    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Failed to create event', details: error.message });
    }
});

/**
 * POST /api/community/events/:eventId/rsvp
 * RSVP to an event
 */
router.post('/events/:eventId/rsvp', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId required' });
        }

        // Check if already RSVP'd
        const { data: existing, error: checkError } = await supabase
            .from('event_rsvps')
            .select('id')
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Already RSVP\'d to this event' });
        }

        // Check event capacity
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('max_attendees, attendee_count')
            .eq('id', eventId)
            .single();

        if (eventError) throw eventError;

        if (event.max_attendees && event.attendee_count >= event.max_attendees) {
            return res.status(400).json({ error: 'Event is at capacity' });
        }

        // Create RSVP
        const { data, error } = await supabase
            .from('event_rsvps')
            .insert({
                event_id: eventId,
                user_id: userId,
                rsvp_status: 'attending'
            })
            .select()
            .single();

        if (error) throw error;

        // Increment attendee count
        await supabase.rpc('increment_event_attendees', { event_id: eventId });

        res.json({
            rsvp: data,
            message: 'RSVP successful'
        });

    } catch (error) {
        console.error('RSVP error:', error);
        res.status(500).json({ error: 'Failed to RSVP', details: error.message });
    }
});

/**
 * GET /api/community/discussions
 * Get community-wide discussions (not tied to specific forum)
 */
router.get('/discussions', async (req, res) => {
    try {
        const { topic, page = 1, limit = 20 } = req.query;

        let query = supabase
            .from('discussions')
            .select('*, author:user_id(id, username, display_name, avatar_url), reply_count, like_count')
            .eq('deleted', false)
            .order('created_at', { ascending: false });

        if (topic) {
            query = query.eq('topic', topic);
        }

        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;
        if (error) throw error;

        res.json({
            discussions: data,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Discussions error:', error);
        res.status(500).json({ error: 'Failed to fetch discussions', details: error.message });
    }
});

/**
 * POST /api/community/discussions
 * Start a new community discussion
 */
router.post('/discussions', async (req, res) => {
    try {
        const { userId, title, content, topic, tags } = req.body;

        if (!userId || !title || !content) {
            return res.status(400).json({ error: 'userId, title, and content required' });
        }

        const { data, error } = await supabase
            .from('discussions')
            .insert({
                user_id: userId,
                title,
                content,
                topic: topic || 'general',
                tags: tags || [],
                reply_count: 0,
                like_count: 0,
                deleted: false
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            discussion: data,
            message: 'Discussion started successfully'
        });

    } catch (error) {
        console.error('Create discussion error:', error);
        res.status(500).json({ error: 'Failed to create discussion', details: error.message });
    }
});

/**
 * GET /api/community/stats
 * Get community statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const [
            { count: forumCount },
            { count: eventCount },
            { count: discussionCount },
            { count: memberCount }
        ] = await Promise.all([
            supabase.from('forums').select('id', { count: 'exact', head: true }),
            supabase.from('events').select('id', { count: 'exact', head: true }),
            supabase.from('discussions').select('id', { count: 'exact', head: true }),
            supabase.from('forum_members').select('user_id', { count: 'exact', head: true })
        ]);

        res.json({
            forums: forumCount,
            events: eventCount,
            discussions: discussionCount,
            activeMembers: memberCount
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
    }
});

module.exports = router;
