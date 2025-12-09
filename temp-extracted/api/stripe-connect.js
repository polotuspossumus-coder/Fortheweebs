/**
 * Stripe Connect API
 * Handles creator payouts via Stripe Connect
 */

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Create Stripe Connect Account for Creator
 * POST /api/stripe-connect/create-account
 */
router.post('/create-account', async (req, res) => {
    try {
        const { userId, email } = req.body;

        if (!userId || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create connected account
        const account = await stripe.accounts.create({
            type: 'express',
            email: email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            metadata: {
                userId: userId
            }
        });

        // Save account ID to database
        const { error: dbError } = await supabase
            .from('creator_accounts')
            .upsert({
                user_id: userId,
                stripe_account_id: account.id,
                onboarding_complete: false,
                updated_at: new Date().toISOString()
            });

        if (dbError) throw dbError;

        res.json({ accountId: account.id });
    } catch (error) {
        console.error('Stripe Connect account creation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create Account Link for Onboarding
 * POST /api/stripe-connect/account-link
 */
router.post('/account-link', async (req, res) => {
    try {
        const { accountId } = req.body;

        if (!accountId) {
            return res.status(400).json({ error: 'Missing account ID' });
        }

        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/creator/onboarding/refresh`,
            return_url: `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/creator/onboarding/complete`,
            type: 'account_onboarding',
        });

        res.json({ url: accountLink.url });
    } catch (error) {
        console.error('Stripe account link error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Account Status
 * GET /api/stripe-connect/account/:accountId
 */
router.get('/account/:accountId', async (req, res) => {
    try {
        const { accountId } = req.params;

        const account = await stripe.accounts.retrieve(accountId);

        res.json({
            id: account.id,
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted
        });
    } catch (error) {
        console.error('Stripe account retrieval error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create Payout to Creator
 * POST /api/stripe-connect/payout
 */
router.post('/payout', async (req, res) => {
    try {
        const { accountId, amount, currency = 'usd' } = req.body;

        if (!accountId || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create transfer to connected account
        const transfer = await stripe.transfers.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency,
            destination: accountId,
        });

        res.json({ transferId: transfer.id, amount: transfer.amount / 100 });
    } catch (error) {
        console.error('Stripe payout error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
