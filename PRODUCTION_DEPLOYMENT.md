# 🚀 Production Deployment Guide

Complete guide to deploy ForTheWeebs to production with full backend infrastructure.

## 📋 Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All features tested locally
- [ ] No console errors in browser
- [ ] All API endpoints working
- [ ] Payment flow tested with Stripe test cards
- [ ] AI Bug Fixer tested with real screenshots
- [ ] Multi-currency conversion working
- [ ] Multi-language translation working
- [ ] Mobile responsive design verified

### ✅ Environment Configuration
- [ ] `.env` file configured with all API keys
- [ ] Supabase database schema executed
- [ ] Stripe webhook configured
- [ ] GitHub token has proper permissions
- [ ] OpenAI API key working with GPT-4

### ✅ Security
- [ ] `.env` file in `.gitignore`
- [ ] No API keys in source code
- [ ] CORS properly configured
- [ ] Rate limiting enabled (if needed)
- [ ] Webhook signatures verified

## 🌐 Deploy Frontend (Netlify)

### Already Configured ✅
Your frontend is already set up to auto-deploy on Netlify!

### Verify Netlify Configuration

1. **Go to Netlify Dashboard**:
   - https://app.netlify.com/

2. **Check Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

3. **Configure Environment Variables**:
   Go to: **Site settings → Environment variables**
   
   Add these variables:
   ```
   # Stripe
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_key
   
   # Supabase
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_production_anon_key
   
   # API
   VITE_API_URL=https://your-backend.railway.app/api
   VITE_APP_URL=https://your-domain.netlify.app
   
   # Firebase (if using)
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # Environment
   NODE_ENV=production
   ```

4. **Trigger Deploy**:
   - Push to GitHub main branch
   - Netlify auto-deploys in ~2 minutes

5. **Custom Domain (Optional)**:
   - Go to **Domain settings**
   - Add custom domain: `www.fortheweebs.com`
   - Configure DNS records
   - SSL certificate auto-generated

## 🖥️ Deploy Backend (Railway)

### Option 1: Railway (Recommended - $5/month)

1. **Sign Up**: https://railway.app/
   - Login with GitHub

2. **Create New Project**:
   - Click **New Project**
   - Select **Deploy from GitHub repo**
   - Choose `Fortheweebs` repository

3. **Configure Build**:
   Railway auto-detects Node.js. If needed, set:
   - Build command: `npm install`
   - Start command: `npm run server`
   - Root directory: `/`

4. **Add Environment Variables**:
   Click **Variables** tab:
   ```
   # Node
   NODE_ENV=production
   PORT=3001
   
   # Stripe
   STRIPE_SECRET_KEY=sk_live_your_production_key
   STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_key
   
   # OpenAI
   OPENAI_API_KEY=sk-proj-your_openai_key
   
   # GitHub
   GITHUB_TOKEN=ghp_your_github_token
   GITHUB_REPO_OWNER=polotuspossumus-coder
   GITHUB_REPO_NAME=Fortheweebs
   
   # Supabase
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # URLs
   VITE_API_URL=https://your-backend.railway.app/api
   VITE_APP_URL=https://your-domain.netlify.app
   ```

5. **Deploy**:
   - Click **Deploy**
   - Wait ~3 minutes for first deploy
   - Get your URL: `https://fortheweebs-production.up.railway.app`

6. **Custom Domain (Optional)**:
   - Go to **Settings → Domains**
   - Add custom domain: `api.fortheweebs.com`
   - Configure DNS CNAME record

### Option 2: Render (Free Tier Available)

1. **Sign Up**: https://render.com/
   - Login with GitHub

2. **Create Web Service**:
   - Click **New +** → **Web Service**
   - Connect GitHub repo: `Fortheweebs`

3. **Configure**:
   - Name: `fortheweebs-backend`
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `npm run server`
   - Plan: Free (or Starter $7/month)

4. **Environment Variables**:
   Same as Railway above

5. **Deploy**:
   - Click **Create Web Service**
   - Get URL: `https://fortheweebs-backend.onrender.com`

### Option 3: Heroku ($7/month)

1. **Sign Up**: https://heroku.com/
   
2. **Install Heroku CLI**:
   ```powershell
   # Download from: https://devcenter.heroku.com/articles/heroku-cli
   ```

