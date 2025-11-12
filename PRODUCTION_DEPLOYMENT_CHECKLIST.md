# 🚀 ForTheWeebs Production Deployment Checklist

## Pre-Deployment Tasks

### 1. Environment Variables Setup

**Required for Netlify/Vercel:**
```bash
# Stripe (Switch to LIVE keys)
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx

# Admin Access (Keep secret!)
VITE_ADMIN_USERNAME=xxxxx
VITE_ADMIN_PASSWORD=xxxxx
VITE_OWNER_PHONE_NUMBER=+1234567890

# Crypto Payment Processor (when ready)
COINBASE_COMMERCE_API_KEY=xxxxx
BTCPAY_SERVER_URL=xxxxx
NOWPAYMENTS_API_KEY=xxxxx
```

### 2. Database Migration (localStorage → Supabase)

**Create Supabase Tables:**
```sql
-- Tool Unlocks
CREATE TABLE tool_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  tool_id TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

-- User Balances
CREATE TABLE user_balances (
  user_id TEXT PRIMARY KEY,
  balance DECIMAL(10,2) DEFAULT 0,
  total_earned DECIMAL(10,2) DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'tip', 'commission', 'print_sale', 'unlock_payment', 'referral_bonus'
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  payment_method TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id TEXT NOT NULL,
  referred_user_id TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'expired'
  first_unlock_amount DECIMAL(10,2),
  commission_earned DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  activated_at TIMESTAMP
);

-- NFT Mints
CREATE TABLE nft_mints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  nft_name TEXT NOT NULL,
  description TEXT,
  price_eth DECIMAL(18,8) NOT NULL,
  blockchain TEXT DEFAULT 'ethereum',
  token_id TEXT,
  image_url TEXT,
  listed BOOLEAN DEFAULT FALSE,
  minted_at TIMESTAMP DEFAULT NOW()
);

-- NFT Sales
CREATE TABLE nft_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nft_id UUID REFERENCES nft_mints(id),
  seller_id TEXT NOT NULL,
  buyer_id TEXT,
  sale_price_eth DECIMAL(18,8) NOT NULL,
  platform_cut_eth DECIMAL(18,8) NOT NULL, -- 50%
  seller_earnings_eth DECIMAL(18,8) NOT NULL, -- 50%
  sold_at TIMESTAMP DEFAULT NOW()
);

-- AI Models
CREATE TABLE ai_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  description TEXT,
  accuracy DECIMAL(5,2),
  training_images_count INT,
  status TEXT DEFAULT 'training', -- 'training', 'trained', 'failed'
  trained_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Stripe Webhook Setup

**Configure webhooks at:** https://dashboard.stripe.com/webhooks

**Endpoint:** `https://yoursite.com/api/stripe-webhook`

**Events to listen for:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

### 4. Security Hardening

- [ ] Remove all console.log() statements with sensitive data
- [ ] Add rate limiting to API endpoints
- [ ] Enable CORS with specific allowed origins
- [ ] Add CSRF protection
- [ ] Implement request validation/sanitization
- [ ] Set secure HTTP headers (CSP, HSTS, X-Frame-Options)
- [ ] Enable DDoS protection (Cloudflare)

### 5. Performance Optimization

- [ ] Minify and bundle JavaScript/CSS
- [ ] Compress images (WebP format)
- [ ] Enable CDN for static assets
- [ ] Implement lazy loading for images
- [ ] Code splitting for larger components
- [ ] Enable gzip/brotli compression
- [ ] Add service worker for offline support
- [ ] Optimize font loading (font-display: swap)

### 6. SEO & Meta Tags

```html
<!-- In index.html -->
<meta name="description" content="ForTheWeebs - Earn money creating anime content with professional tools. Zero upfront cost, unlock tools from your earnings.">
<meta name="keywords" content="anime, content creation, monetization, creators, tools, manga, art">
<meta property="og:title" content="ForTheWeebs - Anime Content Creation Platform">
<meta property="og:description" content="Earn money creating anime content. Professional tools, zero upfront cost.">
<meta property="og:image" content="https://yoursite.com/og-image.png">
<meta property="og:url" content="https://yoursite.com">
<meta name="twitter:card" content="summary_large_image">
```

