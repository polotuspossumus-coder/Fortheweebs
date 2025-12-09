/**
 * Marketplace API - Phase 4
 * Asset sales, template marketplace, creator-to-creator transactions
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * GET /api/marketplace/browse
 * Browse marketplace items (assets, templates, presets, etc.)
 */
router.get('/browse', async (req, res) => {
    try {
        const { category, type, minPrice, maxPrice, sort = 'popular', page = 1, limit = 20 } = req.query;

        let query = supabase
            .from('marketplace_items')
            .select('*, seller:seller_id(username, display_name, avatar_url, verified), sales_count, rating_avg')
            .eq('status', 'active');

        // Filters
        if (category) {
            query = query.eq('category', category);
        }

        if (type) {
            query = query.eq('type', type);
        }

        if (minPrice) {
            query = query.gte('price', parseFloat(minPrice) * 100); // Convert to cents
        }

        if (maxPrice) {
            query = query.lte('price', parseFloat(maxPrice) * 100);
        }

        // Sorting
        if (sort === 'popular') {
            query = query.order('sales_count', { ascending: false });
        } else if (sort === 'recent') {
            query = query.order('created_at', { ascending: false });
        } else if (sort === 'price_low') {
            query = query.order('price', { ascending: true });
        } else if (sort === 'price_high') {
            query = query.order('price', { ascending: false });
        } else if (sort === 'rating') {
            query = query.order('rating_avg', { ascending: false });
        }

        // Pagination
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;
        if (error) throw error;

        res.json({
            items: data,
            page: parseInt(page),
            limit: parseInt(limit),
            hasMore: data.length === parseInt(limit)
        });

    } catch (error) {
        console.error('Browse marketplace error:', error);
        res.status(500).json({ error: 'Failed to browse marketplace', details: error.message });
    }
});

/**
 * GET /api/marketplace/item/:itemId
 * Get marketplace item details
 */
router.get('/item/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;

        const { data, error } = await supabase
            .from('marketplace_items')
            .select(`
                *,
                seller:seller_id(username, display_name, avatar_url, verified),
                reviews:marketplace_reviews(rating, comment, created_at, buyer:buyer_id(username, avatar_url))
            `)
            .eq('id', itemId)
            .single();

        if (error) throw error;

        res.json({
            item: data
        });

    } catch (error) {
        console.error('Get item error:', error);
        res.status(500).json({ error: 'Failed to fetch item', details: error.message });
    }
});

/**
 * POST /api/marketplace/list
 * List a new item for sale
 */
router.post('/list', async (req, res) => {
    try {
        const {
            sellerId,
            title,
            description,
            category,
            type,
            price,
            files,
            previewImages,
            tags,
            license
        } = req.body;

        if (!sellerId || !title || !price || !files) {
            return res.status(400).json({ error: 'sellerId, title, price, and files required' });
        }

        // Validate seller is a creator
        const { data: seller, error: sellerError } = await supabase
            .from('creators')
            .select('id, stripe_account_id')
            .eq('id', sellerId)
            .single();

        if (sellerError || !seller) {
            return res.status(403).json({ error: 'Only creators can list items' });
        }

        if (!seller.stripe_account_id) {
            return res.status(400).json({ error: 'Connect Stripe account first to receive payments' });
        }

        const { data, error } = await supabase
            .from('marketplace_items')
            .insert({
                seller_id: sellerId,
                title,
                description,
                category: category || 'other',
                type: type || 'asset',
                price: Math.round(parseFloat(price) * 100), // Convert to cents
                files,
                preview_images: previewImages || [],
                tags: tags || [],
                license: license || 'standard',
                status: 'active',
                sales_count: 0,
                rating_avg: 0,
                rating_count: 0
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            item: data,
            message: 'Item listed successfully'
        });

    } catch (error) {
        console.error('List item error:', error);
        res.status(500).json({ error: 'Failed to list item', details: error.message });
    }
});

