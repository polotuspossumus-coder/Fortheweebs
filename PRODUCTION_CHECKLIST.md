# ✅ Production Deployment Checklist

Complete checklist for deploying ForTheWeebs to production.

---

## 🎯 Pre-Deployment (Do These First)

### 1. Environment Setup
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in all required values
- [ ] Test locally with `npm run dev:all`
- [ ] Verify all features work

### 2. Stripe Configuration
- [ ] Create 7 products in Stripe dashboard
- [ ] Copy all 7 price IDs to `.env`
- [ ] Set up webhook endpoint (see step 6)
- [ ] Test checkout with test card: `4242 4242 4242 4242`
- [ ] Verify tier assignment works

### 3. Supabase Setup
- [ ] Create project at supabase.com
- [ ] Create `users` table with columns:
  ```sql
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    tier TEXT DEFAULT 'free',
    subscription_status TEXT,
    subscription_id TEXT,
    subscription_type TEXT,
    tier_updated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] Enable Row Level Security (RLS)
- [ ] Copy URL and keys to `.env`

### 4. Face Detection Models
- [ ] Run: `npm run setup`
- [ ] Verify: `ls public/models/` (should see 9 files)
- [ ] Models are ~12MB, included in deployment

### 5. Git & GitHub
- [ ] Commit all changes: `git add . && git commit`
- [ ] Push to GitHub: `git push origin main`
- [ ] Create `.gitignore` if missing:
  ```
  .env
  .env.local
  .env.production
  node_modules/
  dist/
  ```

---

## 🚀 Railway Deployment (Backend)

### Step 1: Create Project
- [ ] Go to https://railway.app
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose your repository

### Step 2: Configure Build
- [ ] Railway auto-detects settings (uses Dockerfile)
- [ ] No changes needed if you have `railway.json`

### Step 3: Add Environment Variables
Add ALL of these to Railway:
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_PRICE_SOVEREIGN`
- [ ] `STRIPE_PRICE_FULL_MONTHLY`
- [ ] `STRIPE_PRICE_FULL_LIFETIME`
- [ ] `STRIPE_PRICE_HALF`
- [ ] `STRIPE_PRICE_ADVANCED`
- [ ] `STRIPE_PRICE_BASIC`
- [ ] `STRIPE_PRICE_STARTER`
- [ ] `ANTHROPIC_API_KEY`
- [ ] `NODE_ENV=production`
- [ ] `VITE_APP_URL=https://yourapp.netlify.app` (add after Netlify)

### Step 4: Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete (~5 mins)
- [ ] Copy your Railway URL (e.g., `https://yourapp.up.railway.app`)

### Step 5: Verify
- [ ] Visit `https://yourapp.up.railway.app/health`
- [ ] Should see: `{"status":"OK"}`

---

## 🌐 Netlify Deployment (Frontend)

### Step 1: Create Site
- [ ] Go to https://netlify.com
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Connect GitHub account
- [ ] Choose your repository

### Step 2: Configure Build
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Leave other settings as default

### Step 3: Add Environment Variables
Go to "Site settings" → "Environment variables":
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] `VITE_API_URL=https://your-railway-app.up.railway.app/api`

### Step 4: Deploy
- [ ] Click "Deploy site"
- [ ] Wait for build (~3 mins)
- [ ] Copy your Netlify URL

### Step 5: Update Railway
- [ ] Go back to Railway
- [ ] Add env var: `VITE_APP_URL=https://yourapp.netlify.app`
- [ ] Redeploy Railway

---

## 🔗 Stripe Webhook Setup

### Step 1: Get Webhook URL
Your webhook URL is:
```
https://your-railway-app.up.railway.app/api/stripe-webhook
```

### Step 2: Add to Stripe
- [ ] Go to https://dashboard.stripe.com/webhooks
- [ ] Click "Add endpoint"
- [ ] Paste your webhook URL
- [ ] Select events:
  - [x] `checkout.session.completed`
  - [x] `customer.subscription.deleted`
  - [x] `customer.subscription.updated`
- [ ] Click "Add endpoint"

### Step 3: Get Signing Secret
- [ ] Click on your new webhook
- [ ] Copy "Signing secret" (starts with `whsec_...`)
- [ ] Add to Railway as `STRIPE_WEBHOOK_SECRET`
- [ ] Redeploy Railway

### Step 4: Test Webhook
- [ ] Trigger a test event in Stripe
- [ ] Check Railway logs for webhook received
- [ ] Or use Stripe CLI: `stripe listen --forward-to localhost:3001/api/stripe-webhook`

---

## 🧪 Testing in Production

### 1. Pricing Page
- [ ] Visit `/pricing`
- [ ] All 6 tiers display correctly
- [ ] Sovereign shows spots remaining
- [ ] Click "Get Starter" → redirects to Stripe

