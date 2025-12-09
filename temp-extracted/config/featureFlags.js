/**
 * Feature Flags Configuration
 * Controls which features are enabled based on API key availability
 */

class FeatureFlags {
  constructor() {
    // Check if PhotoDNA API key is configured
    this.hasPhotoDNA = !!process.env.PHOTODNA_API_KEY && process.env.PHOTODNA_API_KEY !== 'your_photodna_key_here';

    // Check if other required keys exist
    this.hasOpenAI = !!process.env.OPENAI_API_KEY;
    this.hasStripe = !!process.env.STRIPE_SECRET_KEY;
    this.hasSupabase = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  }

  /**
   * Social Media Features - REQUIRES PhotoDNA
   * These features allow user-generated content and must have CSAM detection
   */
  get socialMediaEnabled() {
    return this.hasPhotoDNA && this.hasSupabase;
  }

  /**
   * Creator Economy Features - REQUIRES PhotoDNA + Stripe
   * Adult content monetization requires CSAM protection
   */
  get creatorEconomyEnabled() {
    return this.hasPhotoDNA && this.hasStripe && this.hasSupabase;
  }

  /**
   * Creator Tools - AVAILABLE NOW
   * These tools don't require PhotoDNA
   */
  get creatorToolsEnabled() {
    return this.hasSupabase;
  }

  /**
   * AI Features - AVAILABLE if OpenAI key exists
   */
  get aiModerationEnabled() {
    return this.hasOpenAI;
  }

  /**
   * Get list of disabled features with reasons
   */
  getDisabledFeatures() {
    const disabled = [];

    if (!this.socialMediaEnabled) {
      disabled.push({
        feature: 'Social Media Platform',
        reason: !this.hasPhotoDNA
          ? 'PhotoDNA API key required for CSAM detection'
          : 'Supabase not configured',
        endpoint: '/api/posts',
        status: 'BLOCKED'
      });
    }

    if (!this.creatorEconomyEnabled) {
      disabled.push({
        feature: 'Creator Economy',
        reason: !this.hasPhotoDNA
          ? 'PhotoDNA API key required for CSAM detection'
          : !this.hasStripe
          ? 'Stripe API key not configured'
          : 'Supabase not configured',
        endpoint: '/api/subscriptions',
        status: 'BLOCKED'
      });
    }

    return disabled;
  }

  /**
   * Get feature status summary
   */
  getStatus() {
    return {
      socialMedia: this.socialMediaEnabled ? 'ENABLED' : 'DISABLED',
      creatorEconomy: this.creatorEconomyEnabled ? 'ENABLED' : 'DISABLED',
      creatorTools: this.creatorToolsEnabled ? 'ENABLED' : 'DISABLED',
      aiModeration: this.aiModerationEnabled ? 'ENABLED' : 'DISABLED',
      apiKeys: {
        photoDNA: this.hasPhotoDNA ? '✅' : '❌ REQUIRED FOR LAUNCH',
        openAI: this.hasOpenAI ? '✅' : '⚠️ Optional',
        stripe: this.hasStripe ? '✅' : '⚠️ Optional',
        supabase: this.hasSupabase ? '✅' : '❌ REQUIRED'
      }
    };
  }

  /**
   * Middleware to block social media endpoints until PhotoDNA is configured
   */
  requirePhotoDNA(req, res, next) {
    if (!this.socialMediaEnabled) {
      return res.status(503).json({
        error: 'Social media features not available',
        reason: 'PhotoDNA API key required for CSAM detection',
        message: 'This feature will be enabled once PhotoDNA is configured',
        setup: 'Add PHOTODNA_API_KEY to your .env file',
        disabledFeatures: this.getDisabledFeatures()
      });
    }
    next();
  }

  /**
   * Middleware to block creator economy until PhotoDNA + Stripe configured
   */
  requireCreatorEconomy(req, res, next) {
    if (!this.creatorEconomyEnabled) {
      return res.status(503).json({
        error: 'Creator economy features not available',
        reason: this.getDisabledFeatures().find(f => f.feature === 'Creator Economy')?.reason,
        message: 'This feature will be enabled once all requirements are met',
        setup: 'Add PHOTODNA_API_KEY and STRIPE_SECRET_KEY to your .env file'
      });
    }
    next();
  }
}

// Singleton instance
const featureFlags = new FeatureFlags();

module.exports = {
  featureFlags,
  requirePhotoDNA: featureFlags.requirePhotoDNA.bind(featureFlags),
  requireCreatorEconomy: featureFlags.requireCreatorEconomy.bind(featureFlags)
};
