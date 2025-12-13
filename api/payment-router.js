/**
 * Payment Router - Routes payments based on content type
 * SFW Content → Stripe Connect
 * Adult Content → Crypto Only (USDC)
 * Uses existing Google Vision SafeSearch AI moderation
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * Determine payment method for a creator
 * GET /api/payment-router/method/:creatorId
 */
router.get('/method/:creatorId', async (req, res) => {
    try {
        const { creatorId } = req.params;

        // Get creator's profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('payment_type, content_rating, forced_crypto_only, crypto_wallet_address, stripe_connect_account_id')
            .eq('id', creatorId)
            .single();

        if (error || !profile) {
            return res.status(404).json({ error: 'Creator not found' });
        }

        // If forced crypto-only (adult content detected)
        if (profile.forced_crypto_only) {
            return res.json({
                method: 'crypto',
                reason: 'adult_content_detected',
                wallet_address: profile.crypto_wallet_address
            });
        }

        // If creator set explicit payment type
        if (profile.payment_type === 'crypto') {
            return res.json({
                method: 'crypto',
                reason: 'creator_preference',
                wallet_address: profile.crypto_wallet_address
            });
        }

        if (profile.payment_type === 'stripe_connect') {
            return res.json({
                method: 'stripe_connect',
                reason: 'creator_preference',
                account_id: profile.stripe_connect_account_id
            });
        }

        // Default: SFW → Stripe, Adult → Crypto
        if (profile.content_rating === 'adult') {
            return res.json({
                method: 'crypto',
                reason: 'adult_content',
                wallet_address: profile.crypto_wallet_address
            });
        }

        // Default to Stripe for SFW content
        return res.json({
            method: 'stripe_connect',
            reason: 'sfw_content',
            account_id: profile.stripe_connect_account_id
        });

    } catch (error) {
        console.error('Payment router error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Auto-detect adult content and update payment routing
 * POST /api/payment-router/detect-content
 */
router.post('/detect-content', async (req, res) => {
    try {
        const { creatorId, contentUrl, contentType } = req.body;

        if (!creatorId || !contentUrl) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Use existing Google Vision SafeSearch detection
        const { analyzeImageWithGoogleVision } = require('../src/utils/imageContentScanner');
        
        let isAdultContent = false;
        
        if (contentType === 'image' || contentType === 'video') {
            const analysis = await analyzeImageWithGoogleVision(contentUrl);
            
            // Check SafeSearch results
            const safeSearch = analysis.safeSearch || {};
            isAdultContent = 
                safeSearch.adult === 'LIKELY' || 
                safeSearch.adult === 'VERY_LIKELY' ||
                safeSearch.racy === 'VERY_LIKELY';
        }

        // Update creator's content rating
        if (isAdultContent) {
            await supabase
                .from('profiles')
                .update({
                    content_rating: 'adult',
                    forced_crypto_only: true,
                    payment_type: 'crypto'
                })
                .eq('id', creatorId);

            return res.json({
                content_rating: 'adult',
                payment_method: 'crypto',
                message: 'Adult content detected - Stripe disabled, crypto-only payments enforced'
            });
        }

        res.json({
            content_rating: 'sfw',
            payment_method: 'stripe_connect',
            message: 'SFW content - Stripe Connect available'
        });

    } catch (error) {
        console.error('Content detection error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Update creator's payment method preference
 * POST /api/payment-router/set-method
 */
router.post('/set-method', async (req, res) => {
    try {
        const { creatorId, paymentType, walletAddress, stripeAccountId } = req.body;

        if (!creatorId || !paymentType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if creator is forced to crypto-only
        const { data: profile } = await supabase
            .from('profiles')
            .select('forced_crypto_only')
            .eq('id', creatorId)
            .single();

        if (profile?.forced_crypto_only && paymentType !== 'crypto') {
            return res.status(403).json({
                error: 'Adult content detected - can only use crypto payments'
            });
        }

        // Update payment method
        const updates = {
            payment_type: paymentType,
            payment_setup_complete: true
        };

        if (walletAddress) {
            updates.crypto_wallet_address = walletAddress;
        }

        if (stripeAccountId) {
            updates.stripe_connect_account_id = stripeAccountId;
        }

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', creatorId);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Payment method updated',
            payment_type: paymentType
        });

    } catch (error) {
        console.error('Set payment method error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