### 2. Stripe Checkout
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Redirects back to success page
- [ ] Check Supabase: user tier updated

### 3. CGI Effects
- [ ] Visit `/cgi-demo`
- [ ] Allow webcam access
- [ ] Add a CGI effect
- [ ] Try a preset
- [ ] Record a video

### 4. Mico AI
- [ ] Visit Mico page
- [ ] Send a message
- [ ] Try: "add neon glow"
- [ ] Verify response

### 5. Video Calls
- [ ] Visit `/call/test-123`
- [ ] Start call in two browser tabs
- [ ] Enable CGI
- [ ] Try screen sharing

---

## 🔒 Security Checklist

### Before Going Live
- [ ] Use **Live mode** Stripe keys (not test)
- [ ] Create separate Live mode products in Stripe
- [ ] Update env vars with Live price IDs
- [ ] Enable Stripe webhook signature verification
- [ ] Add rate limiting (optional but recommended)
- [ ] Set up error monitoring (Sentry, etc)
- [ ] Configure CORS properly
- [ ] Use HTTPS everywhere
- [ ] Never expose secret keys in frontend

### Supabase Security
- [ ] Enable RLS on all tables
- [ ] Create policies for user access
- [ ] Use service role key only in backend
- [ ] Use anon key in frontend

---

## 📊 Post-Deployment

### 1. Monitor
- [ ] Check Railway logs for errors
- [ ] Check Stripe dashboard for webhooks
- [ ] Monitor Anthropic usage (console.anthropic.com)
- [ ] Set up uptime monitoring (UptimeRobot, etc)

### 2. DNS (Optional)
- [ ] Buy custom domain
- [ ] Add to Netlify: Settings → Domain management
- [ ] Add to Railway: Settings → Domains
- [ ] Update env vars with new URLs
- [ ] Update Stripe webhook URL

### 3. Analytics (Optional)
- [ ] Add Google Analytics
- [ ] Add Mixpanel/Amplitude
- [ ] Track key metrics:
  - Signups
  - Tier conversions
  - Sovereign spots remaining
  - CGI effect usage

---

## 🚨 Common Issues

### Issue: "Stripe webhook not receiving events"
**Fix:**
1. Check webhook URL is correct
2. Verify webhook secret in Railway env vars
3. Check Railway logs for incoming requests
4. Test with `stripe trigger checkout.session.completed`

### Issue: "CGI effects not loading"
**Fix:**
1. Check `public/models/` exists in deployment
2. Verify models downloaded: `npm run setup`
3. Check browser console for 404 errors
4. Models should be served from `/models/` path

### Issue: "Sovereign tier always shows 0 spots"
**Fix:**
1. Check Supabase connection
2. Verify `users` table exists
3. Test query: `SELECT COUNT(*) FROM users WHERE tier = 'sovereign'`

### Issue: "Mico AI not responding"
**Fix:**
1. Check `ANTHROPIC_API_KEY` in Railway
2. Verify API key is valid at console.anthropic.com
3. Check Railway logs for Anthropic errors
4. Ensure you have credits on Anthropic account

### Issue: "Netlify build failing"
**Fix:**
1. Check all `VITE_*` env vars are set
2. Verify build command is `npm run build`
3. Check for missing dependencies
4. Clear Netlify cache and retry

---

## ✅ Launch Checklist

### Before Public Launch
- [ ] All features tested and working
- [ ] Stripe Live mode configured
- [ ] Webhook tested with real payment
- [ ] SSL certificates active (HTTPS)
- [ ] Custom domain configured (optional)
- [ ] Terms of Service page live
- [ ] Privacy Policy page live
- [ ] Support email configured
- [ ] Social media accounts created
- [ ] Marketing materials prepared

### Launch Day
- [ ] Announce on social media
- [ ] Post to Product Hunt (optional)
- [ ] Send emails to beta users
- [ ] Monitor logs closely
- [ ] Be ready to fix issues
- [ ] Celebrate! 🎉

---

## 🆘 Support Resources

- **Railway Docs**: https://docs.railway.app
- **Netlify Docs**: https://docs.netlify.com
- **Stripe Docs**: https://stripe.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Anthropic Docs**: https://docs.anthropic.com

---

## 🎯 Success Metrics

Track these after launch:
- Total users
- Paid subscriptions by tier
- Sovereign spots filled (max 1000)
- Monthly recurring revenue (MRR)
- Churn rate
- Average session duration
- CGI effect usage
- Mico AI conversations

---

## 🚀 You're Ready!

Follow this checklist step by step. Don't skip steps. Test thoroughly.

**Questions?** Check the docs or logs first.

**Good luck with your launch!** 🎉
