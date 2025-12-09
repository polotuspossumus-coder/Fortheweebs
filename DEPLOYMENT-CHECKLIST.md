# 🚀 DEPLOYMENT CHECKLIST

Use this before deploying to production!

## Pre-Deployment

### 1. Environment Setup
- [ ] `.env` file configured with production credentials
- [ ] Supabase project set up
- [ ] Google Vision API key active
- [ ] Stripe API keys (live mode)
- [ ] All API keys secured (not in code)

### 2. Code Quality
- [ ] Run `npm run build` successfully
- [ ] No console errors in browser
- [ ] Test all critical flows (signup, login, payment)
- [ ] Mobile responsive checked
- [ ] Cross-browser tested (Chrome, Firefox, Safari)

### 3. Security
- [ ] `.env` NOT committed to git
- [ ] API keys in environment variables only
- [ ] HTTPS enabled on production domain
- [ ] Content moderation active (Google Vision)
- [ ] Rate limiting configured
- [ ] CORS properly configured

### 4. Performance
- [ ] Bundle size optimized (should be ~600KB main)
- [ ] Images optimized/compressed
- [ ] Lazy loading implemented
- [ ] CDN configured (if using)

### 5. Database
- [ ] Supabase project in production mode
- [ ] Database backed up
- [ ] Row Level Security (RLS) policies configured
- [ ] Indexes created for common queries

---

## Deployment Steps

### Option 1: Netlify (Recommended)

1. **Connect Repo**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import existing project"
   - Connect GitHub
   - Select your ForTheWeebs repo

2. **Configure Build**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Add Environment Variables**
   - Site settings → Environment variables
   - Add all variables from `.env`
   - Click "Save"

4. **Deploy**
   - Click "Deploy site"
   - Wait 2-3 minutes
   - Done!

5. **Custom Domain** (Optional)
   - Domain settings → Add custom domain
   - Follow DNS instructions

### Option 2: Vercel

1. Import project from GitHub
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variables
5. Deploy

### Option 3: Manual/VPS

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Upload**
   - Upload `dist/` folder to your server
   - Configure nginx/apache to serve static files

3. **Server Config** (nginx example)
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/fortheweebs/dist;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

---

## Post-Deployment

### 1. Verification
- [ ] Site loads at production URL
- [ ] All images/assets load
- [ ] Signup flow works
- [ ] Login flow works
- [ ] Payment flow works (test mode first!)
- [ ] Content upload works
- [ ] Mobile version works

### 2. Monitoring
- [ ] Set up error tracking (Sentry/LogRocket)
- [ ] Configure uptime monitoring
- [ ] Set up analytics (optional)

### 3. DNS/SSL
- [ ] Custom domain configured
- [ ] SSL certificate active (HTTPS)
- [ ] WWW redirect working
- [ ] DNS propagated (24-48 hours)

### 4. Backup
- [ ] Production database backed up
- [ ] Code pushed to GitHub
- [ ] Environment variables documented securely

---

## Production Environment Variables

Required in production:

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# Google Vision (Content Moderation)
VITE_GOOGLE_VISION_API_KEY=AIzaxxx...

# Stripe (Payments)
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx...
STRIPE_SECRET_KEY=sk_live_xxx...

# OpenAI (AI Features - Optional)
OPENAI_API_KEY=sk-xxx...

# AWS (S3 Storage - Optional)
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
AWS_BUCKET_NAME=fortheweebs-uploads

# Production URL
VITE_APP_URL=https://yourdomain.com
```

---

## Launch Day

### Before Going Live
1. [ ] Send test signup to yourself
2. [ ] Test payment with Stripe test card
3. [ ] Verify email notifications work
4. [ ] Check content moderation catches bad images
5. [ ] Test on mobile device
6. [ ] Have rollback plan ready

### Go Live
1. [ ] Switch Stripe to live mode
2. [ ] Update environment variables
3. [ ] Redeploy
4. [ ] Monitor for 1 hour
5. [ ] Fix any issues immediately

### After Launch
1. [ ] Monitor error logs
2. [ ] Watch server performance
3. [ ] Check user signups
4. [ ] Respond to support requests
5. [ ] Celebrate! 🎉

---

## Rollback Plan

If something goes wrong:

### Quick Rollback
```bash
# On Netlify/Vercel
Go to Deploys → Find last working deploy → Click "Publish deploy"
```

### Emergency Rollback
```bash
node scripts/emergency-rollback.js
# Choose option 3: Restore from GitHub backup
```

### Database Rollback
```bash
# Restore from Supabase dashboard
# Database → Backups → Restore
```

---

## Performance Benchmarks

Your site should achieve:
- ✅ **Lighthouse Score**: 90+ (all categories)
- ✅ **First Contentful Paint**: < 1.5s
- ✅ **Time to Interactive**: < 3.5s
- ✅ **Largest Contentful Paint**: < 2.5s
- ✅ **Bundle Size**: ~600KB (main)

---

## Common Issues & Fixes

### Issue: Build Fails on Netlify
**Fix**: Check Node version (should be 18+)
```toml
# netlify.toml
[build.environment]
  NODE_VERSION = "18"
```

### Issue: Environment Variables Not Working
**Fix**: Redeploy after adding env vars
- Netlify: Trigger deploy → Deploy site

### Issue: 404 on Page Refresh
**Fix**: Add redirect rule
```
# public/_redirects
/*    /index.html   200
```

### Issue: CORS Errors
**Fix**: Configure Supabase CORS in project settings

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] `.env` not in git history
- [ ] API keys rotated from dev keys
- [ ] Content moderation active
- [ ] Rate limiting enabled
- [ ] SQL injection protected (Supabase RLS)
- [ ] XSS protected (React escapes by default)
- [ ] CSRF tokens (if using custom forms)

---

## Legal Compliance

- [ ] Terms of Service accessible
- [ ] Privacy Policy accessible
- [ ] Cookie consent (if EU users)
- [ ] 2257 compliance (adult content)
- [ ] DMCA agent registered
- [ ] Age verification working

---

## Support Checklist

- [ ] Support email configured
- [ ] Bug reporting system active
- [ ] User documentation published
- [ ] FAQ page created
- [ ] Contact form working

---

## 🎯 Ready to Deploy?

Go through each checkbox. When all are checked, you're ready!

**Remember**: You can always rollback if needed. You have:
- Git history
- GitHub backup branches
- D: drive backups
- Netlify/Vercel previous deploys

**You got this! 🚀**
