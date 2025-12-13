/**
 * FORTHEWEEBS API KEY AUTHENTICATION & USAGE TRACKING MIDDLEWARE
 * 
 * Every API call goes through here. Validates keys, tracks usage, enforces limits.
 * The money counter that never sleeps. 💰
 */

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// In-memory cache for API keys (reduces DB hits)
const keyCache = new Map();
const CACHE_TTL = 60000; // 1 minute

// ============================================================================
// MIDDLEWARE: API KEY AUTHENTICATION
// ============================================================================

/**
 * Validate API key and attach key metadata to request
 * Usage: router.use('/api/v1/*', apiKeyAuth);
 */
async function apiKeyAuth(req, res, next) {
  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'API key required. Include Authorization: Bearer ftw_live_xxx header',
        docs: 'https://fortheweebs.com/developers/docs/authentication'
      });
    }

    const apiKey = authHeader.substring(7); // Remove 'Bearer '

    // Validate key format
    if (!apiKey.match(/^ftw_(live|test)_[a-zA-Z0-9]{32}$/)) {
      return res.status(401).json({
        error: 'Invalid API key format',
        message: 'API key must be in format: ftw_live_xxx or ftw_test_xxx'
      });
    }

    // Check cache first
    const cacheKey = apiKey.substring(0, 16); // Use prefix as cache key
    const cached = keyCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      req.apiKey = cached.data;
      return next();
    }

    // Query database for key
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select(`
        *,
        api_plans (
          name,
          display_name,
          requests_per_month,
          requests_per_minute,
          requests_per_day,
          allowed_features
        )
      `)
      .eq('is_active', true)
      .eq('key_prefix', apiKey.substring(0, 16));

    if (error || !keys || keys.length === 0) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'API key not found or has been revoked'
      });
    }

    // Verify key hash (bcrypt compare - one of the keys will match)
    let validKey = null;
    for (const key of keys) {
      const isValid = await bcrypt.compare(apiKey, key.key_hash);
      if (isValid) {
        validKey = key;
        break;
      }
    }

    if (!validKey) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'API key verification failed'
      });
    }

    // Check expiration
    if (validKey.expires_at && new Date(validKey.expires_at) < new Date()) {
      return res.status(401).json({
        error: 'API key expired',
        message: 'This API key has expired. Generate a new one in your developer dashboard.'
      });
    }

    // Cache the key
    keyCache.set(cacheKey, {
      data: validKey,
      timestamp: Date.now()
    });

    // Attach to request
    req.apiKey = validKey;
    req.apiPlan = validKey.api_plans;
    req.userId = validKey.user_id;

    next();

  } catch (error) {
    console.error('API key auth error:', error);
    res.status(500).json({
      error: 'Authentication error',
      message: 'Failed to validate API key'
    });
  }
}

// ============================================================================
// MIDDLEWARE: RATE LIMITING
// ============================================================================

/**
 * Enforce rate limits based on plan tier
 */
async function rateLimiter(req, res, next) {
  try {
    const apiKey = req.apiKey;
    const plan = req.apiPlan;

    if (!apiKey || !plan) {
      return res.status(500).json({ error: 'Rate limiter: Missing API key data' });
    }

    const now = new Date();
    const nowISO = now.toISOString();

    // ========================================
    // 1. CHECK MONTHLY LIMIT
    // ========================================
    if (plan.requests_per_month !== -1) { // -1 = unlimited
      if (apiKey.this_month_requests >= plan.requests_per_month) {
        return res.status(429).json({
          error: 'Monthly limit exceeded',
          message: `You've used ${apiKey.this_month_requests}/${plan.requests_per_month} requests this month`,
          resetAt: apiKey.monthly_reset_at,
          upgrade: 'https://fortheweebs.com/developers/pricing'
        });
      }
    }

    // ========================================
    // 2. CHECK PER-MINUTE RATE LIMIT
    // ========================================
    const minuteStart = new Date(apiKey.current_minute_start);
    const minuteElapsed = (now - minuteStart) / 1000;

    if (minuteElapsed < 60) {
      // Same minute - check limit
      if (apiKey.current_minute_requests >= plan.requests_per_minute) {
        const resetIn = Math.ceil(60 - minuteElapsed);
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Too many requests. Limit: ${plan.requests_per_minute}/minute`,
          retryAfter: resetIn,
          resetAt: new Date(minuteStart.getTime() + 60000).toISOString()
        });
      }
    }

    // ========================================
    // 3. CHECK PER-DAY LIMIT (if applicable)
    // ========================================
    if (plan.requests_per_day && plan.requests_per_day !== -1) {
      const dayStart = new Date(apiKey.current_day_start);
      const dayElapsed = (now - dayStart) / (1000 * 60 * 60);

      if (dayElapsed < 24) {
        if (apiKey.current_day_requests >= plan.requests_per_day) {
          const resetIn = Math.ceil(24 - dayElapsed);
          return res.status(429).json({
            error: 'Daily limit exceeded',
            message: `You've used ${apiKey.current_day_requests}/${plan.requests_per_day} requests today`,
            retryAfter: resetIn * 3600,
            resetAt: new Date(dayStart.getTime() + 86400000).toISOString()
          });
        }
      }
    }

    // ========================================
    // 4. INCREMENT COUNTERS
    // ========================================
    const updates = {
      total_requests: apiKey.total_requests + 1,
      this_month_requests: apiKey.this_month_requests + 1,
      last_request_at: nowISO,
      last_used_ip: req.ip,
      last_used_user_agent: req.headers['user-agent']
    };

    // Reset minute counter if new minute
    if (minuteElapsed >= 60) {
      updates.current_minute_requests = 1;
      updates.current_minute_start = nowISO;
    } else {
      updates.current_minute_requests = apiKey.current_minute_requests + 1;
    }

    // Reset day counter if new day
    const dayStart = new Date(apiKey.current_day_start);
    const dayElapsed = (now - dayStart) / (1000 * 60 * 60);
    if (dayElapsed >= 24) {
      updates.current_day_requests = 1;
      updates.current_day_start = nowISO;
    } else {
      updates.current_day_requests = apiKey.current_day_requests + 1;
    }

    // Update database (async - don't wait)
    supabase
      .from('api_keys')
      .update(updates)
      .eq('id', apiKey.id)
      .then(() => {
        // Update cache
        const cacheKey = apiKey.key_prefix;
        const cached = keyCache.get(cacheKey);
        if (cached) {
          cached.data = { ...cached.data, ...updates };
        }
      })
      .catch(err => console.error('Rate limiter update error:', err));

    // Attach usage info to request for logging
    req.apiUsage = {
      requestNumber: updates.this_month_requests,
      monthlyLimit: plan.requests_per_month,
      percentUsed: plan.requests_per_month > 0
        ? Math.round((updates.this_month_requests / plan.requests_per_month) * 100)
        : 0
    };

    next();

  } catch (error) {
    console.error('Rate limiter error:', error);
    // Don't block request on rate limiter failure
    next();
  }
}

