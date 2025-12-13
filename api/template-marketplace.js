const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Template Library & Marketplace System
 * Foundation for beating Canva's 100k templates
 * 
 * Allows users to browse, use, and sell templates
 * Revenue share: 70% creator, 30% platform (Unity model)
 */

// Browse templates
router.get('/browse', async (req, res) => {
  try {
    const { category, type, sort, page, limit } = req.query;
    // category: 'social-media', 'manga-panels', 'album-covers', 'vr-scenes', 'audio-presets'
    // type: 'graphic-design', 'audio', 'vr', 'animation'
    // sort: 'popular', 'recent', 'trending', 'price-low', 'price-high'

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('templates')
      .select(`
        *,
        creator:user_id(id, username, avatar_url),
        stats:template_stats(downloads, likes, views)
      `, { count: 'exact' });

    // Filters
    if (category) query = query.eq('category', category);
    if (type) query = query.eq('type', type);

    // Sorting
    switch (sort) {
      case 'popular':
        query = query.order('download_count', { ascending: false });
        break;
      case 'recent':
        query = query.order('created_at', { ascending: false });
        break;
      case 'trending':
        query = query.order('trending_score', { ascending: false });
        break;
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      templates: data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum)
      }
    });

  } catch (error) {
    console.error('Template browse error:', error);
    res.status(500).json({ error: 'Failed to browse templates' });
  }
});

// Get single template
router.get('/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;

    const { data, error } = await supabase
      .from('templates')
      .select(`
        *,
        creator:user_id(id, username, avatar_url, bio),
        stats:template_stats(*),
        reviews:template_reviews(rating, comment, user_id)
      `)
      .eq('id', templateId)
      .single();

    if (error) throw error;

    // Increment view count
    await supabase.rpc('increment_template_views', { template_id: templateId });

    res.json({
      success: true,
      template: data
    });

  } catch (error) {
    console.error('Template fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Upload/publish template
router.post('/publish', async (req, res) => {
  try {
    const {
      userId,
      title,
      description,
      category,
      type,
      tags,
      templateData, // JSON of layers/settings
      previewImage,
      price, // 0 for free, > 0 for paid
      license // 'personal', 'commercial', 'cc0'
    } = req.body;

    if (!userId || !title || !templateData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Upload preview image to storage
    const previewPath = `templates/${userId}/${Date.now()}_preview.png`;
    const { error: uploadError } = await supabase.storage
      .from('template-previews')
      .upload(previewPath, Buffer.from(previewImage.split(',')[1], 'base64'), {
        contentType: 'image/png'
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('template-previews')
      .getPublicUrl(previewPath);

    // Insert template
    const { data, error } = await supabase
      .from('templates')
      .insert({
        user_id: userId,
        title,
        description,
        category,
        type,
        tags,
        template_data: templateData,
        preview_url: publicUrl,
        price: price || 0,
        license: license || 'personal',
        status: 'published',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      template: data,
      message: 'Template published successfully'
    });

  } catch (error) {
    console.error('Template publish error:', error);
    res.status(500).json({ error: 'Failed to publish template' });
  }
});

// Purchase template
router.post('/purchase', async (req, res) => {
  try {
    const { userId, templateId } = req.body;

    // Get template details
    const { data: template, error: fetchError } = await supabase
      .from('templates')
      .select('*, creator:user_id(id, stripe_account_id)')
      .eq('id', templateId)
      .single();

    if (fetchError) throw fetchError;

    // Check if already purchased
    const { data: existing } = await supabase
      .from('template_purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .single();

    if (existing) {
      return res.json({
        success: true,
        alreadyOwned: true,
        message: 'You already own this template'
      });
    }

    if (template.price === 0) {
      // Free template - just record download
      await supabase.from('template_purchases').insert({
        user_id: userId,
        template_id: templateId,
        price_paid: 0,
        purchased_at: new Date().toISOString()
      });

      // Increment download count
      await supabase.rpc('increment_template_downloads', { template_id: templateId });

      return res.json({
        success: true,
        templateData: template.template_data,
        message: 'Free template downloaded'
      });
    }

    // Paid template - process payment via Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: template.price * 100, // Convert to cents
      currency: 'usd',
      application_fee_amount: Math.round(template.price * 100 * 0.30), // 30% platform fee
      transfer_data: {
        destination: template.creator.stripe_account_id // Pay creator 70%
      },
      metadata: {
        user_id: userId,
        template_id: templateId,
        creator_id: template.user_id
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      price: template.price,
      message: 'Payment initiated'
    });

  } catch (error) {
    console.error('Template purchase error:', error);
    res.status(500).json({ error: 'Purchase failed' });
  }
});

// Download purchased template
router.get('/download/:templateId', async (req, res) => {
  try {
    const { userId, templateId } = req.params;
    

    // Verify ownership
    const { data: purchase, error: purchaseError } = await supabase
      .from('template_purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .single();

    if (purchaseError || !purchase) {
      return res.status(403).json({ error: 'Template not purchased' });
    }

    // Get template data
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('template_data, title')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    res.json({
      success: true,
      templateData: template.template_data,
      title: template.title
    });

  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Rate/review template
router.post('/review', async (req, res) => {
  try {
    const { userId, templateId, rating, comment } = req.body;

    if (!userId || !templateId || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user purchased template
    const { data: purchase } = await supabase
      .from('template_purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .single();

    if (!purchase) {
      return res.status(403).json({ error: 'Must purchase template to review' });
    }

    // Insert or update review
    const { data, error } = await supabase
      .from('template_reviews')
      .upsert({
        user_id: userId,
        template_id: templateId,
        rating,
        comment,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Update template average rating
    await supabase.rpc('update_template_rating', { template_id: templateId });

    res.json({
      success: true,
      review: data,
      message: 'Review submitted'
    });

  } catch (error) {
    console.error('Template review error:', error);
    res.status(500).json({ error: 'Review submission failed' });
  }
});

module.exports = router;
