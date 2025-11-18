# 🚀 Supabase + Railway + Netlify Production Setup

## Current Status
✅ Frontend already deployed on Netlify
✅ Supabase account ready
⏳ Need to connect backend to Supabase and deploy to Railway

---

## Step 1: Connect Backend to Supabase (5 minutes)

### Get Supabase Connection String
1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project (or create new project: "ForTheWeebs Production")
3. Go to **Settings** → **Database**
4. Scroll to **Connection string** section
5. Select **Connection pooling** (for serverless/Railway)
6. Copy the **Transaction** mode connection string

It looks like:
```
postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Update Local Environment
```powershell
cd server

# Create .env file with your Supabase connection string
echo 'DATABASE_URL="postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"' > .env
echo 'REDIS_URL="redis://localhost:6379"' >> .env
echo 'JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"' >> .env
echo 'STRIPE_SECRET_KEY="sk_test_your_test_key"' >> .env
echo 'STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"' >> .env
echo 'STRIPE_PRICE_ID="price_your_price_id"' >> .env
echo 'FRONTEND_URL="https://fortheweebs.netlify.app"' >> .env
echo 'NODE_ENV="development"' >> .env
echo 'PORT="3001"' >> .env
```

### Push Schema to Supabase
```powershell
# Generate Prisma client
npx prisma generate

# Push migrations to Supabase
npx prisma migrate deploy

# OR if you haven't created migrations yet
npx prisma db push
```

### Test Local Backend with Supabase
```powershell
# Make sure Docker is running for Redis
docker-compose up -d redis

# Start backend
npm run dev
```

### Verify Connection
Open new PowerShell window:
```powershell
# Test health check
Invoke-RestMethod -Uri "http://localhost:3001/v1/health"

# Should return:
# {
#   "status": "ok",
#   "database": "connected",
#   "timestamp": "..."
# }
```

✅ **Once this works, your backend is connected to Supabase!**

---

## Step 2: Deploy Backend to Railway (10 minutes)

### Install Railway CLI
```powershell
npm install -g @railway/cli
railway login
```

This opens browser for authentication. Sign in with GitHub.

### Create Railway Project
```powershell
cd server
railway init
# Name it: fortheweebs-api
```

### Add Redis to Railway
```powershell
railway add redis
# This provisions a Redis instance automatically
```

### Set Environment Variables
```powershell
# Database (your Supabase connection string)
railway variables set DATABASE_URL="postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# Redis (automatically set by Railway, but you can check with)
railway variables

# JWT Secret (generate a strong random string)
railway variables set JWT_SECRET="$(openssl rand -base64 64)"

# Stripe (use test keys for now)
railway variables set STRIPE_SECRET_KEY="sk_test_your_test_key"
railway variables set STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key"
railway variables set STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
railway variables set STRIPE_PRICE_ID="price_your_price_id"

# Frontend URL (your Netlify domain)
railway variables set FRONTEND_URL="https://fortheweebs.netlify.app"

# Node environment
railway variables set NODE_ENV="production"
railway variables set PORT="3001"

# Owner email
railway variables set OWNER_EMAIL="polotuspossumus@gmail.com"
```

### Deploy to Railway
```powershell
railway up
```

This builds and deploys your backend. Wait 2-3 minutes.

### Get Your Railway URL
```powershell
railway domain
# Returns something like: fortheweebs-api-production.up.railway.app
```

### Test Production Backend
```powershell
# Test health check
Invoke-RestMethod -Uri "https://fortheweebs-api-production.up.railway.app/v1/health"
```

✅ **Your backend is now live on Railway!**

---

## Step 3: Connect Netlify Frontend to Railway Backend (5 minutes)

### Update Netlify Environment Variables
1. Go to Netlify dashboard: https://app.netlify.com
2. Select your **ForTheWeebs** site
3. Go to **Site settings** → **Environment variables**
4. Add/Update these variables:

```
VITE_API_URL=https://fortheweebs-api-production.up.railway.app/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
VITE_ENV=production
```

### Redeploy Frontend
```powershell
# In project root (not server/)
git add -A
git commit -m "Update API URL to Railway backend"
git push origin main
```

Netlify auto-deploys on push. Wait 2 minutes.

### Test Complete Flow
1. Go to https://fortheweebs.netlify.app
2. Try signing up with test account
3. Try creating a post
4. Check if data appears

✅ **Full stack is connected!**

---

## Step 4: Configure Stripe Webhooks (3 minutes)

### Update Stripe Webhook Endpoint
1. Go to Stripe Dashboard: https://dashboard.stripe.com/webhooks
2. Click on your existing webhook (or create new)
3. Update endpoint URL to:
   ```
   https://fortheweebs-api-production.up.railway.app/v1/webhooks/stripe
   ```
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_`)

