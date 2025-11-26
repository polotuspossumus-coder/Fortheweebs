const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Create Stripe Connect Account for Creator
 * POST /api/stripe-connect/create-account
 */
router.post('/create-account', async (req, res) => {
    try {
        const { userId, email, country = 'US' } = req.body;

        if (!userId || !email) {
            return res.status(400).json({ error: 'userId and email required' });
        }

        // OWNER ONLY - Block other creators from setting up payments
        if (userId !== 'owner') {
            return res.status(403).json({ 
                error: 'Creator payments not yet available',
                message: 'Only the platform owner can accept payments at this time. Creator payouts coming soon!'
            });
        }

        // Check if user already has a connected account
        const { data: existingUser } = await supabase
            .from('users')
            .select('stripe_connect_id')
            .eq('id', userId)
            .single();

        if (existingUser?.stripe_connect_id) {
            return res.status(400).json({
                error: 'User already has a connected account',
                accountId: existingUser.stripe_connect_id
            });
        }

        // Create Stripe Connect Express account
        const account = await stripe.accounts.create({
            type: 'express',
            country,
            email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_type: 'individual',
            metadata: {
                userId,
                platform: 'ForTheWeebs'
            }
        });

        // Save Stripe Connect ID to database
        await supabase
            .from('users')
            .update({
                stripe_connect_id: account.id,
                stripe_connect_status: 'pending',
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        // Create account link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${process.env.VITE_APP_URL}/creator-dashboard?setup=failed`,
            return_url: `${process.env.VITE_APP_URL}/creator-dashboard?setup=success`,
            type: 'account_onboarding',
        });

        res.json({
            success: true,
            accountId: account.id,
            onboardingUrl: accountLink.url
        });

    } catch (error) {
        console.error('Error creating Stripe Connect account:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Stripe Connect Account Status
 * GET /api/stripe-connect/account-status/:userId
 */
router.get('/account-status/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data: user } = await supabase
            .from('users')
            .select('stripe_connect_id, stripe_connect_status')
            .eq('id', userId)
            .single();

        if (!user?.stripe_connect_id) {
            return res.json({
                connected: false,
                status: 'not_created'
            });
        }

        // Get account details from Stripe
        const account = await stripe.accounts.retrieve(user.stripe_connect_id);

        const isComplete = account.charges_enabled && account.payouts_enabled;

        // Update status in database
        await supabase
            .from('users')
            .update({
                stripe_connect_status: isComplete ? 'active' : 'pending'
            })
            .eq('id', userId);

        res.json({
            connected: true,
            status: isComplete ? 'active' : 'pending',
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            accountId: account.id
        });

    } catch (error) {
        console.error('Error checking account status:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create Stripe Connect Dashboard Link
 * POST /api/stripe-connect/dashboard-link
 */
router.post('/dashboard-link', async (req, res) => {
    try {
        const { userId } = req.body;

        const { data: user } = await supabase
            .from('users')
            .select('stripe_connect_id')
            .eq('id', userId)
            .single();

        if (!user?.stripe_connect_id) {
            return res.status(400).json({ error: 'No connected account found' });
        }

        const loginLink = await stripe.accounts.createLoginLink(user.stripe_connect_id);

        res.json({
            success: true,
            url: loginLink.url
        });

    } catch (error) {
        console.error('Error creating dashboard link:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Process Tip with Platform Fee
 * POST /api/stripe-connect/send-tip
 */
router.post('/send-tip', async (req, res) => {
    try {
        const {
            creatorId,
            tipperId,
            amount,
            message = '',
            paymentMethodId
        } = req.body;

        if (!creatorId || !amount || !paymentMethodId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get creator's Stripe Connect account
        const { data: creator } = await supabase
            .from('users')
            .select('stripe_connect_id, tier, influencer_free')
            .eq('id', creatorId)
            .single();

        if (!creator?.stripe_connect_id) {
            return res.status(400).json({ error: 'Creator has not set up payment account' });
        }

        // Calculate platform fee (15% unless they paid $15+ or are owner)
        const isPaidUser = creator.tier !== 'free' && creator.tier !== 'adult';
        const isOwner = creatorId === process.env.OWNER_USER_ID;

        let platformFeePercent = 0.15; // 15% default
        if (isPaidUser || isOwner || creator.influencer_free) {
            platformFeePercent = 0; // 0% for paid users, owner, and influencers
        }

        const amountInCents = Math.round(amount * 100);
        const platformFee = Math.round(amountInCents * platformFeePercent);
        const creatorReceives = amountInCents - platformFee;

        // Create payment intent with application fee
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            payment_method: paymentMethodId,
            confirm: true,
            application_fee_amount: platformFee,
            transfer_data: {
                destination: creator.stripe_connect_id,
            },
            metadata: {
                type: 'tip',
                creatorId,
                tipperId,
                message,
                platformFeePercent: (platformFeePercent * 100).toFixed(0) + '%'
            }
        });

        // Log tip in database
        await supabase
            .from('tips')
            .insert({
                creator_id: creatorId,
                tipper_id: tipperId,
                amount: amount,
                platform_fee: platformFee / 100,
                creator_receives: creatorReceives / 100,
                message,
                payment_intent_id: paymentIntent.id,
                status: paymentIntent.status,
                created_at: new Date().toISOString()
            });

        res.json({
            success: true,
            paymentIntent: paymentIntent.id,
            amount,
            platformFee: platformFee / 100,
            creatorReceives: creatorReceives / 100
        });

    } catch (error) {
        console.error('Error processing tip:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create Subscription for Creator's Content (Patreon-style)
 * POST /api/stripe-connect/create-subscription
 */
router.post('/create-subscription', async (req, res) => {
    try {
        const {
            creatorId,
            subscriberId,
            tierName,
            pricePerMonth,
            paymentMethodId
        } = req.body;

        if (!creatorId || !subscriberId || !pricePerMonth || !paymentMethodId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get creator's Stripe Connect account and tier
        const { data: creator } = await supabase
            .from('users')
            .select('stripe_connect_id, tier, influencer_free')
            .eq('id', creatorId)
            .single();

        if (!creator?.stripe_connect_id) {
            return res.status(400).json({ error: 'Creator has not set up payment account' });
        }

        // Calculate platform fee (15% unless paid user)
        const isPaidUser = creator.tier !== 'free' && creator.tier !== 'adult';
        const isOwner = creatorId === process.env.OWNER_USER_ID;

        let platformFeePercent = 0.15;
        if (isPaidUser || isOwner || creator.influencer_free) {
            platformFeePercent = 0;
        }

        const amountInCents = Math.round(pricePerMonth * 100);

        // Create or get customer
        const { data: existingSubscriber } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('id', subscriberId)
            .single();

        let customerId = existingSubscriber?.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({
                payment_method: paymentMethodId,
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
                metadata: {
                    userId: subscriberId
                }
            });
            customerId = customer.id;

            await supabase
                .from('users')
                .update({ stripe_customer_id: customerId })
                .eq('id', subscriberId);
        }

        // Create subscription with platform fee
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${tierName} Subscription`,
                        metadata: {
                            creatorId,
                            tierName
                        }
                    },
                    recurring: {
                        interval: 'month'
                    },
                    unit_amount: amountInCents,
                },
            }],
            application_fee_percent: platformFeePercent * 100,
            transfer_data: {
                destination: creator.stripe_connect_id,
            },
            metadata: {
                type: 'creator_subscription',
                creatorId,
                subscriberId,
                tierName,
                platformFeePercent: (platformFeePercent * 100).toFixed(0) + '%'
            }
        });

        // Log subscription in database
        await supabase
            .from('creator_subscriptions')
            .insert({
                creator_id: creatorId,
                subscriber_id: subscriberId,
                tier_name: tierName,
                price_per_month: pricePerMonth,
                platform_fee: pricePerMonth * platformFeePercent,
                stripe_subscription_id: subscription.id,
                status: subscription.status,
                created_at: new Date().toISOString()
            });

        res.json({
            success: true,
            subscriptionId: subscription.id,
            status: subscription.status,
            pricePerMonth,
            platformFee: pricePerMonth * platformFeePercent,
            creatorReceives: pricePerMonth * (1 - platformFeePercent)
        });

    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Cancel Creator Subscription
 * POST /api/stripe-connect/cancel-subscription
 */
router.post('/cancel-subscription', async (req, res) => {
    try {
        const { subscriptionId } = req.body;

        if (!subscriptionId) {
            return res.status(400).json({ error: 'subscriptionId required' });
        }

        // Cancel subscription
        await stripe.subscriptions.cancel(subscriptionId);

        // Update database
        await supabase
            .from('creator_subscriptions')
            .update({
                status: 'cancelled',
                cancelled_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscriptionId);

        res.json({
            success: true,
            subscriptionId,
            status: 'cancelled'
        });

    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Process Commission Payment with Platform Fee
 * POST /api/stripe-connect/pay-commission
 */
router.post('/pay-commission', async (req, res) => {
    try {
        const {
            commissionId,
            creatorId,
            buyerId,
            amount,
            paymentMethodId
        } = req.body;

        if (!commissionId || !creatorId || !amount || !paymentMethodId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get creator's Stripe Connect account and tier
        const { data: creator } = await supabase
            .from('users')
            .select('stripe_connect_id, tier, influencer_free')
            .eq('id', creatorId)
            .single();

        if (!creator?.stripe_connect_id) {
            return res.status(400).json({ error: 'Creator has not set up payment account' });
        }

        // Calculate platform fee (15% unless paid user)
        const isPaidUser = creator.tier !== 'free' && creator.tier !== 'adult';
        const isOwner = creatorId === process.env.OWNER_USER_ID;

        let platformFeePercent = 0.15;
        if (isPaidUser || isOwner || creator.influencer_free) {
            platformFeePercent = 0;
        }

        const amountInCents = Math.round(amount * 100);
        const platformFee = Math.round(amountInCents * platformFeePercent);

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            payment_method: paymentMethodId,
            confirm: true,
            application_fee_amount: platformFee,
            transfer_data: {
                destination: creator.stripe_connect_id,
            },
            metadata: {
                type: 'commission',
                commissionId,
                creatorId,
                buyerId,
                platformFeePercent: (platformFeePercent * 100).toFixed(0) + '%'
            }
        });

        // Update commission status
        await supabase
            .from('commissions')
            .update({
                status: 'paid',
                payment_intent_id: paymentIntent.id,
                paid_at: new Date().toISOString()
            })
            .eq('id', commissionId);

        res.json({
            success: true,
            paymentIntent: paymentIntent.id,
            amount,
            platformFee: platformFee / 100,
            creatorReceives: (amountInCents - platformFee) / 100
        });

    } catch (error) {
        console.error('Error processing commission payment:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Easy Payment Setup - No Stripe dashboard needed
 * POST /api/stripe-connect/easy-setup
 */
router.post('/easy-setup', async (req, res) => {
    try {
        const {
            userId,
            email,
            firstName,
            lastName,
            dateOfBirth,
            ssn_last4,
            accountHolderName,
            routingNumber,
            accountNumber,
            accountType,
            country = 'US'
        } = req.body;

        // Validation
        if (!userId || !email || !firstName || !lastName || !dateOfBirth || !ssn_last4 ||
            !accountHolderName || !routingNumber || !accountNumber) {
            return res.status(400).json({ error: 'All fields required' });
        }

        // Check if already has account
        const { data: existingUser } = await supabase
            .from('users')
            .select('stripe_connect_id')
            .eq('id', userId)
            .single();

        if (existingUser?.stripe_connect_id) {
            return res.status(400).json({ error: 'Account already exists' });
        }

        // Parse date of birth
        const dob = new Date(dateOfBirth);

        // Create Stripe Connect account with bank details
        const account = await stripe.accounts.create({
            type: 'express',
            country,
            email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_type: 'individual',
            individual: {
                first_name: firstName,
                last_name: lastName,
                dob: {
                    day: dob.getDate(),
                    month: dob.getMonth() + 1,
                    year: dob.getFullYear()
                },
                ssn_last_4: ssn_last4,
                email
            },
            external_account: {
                object: 'bank_account',
                country,
                currency: 'usd',
                account_holder_name: accountHolderName,
                account_holder_type: 'individual',
                routing_number: routingNumber,
                account_number: accountNumber
            },
            tos_acceptance: {
                date: Math.floor(Date.now() / 1000),
                ip: req.ip
            },
            metadata: {
                userId,
                platform: 'ForTheWeebs'
            }
        });

        // Save to database
        await supabase
            .from('users')
            .update({
                stripe_connect_id: account.id,
                stripe_connect_status: 'active',
                payment_enabled: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        res.json({
            success: true,
            accountId: account.id,
            message: 'Payment setup complete! You can now receive payments.'
        });

    } catch (error) {
        console.error('Easy setup error:', error);
        res.status(500).json({
            error: error.message || 'Setup failed',
            details: error.raw?.message
        });
    }
});

module.exports = router;
