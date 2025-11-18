# 🚀 Production Deployment Guide

## Overview

This guide covers deploying ForTheWeebs to production with:
- **Backend**: Railway/Render
- **Frontend**: Netlify
- **Database**: Supabase/Neon
- **Redis**: Upstash
- **CDN**: Cloudflare
- **Monitoring**: Sentry
- **Payments**: Stripe Live

## Prerequisites

### Accounts Needed
- [ ] GitHub account (for CI/CD)
- [ ] Railway/Render account (backend hosting)
- [ ] Netlify account (frontend hosting)
- [ ] Supabase/Neon account (database)
- [ ] Upstash account (Redis)
- [ ] Stripe account (live keys)
- [ ] Cloudflare account (CDN/DNS)
- [ ] Sentry account (monitoring)

### Domain Setup
- [ ] Purchase domain: `fortheweebs.com`
- [ ] Add to Cloudflare for DNS + CDN
- [ ] Configure subdomains:
  - `fortheweebs.com` → Frontend (Netlify)
  - `api.fortheweebs.com` → Backend (Railway/Render)

## Step 1: Database Setup (Supabase)

### Create Database
1. Go to https://supabase.com
2. Create new project: "ForTheWeebs Production"
3. Copy connection string
4. Enable connection pooling (for serverless)

### Connection String Format
```
postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Run Migrations
```bash
cd server
export DATABASE_URL="your-supabase-connection-string"
npx prisma migrate deploy
```

### Enable Automated Backups
- Supabase automatically backs up daily
- Configure point-in-time recovery (PITR) in dashboard

## Step 2: Redis Setup (Upstash)

1. Go to https://upstash.com
2. Create Redis database: "ForTheWeebs Cache"
3. Copy Redis URL:
```
redis://default:[password]@us1-quality-panda-12345.upstash.io:6379
```

## Step 3: Stripe Configuration

### Create Live Product
1. Go to Stripe Dashboard → Products
2. Create "ForTheWeebs Premium Lifetime"
3. Add one-time price: $1,000.00
4. Copy Price ID: `price_xxxxxxxxxxxxx`

### Get Live Keys
```
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
```

### Setup Webhook
1. Stripe Dashboard → Webhooks
2. Add endpoint: `https://api.fortheweebs.com/v1/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
4. Copy webhook secret: `whsec_xxxxxxxxxxxxx`

## Step 4: Backend Deployment (Railway)

### Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

### Create Project
```bash
cd server
railway init
railway link
```

### Set Environment Variables
```bash
railway variables set DATABASE_URL="postgresql://..."
railway variables set REDIS_URL="redis://..."
railway variables set JWT_SECRET="your-super-secret-key"
railway variables set STRIPE_SECRET_KEY="sk_live_..."
railway variables set STRIPE_WEBHOOK_SECRET="whsec_..."
railway variables set STRIPE_PRICE_ID="price_..."
railway variables set FRONTEND_URL="https://fortheweebs.com"
railway variables set NODE_ENV="production"
railway variables set PORT="3001"
```

### Deploy
```bash
railway up
```

### Configure Custom Domain
1. Railway Dashboard → Settings → Domains
2. Add custom domain: `api.fortheweebs.com`
3. Copy CNAME record
4. Add to Cloudflare DNS:
   - Type: CNAME
   - Name: api
   - Target: [railway-domain]
   - Proxy: Enabled (orange cloud)

## Step 5: Frontend Deployment (Netlify)

### Install Netlify CLI
```bash
npm install -g netlify-cli
netlify login
```

### Initialize Site
```bash
# In project root
netlify init
```

### Set Environment Variables
Netlify Dashboard → Site Settings → Environment Variables:
```
VITE_API_URL=https://api.fortheweebs.com/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_ENV=production
```

### Deploy
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Configure Custom Domain
1. Netlify Dashboard → Domain Settings
2. Add custom domain: `fortheweebs.com`
3. Netlify auto-provisions SSL via Let's Encrypt

## Step 6: Cloudflare Setup

### DNS Configuration
```
Type    Name    Target                          Proxy
A       @       75.2.60.5 (Netlify)            ✅ Proxied
CNAME   api     [railway-domain]               ✅ Proxied
CNAME   www     fortheweebs.com                ✅ Proxied
```

### SSL/TLS Settings
- SSL/TLS encryption mode: **Full (strict)**
- Always Use HTTPS: **On**
- Minimum TLS Version: **1.2**

### Performance
- **Caching Level**: Standard
- **Auto Minify**: HTML, CSS, JS
- **Brotli Compression**: On

