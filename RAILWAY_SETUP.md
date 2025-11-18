# Railway Deployment Setup - DO THIS NOW

## Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub (easiest)

## Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your `fortheweebs` repository
4. Railway will auto-detect Node.js

## Step 3: Add Environment Variables

Go to your project → Variables tab and add ALL of these:

### Required for Basic Functionality
```
NODE_ENV=production
PORT=3001
```

### Stripe (GET THESE FROM STRIPE DASHBOARD)
```
VITE_STRIPE_PUBLIC_KEY=pk_live_YOUR_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

### Stripe Price IDs (Create products in Stripe first)
```
STRIPE_PRICE_ADULT=price_YOUR_ADULT_PRICE_ID
STRIPE_PRICE_UNLIMITED=price_YOUR_UNLIMITED_PRICE_ID
STRIPE_PRICE_SUPER_ADMIN=price_YOUR_SUPER_ADMIN_PRICE_ID
```

### Supabase
```
VITE_SUPABASE_URL=https://iqipomerawkvtobjtvom.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

### OpenAI (for AI features)
```
OPENAI_API_KEY=sk-proj-YOUR_KEY
```

### GitHub (for issue tracking)
```
GITHUB_TOKEN=ghp_YOUR_TOKEN
GITHUB_REPO_OWNER=polotuspossumus-coder
GITHUB_REPO_NAME=Fortheweebs
```

### App URLs (Update after Railway gives you a domain)
```
VITE_APP_URL=https://your-app.up.railway.app
VITE_API_URL=https://your-api.up.railway.app/api
```

## Step 4: Deploy
1. Click "Deploy" (or it auto-deploys)
2. Wait 2-3 minutes
3. Railway will give you a URL like `https://fortheweebs-production.up.railway.app`

## Step 5: Set Up Custom Domain (Optional)
1. Settings → Domains
2. Add your custom domain
3. Point your DNS to Railway

## Step 6: Configure Stripe Webhook
1. Copy your Railway URL
2. Go to Stripe Dashboard → Webhooks
3. Add endpoint: `https://your-railway-url.up.railway.app/api/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret
6. Add to Railway env vars as `STRIPE_WEBHOOK_SECRET`

## Troubleshooting

### Build Failed?
- Check logs in Railway dashboard
- Make sure all required env vars are set
- Verify `package.json` has all dependencies

### Server Not Starting?
- Check Railway logs for errors
- Verify PORT is set to 3001
- Make sure `server.js` exists

### API Not Working?
- Check CORS settings in `server.js`
- Verify `VITE_APP_URL` matches your frontend URL
- Check Railway logs for 500 errors

## Cost
- Railway gives you $5/month free credit
- After that, ~$5-20/month depending on usage
- You can set spending limits

## That's It!
Your backend is now live on Railway. Next: Set up Stripe properly.