/**
 * POST /api/marketplace/purchase
 * Purchase a marketplace item
 */
router.post('/purchase', async (req, res) => {
    try {
        const { itemId, buyerId } = req.body;

        if (!itemId || !buyerId) {
            return res.status(400).json({ error: 'itemId and buyerId required' });
        }

        // Get item details
        const { data: item, error: itemError } = await supabase
            .from('marketplace_items')
            .select('*, seller:seller_id(stripe_account_id)')
            .eq('id', itemId)
            .single();

        if (itemError || !item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        if (item.status !== 'active') {
            return res.status(400).json({ error: 'Item not available for purchase' });
        }

        // Create Stripe payment intent with application fee
        const platformFeePercent = 10; // 10% platform fee
        const applicationFeeAmount = Math.round(item.price * (platformFeePercent / 100));

        const paymentIntent = await stripe.paymentIntents.create({
            amount: item.price,
            currency: 'usd',
            application_fee_amount: applicationFeeAmount,
            transfer_data: {
                destination: item.seller.stripe_account_id,
            },
            metadata: {
                item_id: itemId,
                buyer_id: buyerId,
                seller_id: item.seller_id
            }
        });

        // Record pending purchase
        const { data: purchase, error: purchaseError } = await supabase
            .from('marketplace_purchases')
            .insert({
                item_id: itemId,
                buyer_id: buyerId,
                seller_id: item.seller_id,
                amount: item.price,
                platform_fee: applicationFeeAmount,
                payment_intent_id: paymentIntent.id,
                status: 'pending'
            })
            .select()
            .single();

        if (purchaseError) throw purchaseError;

        res.json({
            clientSecret: paymentIntent.client_secret,
            purchaseId: purchase.id,
            amount: item.price / 100,
            message: 'Complete payment to access files'
        });

    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ error: 'Purchase failed', details: error.message });
    }
});

/**
 * POST /api/marketplace/purchase/:purchaseId/confirm
 * Confirm purchase after payment
 */
router.post('/purchase/:purchaseId/confirm', async (req, res) => {
    try {
        const { purchaseId } = req.params;
        const { paymentIntentId } = req.body;

        // Verify payment with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ error: 'Payment not completed' });
        }

        // Update purchase status
        const { data: purchase, error: updateError } = await supabase
            .from('marketplace_purchases')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString()
            })
            .eq('id', purchaseId)
            .select('*, item:item_id(files, seller_id)')
            .single();

        if (updateError) throw updateError;

        // Increment sales count
        await supabase.rpc('increment_item_sales', { item_id: purchase.item_id });

        // Grant access to files
        const { error: accessError } = await supabase
            .from('marketplace_access')
            .insert({
                purchase_id: purchaseId,
                buyer_id: purchase.buyer_id,
                item_id: purchase.item_id,
                files: purchase.item.files,
                granted_at: new Date().toISOString()
            });

        if (accessError) throw accessError;

        res.json({
            purchase,
            files: purchase.item.files,
            message: 'Purchase complete! Files are now accessible'
        });

    } catch (error) {
        console.error('Confirm purchase error:', error);
        res.status(500).json({ error: 'Failed to confirm purchase', details: error.message });
    }
});

/**
 * GET /api/marketplace/my-purchases/:buyerId
 * Get user's purchased items
 */
router.get('/my-purchases/:buyerId', async (req, res) => {
    try {
        const { buyerId } = req.params;

        const { data, error } = await supabase
            .from('marketplace_purchases')
            .select(`
                *,
                item:item_id(title, preview_images),
                seller:seller_id(username, display_name)
            `)
            .eq('buyer_id', buyerId)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false });

        if (error) throw error;

        res.json({
            purchases: data
        });

    } catch (error) {
        console.error('Get purchases error:', error);
        res.status(500).json({ error: 'Failed to fetch purchases', details: error.message });
    }
});

/**
 * GET /api/marketplace/my-sales/:sellerId
 * Get creator's sales history
 */
