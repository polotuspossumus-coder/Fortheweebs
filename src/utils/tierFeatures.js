/**
 * Tier Features - Define what each tier can access
 * Used for feature gates throughout the app
 *
 * NOTE: Mico AI is FREE for EVERYONE - we don't monetize Microsoft Copilot's work
 */

export const TIER_FEATURES = {
  sovereign: {
    // CGI Effects
    cgi_effects: true,
    cgi_effect_count: 24,
    cgi_presets: 12,

    // Video Features
    video_calls: true,
    recording: true,
    screen_sharing: true,

    // AI Features (FREE for all tiers!)
    mico_ai: true,
    mico_commands: 'unlimited',
    mico_file_ops: true,
    mico_cgi_control: true, // Only Sovereign can control CGI via Mico

    // Premium Features
    priority_support: true,
    vip_status: true,
    custom_branding: true,
    api_access: true,
    analytics: true,
    admin_panel: true,

    // Limits
    max_video_length: 'unlimited',
    max_uploads_per_day: 'unlimited',
    storage_gb: 1000,

    // Display
    display_name: 'Sovereign',
    display_badge: '👑',
    display_color: '#FFD700'
  },

  full_monthly: {
    // CGI Effects
    cgi_effects: false,
    cgi_effect_count: 0,
    cgi_presets: 12,

    // Video Features
    video_calls: false,
    recording: true,
    screen_sharing: false,

    // AI Features
    mico_ai: true,
    mico_commands: 'unlimited',
    mico_file_ops: true,

    // Premium Features
    priority_support: true,
    custom_branding: true,
    api_access: true,
    analytics: true,

    // Limits
    max_video_length: 60, // minutes
    max_uploads_per_day: 100,
    storage_gb: 500,

    // Display
    display_name: 'Full Unlock',
    display_badge: '💎',
    display_color: '#667eea'
  },

  full_lifetime: {
    // Same as full_monthly but lifetime access
    cgi_effects: false,
    cgi_effect_count: 0,
    cgi_presets: 12,

    video_calls: false,
    recording: true,
    screen_sharing: false,

    mico_ai: true,
    mico_commands: 'unlimited',
    mico_file_ops: true,

    priority_support: true,
    custom_branding: true,
    api_access: true,
    analytics: true,

    max_video_length: 'unlimited',
    max_uploads_per_day: 'unlimited',
    storage_gb: 500,

    display_name: 'Full Unlock (Lifetime)',
    display_badge: '💎',
    display_color: '#667eea'
  },

  half: {
    // CGI Effects
    cgi_effects: true,
    cgi_effect_count: 12,
    cgi_presets: 6,

    // Video Features
    video_calls: false,
    recording: true,
    screen_sharing: false,

    // AI Features
    mico_ai: true,
    mico_commands: 'unlimited',
    mico_file_ops: false,

    // Premium Features
    custom_branding: false,
    analytics: true,

    // Limits
    max_video_length: 30, // minutes
    max_uploads_per_day: 50,
    storage_gb: 100,

    // Display
    display_name: 'Half Unlock',
    display_badge: '⭐',
    display_color: '#764ba2'
  },

  advanced: {
    // CGI Effects
    cgi_effects: true,
    cgi_effect_count: 6,
    cgi_presets: 3,

    // Video Features
    video_calls: false,
    recording: true,
    screen_sharing: false,

    // AI Features
    mico_ai: true,
    mico_commands: 'unlimited',
    mico_file_ops: false,

    // Premium Features
    analytics: false,

    // Limits
    max_video_length: 15, // minutes
    max_uploads_per_day: 25,
    storage_gb: 50,

    // Display
    display_name: 'Advanced',
    display_badge: '🚀',
    display_color: '#48bb78'
  },

  basic: {
    // CGI Effects
    cgi_effects: true,
    cgi_effect_count: 3,
    cgi_presets: 0,

    // Video Features
    video_calls: false,
    recording: true,
    screen_sharing: false,

    // AI Features
    mico_ai: true,
    mico_commands: 'unlimited',

    // Limits
    max_video_length: 10, // minutes
    max_uploads_per_day: 10,
    storage_gb: 10,

    // Display
    display_name: 'Basic',
    display_badge: '✓',
    display_color: '#4299e1'
  },

  starter: {
    // CGI Effects
    cgi_effects: true,
    cgi_effect_count: 1,
    cgi_presets: 0,

    // Video Features
    video_calls: false,
    recording: false,
    screen_sharing: false,

    // AI Features
    mico_ai: true,

    // Limits
    max_video_length: 5, // minutes
    max_uploads_per_day: 5,
    storage_gb: 5,

    // Display
    display_name: 'Starter',
    display_badge: '🌱',
    display_color: '#718096'
  },

  free: {
    // CGI Effects
    cgi_effects: false,
    cgi_effect_count: 0,
    cgi_presets: 0,

    // Video Features
    video_calls: false,
    recording: false,
    screen_sharing: false,

    // AI Features
    mico_ai: true,

    // Limits
    max_video_length: 0,
    max_uploads_per_day: 0,
    storage_gb: 1,

    // Display
    display_name: 'Free',
    display_badge: '',
    display_color: '#a0aec0'
  }
};