3. **Deploy**:
   ```powershell
   heroku login
   heroku create fortheweebs-backend
   
   # Add environment variables
   heroku config:set NODE_ENV=production
   heroku config:set STRIPE_SECRET_KEY=sk_live_...
   # ... (add all env vars)
   
   git push heroku main
   ```

## 🗄️ Deploy Database (Supabase)

### Already Set Up! ✅
Your Supabase database is ready. Just verify:

1. **Production Configuration**:
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to **Settings → API**
   - Verify using production keys in .env

2. **Enable Row Level Security** (already configured):
   - Go to **Authentication → Policies**
   - Verify RLS policies active on all tables

3. **Set Up Backups**:
   - Go to **Database → Backups**
   - Free tier: Daily backups (7 days retention)
   - Pro tier: Point-in-time recovery

4. **Monitor Usage**:
   - Free tier: 500MB database, 2GB bandwidth
   - Upgrade if needed: $25/month Pro tier

## 🔗 Configure Production Stripe Webhook

### Critical: Switch to Live Mode

1. **Stripe Dashboard**: https://dashboard.stripe.com/
   - Toggle **Viewing test data** → **OFF** (top left)

2. **Get Live API Keys**:
   - Go to **Developers → API keys**
   - Copy **Publishable key** (starts with `pk_live_`)
   - Copy **Secret key** (starts with `sk_live_`)
   - Update in Netlify and Railway environment variables

3. **Create Production Webhook**:
   - Go to **Developers → Webhooks**
   - Click **Add endpoint**
   - Endpoint URL: `https://your-backend.railway.app/api/stripe-webhook`
   - Select events:
     * `checkout.session.completed`
     * `checkout.session.expired`
     * `payment_intent.payment_failed`
   - Click **Add endpoint**

4. **Get Webhook Secret**:
   - Click on your new webhook
   - Click **Reveal** under **Signing secret**
   - Copy webhook secret (starts with `whsec_`)
   - Add to Railway environment variables:
     ```
     STRIPE_WEBHOOK_SECRET=whsec_your_production_secret
     ```

5. **Test Webhook**:
   - Stripe Dashboard → **Webhooks** → Your endpoint
   - Click **Send test webhook**
   - Select `checkout.session.completed`
   - Verify 200 OK response

## 🧪 Production Testing

### Test Payment Flow
1. Use **real credit card** (you can refund after testing)
2. Go to your production site
3. Click **Become a Creator** ($500)
4. Complete payment
5. Verify:
   - Redirect to success page
   - Payment appears in Stripe dashboard
   - User tier updated in Supabase
   - Confirmation email sent (if configured)
6. **Refund** the test payment in Stripe dashboard

### Test AI Bug Fixer
1. Go to Dashboard → 🐛 **Report Bug**
2. Upload screenshot
3. Submit bug report
4. Verify:
   - AI analysis returns
   - Code fix generates
   - GitHub PR created
   - PR link works
5. Check OpenAI usage: https://platform.openai.com/usage
6. Check GitHub for PR

### Test Multi-Currency
1. Change currency to EUR/GBP/JPY
2. Verify prices convert correctly
3. Complete test payment
4. Verify you receive USD in Stripe

### Test Multi-Language
1. Switch to different languages
2. Verify translations load
3. Test RTL languages (Arabic, Hebrew)
4. Verify all UI elements translate

## 📊 Monitoring & Analytics

### Set Up Error Tracking (Sentry)
```powershell
npm install @sentry/react
```

Add to `src/main.jsx`:
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your_sentry_dsn",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

### Set Up Analytics (Google Analytics)
Add to `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Monitor API Costs

**OpenAI Usage**:
- Dashboard: https://platform.openai.com/usage
- Set spending limits: https://platform.openai.com/account/limits
- Estimated: $5-20/month with normal usage

**Railway Costs**:
- Dashboard: https://railway.app/account/usage
- $5/month credit included
- ~$5-10/month for backend hosting

**Supabase Usage**:
- Dashboard: https://supabase.com/dashboard/project/_/settings/billing
- Free tier: 500MB database, 2GB bandwidth
- Upgrade if needed: $25/month

## 🔒 Security Best Practices

### SSL/HTTPS ✅
- Netlify: Auto-configured
- Railway: Auto-configured
- Supabase: Always HTTPS

### Environment Variables ✅
- Never commit `.env` file
- Use platform-specific env var management
- Rotate keys regularly

### CORS Configuration ✅
Already configured in `server.js`:
```javascript
app.use(cors({
  origin: process.env.VITE_APP_URL,
  credentials: true
}));
```

### Rate Limiting (Optional)
Add to `server.js`:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 🚨 Troubleshooting

### Frontend not loading
- Check Netlify deploy logs
- Verify environment variables set
- Check browser console for errors
- Verify VITE_API_URL points to backend

### Backend errors
- Check Railway logs: `railway logs`
- Verify all environment variables set
- Test health endpoint: `curl https://your-backend.railway.app/health`
- Check for CORS errors