### Security
- **Security Level**: Medium
- **Challenge Passage**: 30 minutes
- **Bot Fight Mode**: On

## Step 7: CI/CD Setup (GitHub Actions)

### Add Secrets to GitHub
Repository → Settings → Secrets and Variables → Actions:

```
# Railway
RAILWAY_TOKEN=xxxxx
RAILWAY_PROJECT_ID=xxxxx

# Netlify
NETLIFY_AUTH_TOKEN=xxxxx
NETLIFY_SITE_ID=xxxxx

# Database
DATABASE_URL=postgresql://...

# API Keys
VITE_API_URL=https://api.fortheweebs.com/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_SENTRY_DSN=https://...

# Notifications (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

### Enable Workflows
- `.github/workflows/deploy-backend.yml` → Auto-deploys on `server/**` changes
- `.github/workflows/deploy-frontend.yml` → Auto-deploys on frontend changes

## Step 8: Monitoring Setup (Sentry)

### Create Projects
1. Create "ForTheWeebs Backend" project
2. Create "ForTheWeebs Frontend" project
3. Copy DSN for each

### Install Sentry SDK

**Backend:**
```bash
cd server
npm install @sentry/node
```

**Frontend:**
```bash
npm install @sentry/react
```

### Configure

**Backend** (`server/src/main.ts`):
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Frontend** (`src/main.jsx`):
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENV,
});
```

## Step 9: Rate Limiting

Already configured in `app.module.production.ts`:
- 100 requests per minute
- 500 requests per 10 minutes
- 1000 requests per hour

## Step 10: Production Testing

### Health Checks
```bash
# Backend
curl https://api.fortheweebs.com/v1/health
curl https://api.fortheweebs.com/v1/health/ready
curl https://api.fortheweebs.com/v1/health/live

# Frontend
curl https://fortheweebs.com
```

### API Tests
```bash
# Create test account
curl -X POST https://api.fortheweebs.com/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123!"}'

# Test Stripe webhook
stripe listen --forward-to https://api.fortheweebs.com/v1/webhooks/stripe
stripe trigger checkout.session.completed
```

### Load Testing
```bash
# Install k6
brew install k6  # Mac
choco install k6  # Windows

# Run load test
k6 run loadtest.js
```

## Production Checklist

### Security
- [ ] JWT_SECRET is strong random string (64+ chars)
- [ ] All environment variables set
- [ ] HTTPS enforced everywhere
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers configured
- [ ] SQL injection protection (Prisma parameterized queries)

### Database
- [ ] Connection pooling enabled
- [ ] Automated daily backups configured
- [ ] Point-in-time recovery enabled
- [ ] Indexes created on foreign keys
- [ ] Test restore procedure

### Stripe
- [ ] Live keys configured
- [ ] Webhook endpoint verified
- [ ] Test live payment flow
- [ ] Webhook signature verification working
- [ ] Success/cancel URLs correct

### Monitoring
- [ ] Sentry error tracking active
- [ ] Health checks responding
- [ ] Uptime monitoring configured
- [ ] Log aggregation set up
- [ ] Alert thresholds configured

### Performance
- [ ] CDN enabled (Cloudflare)
- [ ] Redis caching working
- [ ] Database query optimization
- [ ] Frontend bundle size < 1MB
- [ ] Lighthouse score > 90

### Compliance
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Refund policy documented
- [ ] GDPR compliance reviewed
- [ ] Cookie consent implemented

## Rollback Procedure

### Backend
```bash
railway rollback  # Railway
# or in Render: Dashboard → Rollback to previous deploy
```

### Frontend
```bash
netlify rollback
```

### Database
```bash
# Restore from Supabase backup
# Dashboard → Database → Backups → Restore
```

## Cost Estimates

### Monthly Costs (100 users)
- **Railway/Render**: $5-20/month
- **Supabase**: Free tier (upgrade at 500MB)
- **Upstash Redis**: Free tier (10K commands/day)
- **Netlify**: Free tier (100GB bandwidth)
- **Cloudflare**: Free tier
- **Sentry**: Free tier (5K errors/month)
- **Stripe**: 2.9% + $0.30 per transaction

**Total**: ~$10-30/month + transaction fees

## Support Contacts

- **Backend Issues**: Check Railway/Render logs
- **Frontend Issues**: Check Netlify deploy logs
- **Database Issues**: Check Supabase logs
- **Payment Issues**: Check Stripe dashboard
- **DNS Issues**: Check Cloudflare analytics

## Next Steps

1. Complete all checklist items
2. Run full QA test suite
3. Load test with 50+ concurrent users
4. Announce launch! 🚀
