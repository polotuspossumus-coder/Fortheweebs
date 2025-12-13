/**
 * Welcome API Route
 * Automatically sends friend request from owner to all new users
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Owner's email (your account)
const OWNER_EMAIL = 'polotuspossumus@gmail.com';

/**
 * POST /api/routes/welcome/new-user
 * Called when a new user signs up
 * Automatically sends friend request from owner
 */
router.post('/new-user', async (req, res) => {
    try {
        const { userId, email } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        // Initialize Supabase client
        const supabase = createClient(
            process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
        );

        // Get owner's user ID from profiles table
        const { data: ownerProfile, error: ownerError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', OWNER_EMAIL)
            .single();

        if (ownerError || !ownerProfile) {
            // Don't fail user signup if this fails
            return res.json({ 
                success: true, 
                message: 'Welcome! (Friend request pending)' 
            });
        }

        const ownerId = ownerProfile.id;

        // Check if relationship already exists
        const { data: existing } = await supabase
            .from('relationships')
            .select('id')
            .or(`and(follower_id.eq.${ownerId},following_id.eq.${userId}),and(follower_id.eq.${userId},following_id.eq.${ownerId})`)
            .single();

        if (!existing) {
            // Create friend request from owner to new user
            const { error: relationError } = await supabase
                .from('relationships')
                .insert({
                    follower_id: ownerId,
                    following_id: userId,
                    status: 'pending',
                    created_at: new Date().toISOString()
                });

            if (relationError) {
            } else {

                // Create notification for the new user
                await supabase
                    .from('notifications')
                    .insert({
                        user_id: userId,
                        type: 'friend_request',
                        from_user_id: ownerId,
                        content: 'Welcome to ForTheWeebs! I (the creator) would like to be friends!',
                        read: false,
                        created_at: new Date().toISOString()
                    });
            }
        }

        res.json({ 
            success: true, 
            message: 'Welcome! Friend request sent from creator.' 
        });

    } catch (error) {
        console.error('Welcome route error:', error);
        // Don't fail user signup if this fails
        res.json({ 
            success: true, 
            message: 'Welcome!' 
        });
    }
});

module.exports = router;