router.get('/my-sales/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;

        const { data, error } = await supabase
            .from('marketplace_purchases')
            .select(`
                *,
                item:item_id(title),
                buyer:buyer_id(username, display_name)
            `)
            .eq('seller_id', sellerId)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false });

        if (error) throw error;

        // Calculate totals
        const totalSales = data.length;
        const totalRevenue = data.reduce((sum, sale) => sum + (sale.amount - sale.platform_fee), 0);

        res.json({
            sales: data,
            stats: {
                totalSales,
                totalRevenue: totalRevenue / 100,
                averageSale: totalSales > 0 ? (totalRevenue / totalSales) / 100 : 0
            }
        });

    } catch (error) {
        console.error('Get sales error:', error);
        res.status(500).json({ error: 'Failed to fetch sales', details: error.message });
    }
});

/**
 * POST /api/marketplace/review
 * Leave a review for a purchased item
 */
router.post('/review', async (req, res) => {
    try {
        const { purchaseId, rating, comment } = req.body;

        if (!purchaseId || !rating) {
            return res.status(400).json({ error: 'purchaseId and rating required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Verify purchase exists and is completed
        const { data: purchase, error: purchaseError } = await supabase
            .from('marketplace_purchases')
            .select('id, item_id, buyer_id')
            .eq('id', purchaseId)
            .eq('status', 'completed')
            .single();

        if (purchaseError || !purchase) {
            return res.status(403).json({ error: 'Can only review completed purchases' });
        }

        // Check if already reviewed
        const { data: existing } = await supabase
            .from('marketplace_reviews')
            .select('id')
            .eq('purchase_id', purchaseId)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Already reviewed this purchase' });
        }

        // Create review
        const { data, error } = await supabase
            .from('marketplace_reviews')
            .insert({
                purchase_id: purchaseId,
                item_id: purchase.item_id,
                buyer_id: purchase.buyer_id,
                rating,
                comment
            })
            .select()
            .single();

        if (error) throw error;

        // Update item rating average
        await supabase.rpc('update_item_rating', { item_id: purchase.item_id });

        res.json({
            review: data,
            message: 'Review submitted successfully'
        });

    } catch (error) {
        console.error('Review error:', error);
        res.status(500).json({ error: 'Failed to submit review', details: error.message });
    }
});

/**
 * GET /api/marketplace/categories
 * Get all marketplace categories
 */
router.get('/categories', async (req, res) => {
    try {
        const categories = [
            { id: 'templates', name: 'Templates', icon: '📄' },
            { id: 'presets', name: 'Presets', icon: '🎨' },
            { id: '3d-models', name: '3D Models', icon: '🗿' },
            { id: 'textures', name: 'Textures', icon: '🖼️' },
            { id: 'brushes', name: 'Brushes', icon: '🖌️' },
            { id: 'fonts', name: 'Fonts', icon: '🔤' },
            { id: 'sound-effects', name: 'Sound Effects', icon: '🔊' },
            { id: 'music', name: 'Music', icon: '🎵' },
            { id: 'video-effects', name: 'Video Effects', icon: '🎬' },
            { id: 'scripts', name: 'Scripts', icon: '📜' },
            { id: 'plugins', name: 'Plugins', icon: '🔌' },
            { id: 'other', name: 'Other', icon: '📦' }
        ];

        // Get item counts per category
        const { data: items, error } = await supabase
            .from('marketplace_items')
            .select('category')
            .eq('status', 'active');

        if (error) throw error;

        const counts = {};
        items.forEach(item => {
            counts[item.category] = (counts[item.category] || 0) + 1;
        });

        const categoriesWithCounts = categories.map(cat => ({
            ...cat,
            itemCount: counts[cat.id] || 0
        }));

        res.json({
            categories: categoriesWithCounts
        });

    } catch (error) {
        console.error('Categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories', details: error.message });
    }
});

module.exports = router;