### Update Railway with Webhook Secret
```powershell
railway variables set STRIPE_WEBHOOK_SECRET="whsec_your_new_webhook_secret"
```

### Test Webhook
```bash
# Install Stripe CLI if you haven't
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe

stripe login
stripe trigger checkout.session.completed --stripe-account YOUR_ACCOUNT_ID
```

Check Railway logs:
```powershell
railway logs
# Should show "Webhook received: checkout.session.completed"
```

---

## Step 5: Enable Backups on Supabase (2 minutes)

1. Supabase dashboard → **Database** → **Backups**
2. Daily automatic backups are already enabled (free tier)
3. For point-in-time recovery (PITR):
   - Upgrade to Pro plan ($25/month)
   - Enable PITR in settings
   - Allows restore to any point in last 7 days

---

## Step 6: Setup Custom Domain (Optional, 10 minutes)

### Option A: Use Railway's Domain
Your backend is already at: `fortheweebs-api-production.up.railway.app`

### Option B: Custom Domain (api.fortheweebs.com)
1. Purchase domain at Namecheap/GoDaddy
2. Add to Cloudflare for DNS
3. In Railway:
   - Settings → Custom Domain
   - Add `api.fortheweebs.com`
   - Copy CNAME target
4. In Cloudflare DNS:
   ```
   Type: CNAME
   Name: api
   Target: [railway-provided-domain]
   Proxy: ON (orange cloud)
   ```
5. Wait 5-10 minutes for DNS propagation
6. Update Netlify env vars with new URL

---

## Complete Environment Variables Reference

### Railway Backend Variables
```bash
DATABASE_URL=postgresql://postgres.xxx:[pass]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
REDIS_URL=redis://default:[pass]@redis.railway.internal:6379  # Auto-set by Railway
JWT_SECRET=[64-char-random-string]
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_live_xxx  # Use sk_test for testing
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID=price_xxx
FRONTEND_URL=https://fortheweebs.netlify.app
NODE_ENV=production
PORT=3001
OWNER_EMAIL=polotuspossumus@gmail.com
CORS_ORIGINS=https://fortheweebs.netlify.app
```

### Netlify Frontend Variables
```bash
VITE_API_URL=https://fortheweebs-api-production.up.railway.app/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx  # Use pk_test for testing
VITE_ENV=production
```

---

## GitHub Actions Auto-Deploy Setup (5 minutes)

### Add Railway Token to GitHub Secrets
1. Generate Railway token:
   ```powershell
   railway whoami
   # Copy your token from Railway dashboard → Account → Tokens
   ```

2. Add to GitHub:
   - Repo → Settings → Secrets → Actions
   - Click **New repository secret**
   - Name: `RAILWAY_TOKEN`
   - Value: [your-token]

3. Add Railway Project ID:
   ```powershell
   railway status
   # Copy project ID
   ```
   - GitHub secret name: `RAILWAY_PROJECT_ID`
   - Value: [project-id]

4. Add Netlify tokens:
   - Netlify → User Settings → Applications → Personal access tokens
   - Create new token
   - GitHub secret name: `NETLIFY_AUTH_TOKEN`
   - Get site ID: Netlify → Site Settings → Site details → API ID
   - GitHub secret name: `NETLIFY_SITE_ID`

Now every push to `main` auto-deploys backend to Railway and frontend to Netlify!

