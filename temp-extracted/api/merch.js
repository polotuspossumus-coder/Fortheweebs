/**
 * Merchandise Store API
 * Fan merchandise and creator products
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-key'
);

/**
 * Get Merchandise Products
 * GET /api/merch/products
 */
router.get('/products', async (req, res) => {
    try {
        const { creatorId, category } = req.query;

        let query = supabase
            .from('merchandise')
            .select('*, creator:users(id, username)')
            .eq('active', true);

        if (creatorId) {
            query = query.eq('creator_id', creatorId);
        }

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({ products: data || [] });
    } catch (error) {
        console.error('Get merch products error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create Merchandise Product
 * POST /api/merch/create
 */
router.post('/create', async (req, res) => {
    try {
        const { creatorId, name, description, price, category, images } = req.body;

        if (!creatorId || !name || !price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create Stripe product
        const stripeProduct = await stripe.products.create({
            name: name,
            description: description,
            images: images || [],
            metadata: {
                creatorId: creatorId,
                category: category
            }
        });

        // Create Stripe price
        const stripePrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: Math.round(price * 100),
            currency: 'usd'
        });

        // Save to database
        const { data, error } = await supabase
            .from('merchandise')
            .insert({
                creator_id: creatorId,
                name: name,
                description: description,
                price: price,
                category: category,
                images: images,
                stripe_product_id: stripeProduct.id,
                stripe_price_id: stripePrice.id,
                active: true,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ product: data });
    } catch (error) {
        console.error('Create merch error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Purchase Merchandise
 * POST /api/merch/purchase
 */
router.post('/purchase', async (req, res) => {
    try {
        const { productId, userId, quantity = 1 } = req.body;

        if (!productId || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get product details
        const { data: product, error: productError } = await supabase
            .from('merchandise')
            .select('*')
            .eq('id', productId)
            .single();

        if (productError) throw productError;

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: product.stripe_price_id,
                quantity: quantity
            }],
            mode: 'payment',
            success_url: `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/merch/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/merch/${productId}`,
            metadata: {
                userId: userId,
                productId: productId,
                quantity: quantity
            }
        });

        res.json({ checkoutUrl: session.url });
    } catch (error) {
        console.error('Purchase merch error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get User Orders
 * GET /api/merch/orders/:userId
 */
router.get('/orders/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('merch_orders')
            .select('*, product:merchandise(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ orders: data || [] });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