### 7. Analytics & Monitoring

- [ ] Google Analytics or Plausible setup
- [ ] Error tracking (Sentry, LogRocket)
- [ ] Performance monitoring (Web Vitals)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] User behavior analytics (Hotjar, Mixpanel)

### 8. Legal & Compliance

- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Cookie consent banner (GDPR/CCPA)
- [ ] Age verification (18+) for adult content
- [ ] DMCA takedown process
- [ ] Refund policy clearly stated

### 9. Testing Checklist

**Manual Testing:**
- [ ] Test all tool unlocks (balance & card payment)
- [ ] Test referral link tracking
- [ ] Test admin login (/?admin=true)
- [ ] Test NFT minting workflow
- [ ] Test AI character training
- [ ] Test crypto payment flow
- [ ] Test responsive design (mobile/tablet/desktop)
- [ ] Test all social sharing buttons
- [ ] Test email notifications
- [ ] Test error states and fallbacks

**Automated Testing:**
- [ ] Unit tests for critical functions
- [ ] Integration tests for payment flows
- [ ] E2E tests for user journeys
- [ ] Load testing (handle 1000+ concurrent users)

### 10. Deployment Steps

**Netlify Deployment:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Or configure netlify.toml (already exists)
```

**Vercel Deployment:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Post-Deployment:**
- [ ] Verify all environment variables are set
- [ ] Test live site thoroughly
- [ ] Check SSL certificate is active
- [ ] Verify custom domain DNS settings
- [ ] Test payment processing with real cards
- [ ] Monitor error logs for 24-48 hours

### 11. Launch Announcement

**Social Media:**
- [ ] Twitter launch thread
- [ ] Reddit post (r/anime, r/AnimeArt, r/manga)
- [ ] Discord server announcement
- [ ] Instagram story/post
- [ ] TikTok teaser video

**Email Marketing:**
- [ ] Send to beta testers/waitlist
- [ ] Early bird pricing reminder
- [ ] Launch day email blast

**Press/Influencer Outreach:**
- [ ] Send press release to anime/tech blogs
- [ ] Reach out to anime YouTubers
- [ ] Contact podcast hosts for interviews

### 12. Post-Launch Monitoring

**First Week:**
- [ ] Monitor server performance
- [ ] Track conversion rates
- [ ] Respond to user feedback
- [ ] Fix critical bugs immediately
- [ ] Adjust pricing if needed
- [ ] Track referral signups

**First Month:**
- [ ] Analyze user behavior patterns
- [ ] Identify drop-off points
- [ ] Gather testimonials
- [ ] Iterate on features
- [ ] Scale infrastructure if needed

---

## Quick Commands Reference

```powershell
# Build production
npm run build

# Test production build locally
npm run preview

# Deploy to Netlify
netlify deploy --prod

# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Run tests
npm test
```

---

## Emergency Rollback Plan

If something breaks in production:

1. **Immediate:** Revert to previous deployment in Netlify/Vercel dashboard
2. **Quick Fix:** Push hotfix to GitHub, redeploy
3. **Communication:** Post status update on social media
4. **Post-Mortem:** Document what went wrong, how to prevent it

---

## Success Metrics to Track

- **User Acquisition:** Signups per day
- **Conversion Rate:** Free → Paid unlocks
- **Revenue:** Total earnings, average transaction
- **Referrals:** Referral signup rate, referral conversion rate
- **Engagement:** DAU/MAU, session duration, tools used
- **Retention:** 7-day, 30-day, 90-day retention rates
- **Support:** Tickets opened, resolution time

---

## Final Pre-Launch Check

- [ ] All environment variables set in production
- [ ] Stripe test mode DISABLED (live keys active)
- [ ] Database migrations complete
- [ ] Admin access working (test /?admin=true)
- [ ] Payment processing tested with real card
- [ ] SSL certificate valid
- [ ] Custom domain configured
- [ ] Error monitoring active
- [ ] Analytics tracking live
- [ ] Social media accounts ready
- [ ] Support email/system set up
- [ ] Legal pages published
- [ ] Launch announcement scheduled

---

**YOU'RE READY TO LAUNCH! 🚀**

Good luck with ForTheWeebs. You've built something unique and valuable. Now go make history.
