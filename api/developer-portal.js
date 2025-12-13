/**
 * FORTHEWEEBS API MARKETPLACE - DEVELOPER PORTAL
 * 
 * Endpoints for developers to manage API keys, view usage, upgrade plans.
 * Crown jewels protected. Money printer enabled.
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Generate a secure API key
 * Format: ftw_live_abc123xyz789def456ghi (40 chars total)
 */
function generateApiKey(isTest = false) {
  const prefix = isTest ? 'ftw_test_' : 'ftw_live_';
  const randomPart = crypto.randomBytes(16).toString('hex'); // 32 chars
  return prefix + randomPart;
}

/**
 * Hash API key for storage (bcrypt - secure AF)
 */
async function hashApiKey(key) {
  return await bcrypt.hash(key, 12);
}

/**
 * Get key prefix for display (first 16 chars + ...)
 */
function getKeyPrefix(key) {
  return key.substring(0, Math.min(16, key.length));
}

// ============================================================================
// ENDPOINTS - API KEY MANAGEMENT
// ============================================================================

/**
 * POST /api/developer/keys/generate
 * Generate new API key for authenticated user
 */
router.post('/keys/generate', async (req, res) => {
  try {
    const { name, planName = 'free', isTest = false } = req.body;
    const userId = req.user?.id; // From auth middleware

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Key name is required' });
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('api_plans')
      .select('*')
      .eq('name', planName)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Check if user already has too many keys (limit: 10 per user)
    const { count } = await supabase
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (count >= 10) {
      return res.status(429).json({ 
        error: 'Maximum API keys reached (10). Revoke unused keys first.' 
      });
    }

    // Generate new key
    const apiKey = generateApiKey(isTest);
    const keyHash = await hashApiKey(apiKey);
    const keyPrefix = getKeyPrefix(apiKey);

    // Store in database
    const { data: newKey, error: insertError } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        name: name.trim(),
        plan_id: plan.id,
        is_test_mode: isTest,
        current_minute_start: new Date().toISOString(),
        current_day_start: new Date().toISOString()
      })
      .select('id, key_prefix, name, plan_id, is_test_mode, created_at')
      .single();

    if (insertError) {
      return res.status(500).json({ error: 'Failed to create API key' });
    }

    res.json({
      success: true,
      message: '🔑 API key generated! Save it now - you won\'t see it again.',
      key: apiKey, // ⚠️ ONLY TIME WE SHOW FULL KEY
      keyId: newKey.id,
      keyPrefix: newKey.key_prefix,
      name: newKey.name,
      plan: plan.name,
      limits: {
        requestsPerMonth: plan.requests_per_month,
        requestsPerMinute: plan.requests_per_minute,
        requestsPerDay: plan.requests_per_day
      },
      created_at: newKey.created_at
    });

  } catch (error) {
    console.error('Generate API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/developer/keys
 * List all API keys for authenticated user
 */
router.get('/keys', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data: keys, error } = await supabase
      .from('api_keys')
      .select(`
        id,
        key_prefix,
        name,
        is_active,
        is_test_mode,
        total_requests,
        this_month_requests,
        last_request_at,
        monthly_reset_at,
        created_at,
        expires_at,
        revoked_at,
        plan_id,
        api_plans (
          name,
          display_name,
          requests_per_month,
          requests_per_minute
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch API keys' });
    }

    res.json({
      success: true,
      keys: keys.map(key => ({
        id: key.id,
        keyPrefix: key.key_prefix,
        name: key.name,
        plan: key.api_plans?.display_name || 'Unknown',
        planName: key.api_plans?.name,
        isActive: key.is_active,
        isTest: key.is_test_mode,
        usage: {
          total: key.total_requests,
          thisMonth: key.this_month_requests,
          limit: key.api_plans?.requests_per_month || 0,
          percentUsed: key.api_plans?.requests_per_month > 0
            ? Math.round((key.this_month_requests / key.api_plans.requests_per_month) * 100)
            : 0
        },
        lastUsed: key.last_request_at,
        monthlyReset: key.monthly_reset_at,
        createdAt: key.created_at,
        expiresAt: key.expires_at,
        revokedAt: key.revoked_at
      }))
    });

  } catch (error) {
    console.error('List API keys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/developer/keys/:keyId/revoke
 * Revoke an API key (soft delete)
 */
router.delete('/keys/:keyId/revoke', async (req, res) => {
  try {
    const { keyId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify ownership
    const { data: key, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix')
      .eq('id', keyId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !key) {
      return res.status(404).json({ error: 'API key not found' });
    }

    // Revoke key
    const { error: revokeError } = await supabase
      .from('api_keys')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString()
      })
      .eq('id', keyId)
      .eq('user_id', userId);

    if (revokeError) {
      return res.status(500).json({ error: 'Failed to revoke API key' });
    }

    res.json({
      success: true,
      message: `API key "${key.name}" (${key.key_prefix}...) revoked successfully`,
      keyId: key.id
    });

  } catch (error) {
    console.error('Revoke API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/developer/keys/:keyId/rotate
 * Rotate an API key (generate new, revoke old)
 */
router.post('/keys/:keyId/rotate', async (req, res) => {
  try {
    const { keyId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get old key details
    const { data: oldKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('*, api_plans(*)')
      .eq('id', keyId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (fetchError || !oldKey) {
      return res.status(404).json({ error: 'Active API key not found' });
    }

    // Generate new key
    const newApiKey = generateApiKey(oldKey.is_test_mode);
    const keyHash = await hashApiKey(newApiKey);
    const keyPrefix = getKeyPrefix(newApiKey);

    // Start transaction: Create new, revoke old
    const { data: newKey, error: createError } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        name: `${oldKey.name} (Rotated)`,
        plan_id: oldKey.plan_id,
        is_test_mode: oldKey.is_test_mode,
        current_minute_start: new Date().toISOString(),
        current_day_start: new Date().toISOString()
      })
      .select('id, key_prefix, name, created_at')
      .single();

    if (createError) {
      return res.status(500).json({ error: 'Failed to rotate API key' });
    }

    // Revoke old key
    await supabase
      .from('api_keys')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString()
      })
      .eq('id', keyId);

    res.json({
      success: true,
      message: '🔄 API key rotated successfully! Save the new key now.',
      newKey: newApiKey, // ⚠️ ONLY TIME WE SHOW FULL KEY
      keyId: newKey.id,
      keyPrefix: newKey.key_prefix,
      oldKeyId: keyId,
      oldKeyPrefix: oldKey.key_prefix
    });

  } catch (error) {
    console.error('Rotate API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/developer/keys/:keyId
 * Update API key metadata (name, plan upgrade, etc.)
 */
router.patch('/keys/:keyId', async (req, res) => {
  try {
    const { keyId } = req.params;
    const { name, planName } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify ownership
    const { data: existingKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('id')
      .eq('id', keyId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    const updates = {};

    // Update name if provided
    if (name && name.trim().length > 0) {
      updates.name = name.trim();
    }

    // Update plan if provided (requires payment verification - handled by billing endpoint)
    if (planName) {
      const { data: plan } = await supabase
        .from('api_plans')
        .select('id')
        .eq('name', planName)
        .eq('is_active', true)
        .single();

      if (plan) {
        updates.plan_id = plan.id;
        updates.this_month_requests = 0; // Reset usage on plan change
        updates.monthly_reset_at = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString();
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    // Apply updates
    const { error: updateError } = await supabase
      .from('api_keys')
      .update(updates)
      .eq('id', keyId)
      .eq('user_id', userId);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update API key' });
    }

    res.json({
      success: true,
      message: 'API key updated successfully',
      updates
    });

  } catch (error) {
    console.error('Update API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// ENDPOINTS - PLANS & PRICING
// ============================================================================

/**
 * GET /api/developer/plans
 * Get all available API plans
 */
router.get('/plans', async (req, res) => {
  try {
    const { data: plans, error } = await supabase
      .from('api_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) {
      console.error('Error fetching plans:', error);
      return res.status(500).json({ error: 'Failed to fetch plans' });
    }

    res.json({
      success: true,
      plans: plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        displayName: plan.display_name,
        pricing: {
          monthly: plan.price_monthly / 100,
          annual: plan.price_annual ? plan.price_annual / 100 : null,
          overageCost: plan.overage_cost_per_request / 100
        },
        limits: {
          requestsPerMonth: plan.requests_per_month,
          requestsPerMinute: plan.requests_per_minute,
          requestsPerDay: plan.requests_per_day
        },
        features: plan.allowed_features,
        stripePrice: plan.stripe_price_id
      }))
    });

  } catch (error) {
    console.error('List plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/developer/features
 * Get all API-accessible features
 */
router.get('/features', async (req, res) => {
  try {
    const { data: features, error } = await supabase
      .from('api_feature_config')
      .select('*')
      .eq('is_api_accessible', true)
      .order('category');

    if (error) {
      console.error('Error fetching features:', error);
      return res.status(500).json({ error: 'Failed to fetch features' });
    }

    // Group by category
    const grouped = features.reduce((acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = [];
      }
      acc[feature.category].push({
        id: feature.feature_id,
        name: feature.display_name,
        endpoint: feature.endpoint,
        description: feature.description,
        pricing: {
          costPerRequest: feature.price_per_request,
          baseCost: feature.base_cost
        },
        requiredPlan: feature.required_plan,
        rateLimit: feature.max_requests_per_minute,
        exampleRequest: feature.example_request,
        exampleResponse: feature.example_response
      });
      return acc;
    }, {});

    res.json({
      success: true,
      features: grouped,
      totalFeatures: features.length,
      categories: Object.keys(grouped)
    });

  } catch (error) {
    console.error('List features error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