---

## Testing Checklist

### Backend Tests
```powershell
# Health check
Invoke-RestMethod -Uri "https://fortheweebs-api-production.up.railway.app/v1/health"

# Signup
$body = @{
  email = "test@example.com"
  username = "testuser"
  password = "Test123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://fortheweebs-api-production.up.railway.app/v1/auth/signup" -Method Post -ContentType "application/json" -Body $body

$token = $response.token

# Create post
$headers = @{ Authorization = "Bearer $token" }
$post = @{
  body = "Hello from production!"
  visibility = "PUBLIC"
  isPaid = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://fortheweebs-api-production.up.railway.app/v1/posts" -Method Post -Headers $headers -ContentType "application/json" -Body $post

# Get feed
Invoke-RestMethod -Uri "https://fortheweebs-api-production.up.railway.app/v1/posts/feed" -Method Get -Headers $headers
```

### Frontend Tests
1. Open https://fortheweebs.netlify.app
2. Sign up with owner email: polotuspossumus@gmail.com
3. Create a post with different visibility levels
4. Test Follow/Friend/Subscribe buttons
5. Verify Stripe checkout redirects

---

## Monitoring Setup (5 minutes)

### Railway Logs
```powershell
railway logs --follow
```

### Netlify Deploy Logs
1. Netlify dashboard → Deploys → [latest deploy] → Deploy log

### Sentry Error Tracking (Optional)
1. Create account at https://sentry.io
2. Create two projects: "fortheweebs-backend" and "fortheweebs-frontend"
3. Copy DSN for each
4. Add to Railway and Netlify env vars:
   ```
   SENTRY_DSN=https://xxx@sentry.io/xxx
   VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
   ```

---

## Cost Summary

### Current Setup
- **Supabase**: Free tier (500MB storage, 2GB transfer/month)
- **Railway**: $5/month (includes Redis + backend hosting)
- **Netlify**: Free tier (100GB bandwidth/month)
- **Cloudflare**: Free tier (unlimited bandwidth)
- **Total**: ~$5-10/month

### At Scale (1000+ users)
- **Supabase Pro**: $25/month (8GB storage, PITR backups)
- **Railway**: $20/month (scaled backend)
- **Netlify**: Free tier likely sufficient
- **Total**: ~$45-50/month

---

## What I Need From You

### Immediate (to complete setup):
1. **Supabase Connection String**
   - Go to Supabase → Settings → Database
   - Copy "Connection pooling" string (Transaction mode)
   
2. **Stripe Keys** (test or live):
   - Secret Key (sk_test_xxx or sk_live_xxx)
   - Publishable Key (pk_test_xxx or pk_live_xxx)
   - Price ID for $1000 tier (price_xxx)
   - Create in Stripe dashboard → Products → Add product ($1000 one-time)

3. **Netlify Site Name**:
   - What's your current Netlify URL? (xxx.netlify.app)

### Optional (for custom domain):
4. **Domain Name**: Do you want api.fortheweebs.com or use Railway's subdomain?
5. **VIP List**: Confirm final 10 emails for VIP bypass

---

## Quick Start Commands

### 1. Test Locally with Supabase
```powershell
cd server
# Add your Supabase URL to .env
npx prisma migrate deploy
docker-compose up -d redis
npm run dev
```

### 2. Deploy to Railway
```powershell
npm install -g @railway/cli
railway login
cd server
railway init
railway add redis
railway variables set DATABASE_URL="[supabase-url]"
railway variables set STRIPE_SECRET_KEY="[stripe-key]"
railway up
```

### 3. Update Netlify
```powershell
# Add VITE_API_URL with Railway URL to Netlify env vars
git push origin main  # Auto-deploys
```

---

## Next Steps

Once you provide:
1. ✅ Supabase connection string
2. ✅ Stripe keys
3. ✅ Netlify site name

I'll give you exact copy-paste commands to:
- Connect everything in 5 minutes
- Deploy both backend and frontend
- Test the complete flow
- Go live! 🚀

**Reply with those 3 items and I'll generate your personalized setup script!**