/**
 * Check if user has access to feature
 * @param {string} tier - User's tier
 * @param {string} feature - Feature to check
 * @returns {boolean}
 */
export function hasFeature(tier, feature) {
  return TIER_FEATURES[tier]?.[feature] === true;
}

/**
 * Get feature limit/value
 * @param {string} tier - User's tier
 * @param {string} feature - Feature to get limit for
 * @returns {any}
 */
export function getFeatureLimit(tier, feature) {
  return TIER_FEATURES[tier]?.[feature];
}

/**
 * Get all features for a tier
 * @param {string} tier - User's tier
 * @returns {object}
 */
export function getTierFeatures(tier) {
  return TIER_FEATURES[tier] || TIER_FEATURES.free;
}

/**
 * Check if tier allows specific CGI effect
 * @param {string} tier - User's tier
 * @param {number} effectIndex - Index of effect (0-23)
 * @returns {boolean}
 */
export function canUseEffect(tier, effectIndex) {
  const allowedCount = getFeatureLimit(tier, 'cgi_effect_count');
  if (allowedCount === 'unlimited' || allowedCount === 24) return true;
  return effectIndex < allowedCount;
}

/**
 * Get tier display info
 * @param {string} tier - User's tier
 * @returns {object}
 */
export function getTierDisplay(tier) {
  const features = getTierFeatures(tier);
  return {
    name: features.display_name,
    badge: features.display_badge,
    color: features.display_color
  };
}

/**
 * Compare two tiers (for upgrades/downgrades)
 * @param {string} tierA
 * @param {string} tierB
 * @returns {number} - Positive if A > B, negative if A < B, 0 if equal
 */
export function compareTiers(tierA, tierB) {
  const tierOrder = ['free', 'starter', 'basic', 'advanced', 'half', 'full_lifetime', 'full_monthly', 'sovereign'];
  return tierOrder.indexOf(tierA) - tierOrder.indexOf(tierB);
}

/**
 * Check if upgrade is available
 * @param {string} currentTier
 * @param {string} targetTier
 * @returns {boolean}
 */
export function canUpgradeTo(currentTier, targetTier) {
  return compareTiers(targetTier, currentTier) > 0;
}

/**
 * Get recommended upgrade tier
 * @param {string} currentTier
 * @returns {string}
 */
export function getRecommendedUpgrade(currentTier) {
  const upgradePaths = {
    free: 'starter',
    starter: 'basic',
    basic: 'advanced',
    advanced: 'half',
    half: 'full_monthly',
    full_monthly: 'sovereign',
    full_lifetime: 'sovereign'
  };
  return upgradePaths[currentTier] || 'sovereign';
}

/**
 * Get tier pricing info
 * @param {string} tier
 * @returns {object}
 */
export function getTierPricing(tier) {
  const pricing = {
    sovereign: { amount: 1000, period: 'monthly', setup: 0 },
    full_monthly: { amount: 500, period: 'monthly', setup: 0 },
    full_lifetime: { amount: 500, period: 'lifetime', setup: 0 },
    half: { amount: 250, period: 'monthly', setup: 0 },
    advanced: { amount: 100, period: 'monthly', setup: 0 },
    basic: { amount: 50, period: 'monthly', setup: 0 },
    starter: { amount: 5, period: 'monthly', setup: 15 },
    free: { amount: 0, period: 'free', setup: 0 }
  };
  return pricing[tier] || pricing.free;
}
