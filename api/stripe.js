const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Create Stripe Checkout Session
 * POST /api/create-checkout-session
 * 
 * Body:
 * {
 *   tier: 'CREATOR' | 'SUPER_ADMIN',
 *   price: 500 | 1000,
 *   priceUSD: 500 | 1000,
 *   displayCurrency: 'EUR' | 'GBP' | etc,
 *   displayPrice: converted amount,
 *   userId: string,
 *   successUrl: string,
 *   cancelUrl: string
 * }
 */
router.post('/create-checkout-session', async (req, res) => {
    try {
        const {
            tier,
            price,
            priceUSD,
            displayCurrency = 'USD',
            displayPrice,
            userId,
            successUrl,
            cancelUrl
        } = req.body;

        // Validate tier
        if (!['CREATOR', 'SUPER_ADMIN'].includes(tier)) {
            return res.status(400).json({ error: 'Invalid tier' });
        }

        // Validate price
        const expectedPrices = {
            'CREATOR': 500,
            'SUPER_ADMIN': 1000
        };

        if (priceUSD !== expectedPrices[tier]) {
            return res.status(400).json({
                error: `Invalid price for tier ${tier}. Expected $${expectedPrices[tier]}`
            });
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: displayCurrency.toLowerCase(),
                        product_data: {
                            name: `ForTheWeebs ${tier} Tier`,
                            description: tier === 'CREATOR'
                                ? '100% profit + AR/VR tools + Cloud upload'
                                : 'All features + AI superpowers + Super Admin access',
                            images: ['https://fortheweebs.com/logo.png'], // Add your logo URL
                        },
                        unit_amount: Math.round(displayPrice * 100), // Stripe uses cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                tier,
                userId,
                priceUSD,
                displayCurrency,
                platform: 'ForTheWeebs'
            },
            customer_email: req.body.email || undefined,
        });

        // Log checkout session creation
        await supabase
            .from('payment_sessions')
            .insert({
                session_id: session.id,
                user_id: userId,
                tier: tier,
                amount_usd: priceUSD,
                display_currency: displayCurrency,
                display_amount: displayPrice,
                status: 'pending',
                created_at: new Date().toISOString()
            });

        res.json({
            sessionId: session.id,
            url: session.url
        });

    } catch (error) {
        console.error('Checkout session error:', error);
        res.status(500).json({
            error: 'Failed to create checkout session',
            message: error.message
        });
    }
});

/**
 * Stripe Webhook Handler
 * POST /api/stripe-webhook
 * 
 * Handles payment confirmation and tier upgrades
 */
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const { tier, userId, priceUSD } = session.metadata;

            console.log(`✅ Payment successful for user ${userId}, tier: ${tier}`);

            try {
                // Update user tier in database
                const { data, error } = await supabase
                    .from('users')
                    .upsert({
                        id: userId,
                        payment_tier: tier,
                        tier_updated_at: new Date().toISOString(),
                        payment_status: 'paid',
                        stripe_session_id: session.id,
                        amount_paid: priceUSD,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'id'
                    });

                if (error) {
                    console.error('Database update error:', error);
                    // Log failed update for manual review
                    await supabase
                        .from('failed_tier_updates')
                        .insert({
                            user_id: userId,
                            tier: tier,
                            session_id: session.id,
                            error: error.message,
                            created_at: new Date().toISOString()
                        });
                } else {
                    console.log(`✅ Successfully updated tier for user ${userId} to ${tier}`);

                    // Update payment session status
                    await supabase
                        .from('payment_sessions')
                        .update({
                            status: 'completed',
                            completed_at: new Date().toISOString()
                        })
                        .eq('session_id', session.id);

                    // Send confirmation email (optional)
                    // await sendTierUpgradeEmail(userId, tier);
                }
            } catch (dbError) {
                console.error('Database error:', dbError);
            }
            break;

        case 'checkout.session.expired':
            const expiredSession = event.data.object;
            console.log(`❌ Payment expired for session ${expiredSession.id}`);

            // Update session status
            await supabase
                .from('payment_sessions')
                .update({
                    status: 'expired',
                    updated_at: new Date().toISOString()
                })
                .eq('session_id', expiredSession.id);
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log(`❌ Payment failed: ${failedPayment.id}`);

            // Log failed payment
            await supabase
                .from('failed_payments')
                .insert({
                    payment_intent_id: failedPayment.id,
                    error: failedPayment.last_payment_error?.message || 'Unknown error',
                    created_at: new Date().toISOString()
                });
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

/**
 * Get User Tier
 * GET /api/user/:userId/tier
 */
router.get('/user/:userId/tier', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('users')
            .select('payment_tier, tier_updated_at, payment_status')
            .eq('id', userId)
            .single();

        if (error) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            tier: data.payment_tier || 'FREE',
            updatedAt: data.tier_updated_at,
            status: data.payment_status
        });

    } catch (error) {
        console.error('Error fetching user tier:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Get Payment History
 * GET /api/user/:userId/payments
 */
router.get('/user/:userId/payments', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('payment_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch payments' });
        }

        res.json({ payments: data });

    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
