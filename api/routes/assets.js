import express from 'express';
import { supabase } from '../../lib/supabaseClient.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get assets with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, sort, tags, search } = req.query;

    let query = supabase
      .from('assets')
      .select(`
        *,
        creator:users!assets_user_id_fkey(id, username, avatar_url)
      `);

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (tags) {
      const tagList = tags.split(',').filter(t => t.trim());
      if (tagList.length > 0) {
        query = query.contains('tags', tagList);
      }
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'popular':
        query = query.order('likes', { ascending: false });
        break;
      case 'downloads':
        query = query.order('downloads', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data: assets, error } = await query;

    if (error) throw error;

    // Check if user liked each asset
    const { data: userLikes } = await supabase
      .from('asset_likes')
      .select('asset_id')
      .eq('user_id', req.user.id);

    const likedAssetIds = new Set(userLikes?.map(l => l.asset_id) || []);

    const assetsWithLikes = assets?.map(asset => ({
      ...asset,
      likedByUser: likedAssetIds.has(asset.id)
    })) || [];

    res.json({ assets: assetsWithLikes });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Get single asset
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: asset, error } = await supabase
      .from('assets')
      .select(`
        *,
        creator:users!assets_user_id_fkey(id, username, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Increment view count
    await supabase
      .from('assets')
      .update({ views: (asset.views || 0) + 1 })
      .eq('id', id);

    // Check if user liked
    const { data: like } = await supabase
      .from('asset_likes')
      .select('id')
      .eq('asset_id', id)
      .eq('user_id', req.user.id)
      .single();

    res.json({ 
      asset: {
        ...asset,
        views: (asset.views || 0) + 1,
        likedByUser: !!like
      }
    });
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
});

// Like asset
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('asset_likes')
      .select('id')
      .eq('asset_id', id)
      .eq('user_id', req.user.id)
      .single();

    if (existingLike) {
      // Unlike
      await supabase
        .from('asset_likes')
        .delete()
        .eq('asset_id', id)
        .eq('user_id', req.user.id);

      await supabase.rpc('decrement_asset_likes', { asset_id: id });

      return res.json({ success: true, liked: false });
    }

    // Like
    await supabase
      .from('asset_likes')
      .insert({
        asset_id: id,
        user_id: req.user.id
      });

    await supabase.rpc('increment_asset_likes', { asset_id: id });

    res.json({ success: true, liked: true });
  } catch (error) {
    console.error('Error liking asset:', error);
    res.status(500).json({ error: 'Failed to like asset' });
  }
});

// Track download
router.post('/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Increment download count
    await supabase.rpc('increment_asset_downloads', { asset_id: id });

    // Track download in history
    await supabase
      .from('asset_downloads')
      .insert({
        asset_id: id,
        user_id: req.user.id
      });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking download:', error);
    res.status(500).json({ error: 'Failed to track download' });
  }
});

// Upload new asset (simplified - would need multer for file uploads)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      format,
      tags,
      fileSize,
      downloadUrl,
      thumbnailUrl,
      license,
      version,
      compatibility,
      changelog
    } = req.body;

    const { data: asset, error } = await supabase
      .from('assets')
      .insert({
        user_id: req.user.id,
        name,
        description,
        category,
        format,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        file_size: fileSize,
        download_url: downloadUrl,
        thumbnail: thumbnailUrl,
        license,
        version,
        compatibility,
        changelog,
        likes: 0,
        downloads: 0,
        views: 0
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, asset });
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// Update asset
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify ownership
    const { data: asset } = await supabase
      .from('assets')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!asset || asset.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data: updatedAsset, error } = await supabase
      .from('assets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, asset: updatedAsset });
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

// Delete asset
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: asset } = await supabase
      .from('assets')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!asset || asset.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

export default router;