// ============================================================================
// MIDDLEWARE: FEATURE ACCESS CONTROL
// ============================================================================

/**
 * Check if API key's plan allows access to requested feature
 * Usage: router.post('/api/v1/background-remove', featureAuth('background-removal'), ...)
 */
function featureAuth(featureId) {
  return async (req, res, next) => {
    try {
      const plan = req.apiPlan;

      if (!plan) {
        return res.status(500).json({ error: 'Feature auth: Missing plan data' });
      }

      // Check if feature is API-accessible
      const { data: feature, error } = await supabase
        .from('api_feature_config')
        .select('*')
        .eq('feature_id', featureId)
        .single();

      if (error || !feature) {
        return res.status(404).json({
          error: 'Feature not found',
          message: `Feature '${featureId}' does not exist`
        });
      }

      // Check if feature is locked to platform-only
      if (!feature.is_api_accessible) {
        return res.status(403).json({
          error: 'Feature not available via API',
          message: `'${feature.display_name}' is exclusive to ForTheWeebs platform users`,
          alternative: 'https://fortheweebs.com/pricing'
        });
      }

      // Check if plan includes this feature
      const allowedFeatures = plan.allowed_features || [];
      if (!allowedFeatures.includes(featureId)) {
        return res.status(403).json({
          error: 'Feature not included in your plan',
          message: `'${feature.display_name}' requires ${feature.required_plan.join(' or ')} plan`,
          currentPlan: plan.name,
          upgrade: 'https://fortheweebs.com/developers/pricing'
        });
      }

      // Attach feature config to request
      req.feature = feature;
      next();

    } catch (error) {
      console.error('Feature auth error:', error);
      res.status(500).json({ error: 'Feature authorization failed' });
    }
  };
}

// ============================================================================
// MIDDLEWARE: USAGE LOGGING
// ============================================================================

/**
 * Log API usage for billing & analytics
 * Call this AFTER request completes
 */
async function logUsage(req, res, statusCode, responseTimeMs, metadata = {}) {
  try {
    const apiKey = req.apiKey;
    const feature = req.feature;

    if (!apiKey || !feature) return; // Skip if not API request

    const {
      tokensUsed = 0,
      creditsUsed = 1.0,
      costToUs = feature.base_cost || 0,
      chargedToDev = feature.price_per_request || 0,
      errorMessage = null
    } = metadata;

    await supabase
      .from('api_usage')
      .insert({
        api_key_id: apiKey.id,
        user_id: apiKey.user_id,
        endpoint: req.path,
        method: req.method,
        feature_id: feature.feature_id,
        status_code: statusCode,
        response_time_ms: responseTimeMs,
        tokens_used: tokensUsed,
        credits_used: creditsUsed,
        cost_to_us: costToUs,
        charged_to_dev: chargedToDev,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        request_size_bytes: req.headers['content-length'] || 0,
        error_message: errorMessage
      });

  } catch (error) {
    console.error('Usage logging error:', error);
    // Don't throw - logging failure shouldn't break the request
  }
}

/**
 * Express middleware wrapper for usage logging
 */
function usageLogger(req, res, next) {
  const startTime = Date.now();

  // Intercept res.json to log after response
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Log usage asynchronously
    logUsage(req, res, res.statusCode, responseTime, {
      errorMessage: res.statusCode >= 400 ? data.error || data.message : null
    }).catch(err => console.error('Usage logger error:', err));

    return originalJson(data);
  };

  next();
}

// ============================================================================
// UTILITY: Clear cache (for key updates)
// ============================================================================

function clearKeyCache(keyPrefix) {
  keyCache.delete(keyPrefix);
}

function clearAllKeyCache() {
  keyCache.clear();
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  apiKeyAuth,
  rateLimiter,
  featureAuth,
  usageLogger,
  logUsage,
  clearKeyCache,
  clearAllKeyCache
};