### Stripe webhook failing
- Verify webhook URL is correct
- Check webhook signing secret matches
- View webhook logs in Stripe dashboard
- Ensure endpoint returns 200 status

### OpenAI API errors
- Check API key is valid
- Verify payment method on file
- Check usage limits not exceeded
- Review error message in logs

### GitHub PR creation failing
- Verify token has `repo` scope
- Check GITHUB_REPO_OWNER and GITHUB_REPO_NAME correct
- Ensure token not expired
- Check rate limits: https://docs.github.com/en/rest/rate-limit

## 📈 Scaling Considerations

### When to Upgrade

**Database (Supabase)**:
- Upgrade to Pro ($25/month) when:
  * Database > 500MB
  * Bandwidth > 2GB/month
  * Need point-in-time recovery

**Backend (Railway)**:
- Upgrade plan when:
  * Traffic > 100,000 requests/month
  * Need > 512MB RAM
  * Response times slow

**OpenAI**:
- Monitor costs closely
- Consider caching common analyses
- Implement rate limiting for users

### Performance Optimization

**Frontend**:
- Images already optimized
- Code splitting configured
- Terser minification enabled
- CSS code splitting active

**Backend**:
- Add Redis caching for frequent queries
- Use connection pooling for Supabase
- Implement request queuing for AI calls
- Add CDN for static assets

## 🎉 Go Live Checklist

### Final Steps
- [ ] Frontend deployed to Netlify
- [ ] Backend deployed to Railway/Render/Heroku
- [ ] Database verified on Supabase
- [ ] Production Stripe keys configured
- [ ] Production webhook configured and tested
- [ ] Test payment completed and refunded
- [ ] AI Bug Fixer tested in production
- [ ] Multi-currency tested
- [ ] Multi-language tested
- [ ] Custom domain configured (optional)
- [ ] SSL certificates verified
- [ ] Error tracking set up (Sentry)
- [ ] Analytics configured (Google Analytics)
- [ ] Monitoring alerts configured
- [ ] Backup strategy verified
- [ ] Documentation updated
- [ ] Team notified

### Launch Announcement

Once everything is verified, announce your launch:

1. **Social Media**:
   - Twitter/X: "🚀 ForTheWeebs is live!"
   - Discord: Share with creator communities
   - Reddit: r/webdev, r/entrepreneurship

2. **Email List**:
   - Announce to early adopters
   - Offer launch discount (optional)

3. **Product Hunt** (optional):
   - Submit for visibility: https://www.producthunt.com/

## 💰 Pricing Summary

### Monthly Costs (Expected)

**Free Tier**:
- Netlify: $0 (frontend)
- Railway: $5 credit → ~$5-10 actual cost
- Supabase: $0 (up to 500MB)
- GitHub: $0
- Stripe: $0 + 2.9% + 30¢ per transaction

**Pay-Per-Use**:
- OpenAI: ~$10-30/month (light usage)

**Total**: ~$15-40/month

### Revenue Potential
- Creator Tier: $500/user
- Super Admin Tier: $1000/user
- **Break even**: 1 Creator signup/month
- **Profitable**: 2+ signups/month

## 📞 Support

### Useful Resources
- Netlify Docs: https://docs.netlify.com/
- Railway Docs: https://docs.railway.app/
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- OpenAI Docs: https://platform.openai.com/docs

### Need Help?
- GitHub Issues: https://github.com/polotuspossumus-coder/Fortheweebs/issues
- Stripe Support: https://support.stripe.com/
- Supabase Discord: https://discord.supabase.com/
- Railway Discord: https://discord.gg/railway

---

**Status**: Production Ready 🚀
**Last Updated**: November 2025
**Version**: 1.0.0

**You're ready to launch! 🎉**
