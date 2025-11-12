# 🚀 ForTheWeebs API Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then fill in your API keys (see sections below for how to get each key).

### 3. Set Up Database (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings → API
4. Copy your:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
5. Go to SQL Editor
6. Run the schema from `database/schema.sql`

### 4. Set Up Stripe Payments

1. Go to [stripe.com](https://stripe.com) and create account
2. Get test keys from Dashboard → Developers → API keys
3. Copy:
   - Publishable key → `VITE_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
4. Set up webhook:
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe-webhook`
   - Select events: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`
   - Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

### 5. Set Up OpenAI API (for AI Bug Fixer)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account and add payment method
3. Go to API keys
4. Create new key → `OPENAI_API_KEY`

**Models needed:**
- `gpt-4-vision-preview` (for screenshot analysis)
- `gpt-4-turbo-preview` (for code generation)

### 6. Set Up GitHub Token (for automated PRs)

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes:
   - `repo` (full control)
   - `workflow` (if using GitHub Actions)
4. Copy token → `GITHUB_TOKEN`
5. Set repo info:
   - `GITHUB_REPO_OWNER=polotuspossumus-coder`
   - `GITHUB_REPO_NAME=Fortheweebs`

### 7. Run the Application

**Option 1: Run both frontend and backend together**
```bash
npm run dev:all
```

**Option 2: Run separately**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend API
npm run dev:server
```

Your app will be running at:
- Frontend: http://localhost:3002
- Backend API: http://localhost:3001

---

## 📋 Complete Environment Variables

```bash
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-...

# GitHub
GITHUB_TOKEN=ghp_...
GITHUB_REPO_OWNER=polotuspossumus-coder
GITHUB_REPO_NAME=Fortheweebs

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# App Config
VITE_APP_URL=http://localhost:3002
VITE_API_URL=http://localhost:3001/api
NODE_ENV=development
```

---

## 🧪 Testing the APIs

### Test Payment Flow

1. Go to http://localhost:3002
2. Click payment tier
3. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

### Test AI Bug Fixer

1. Go to Dashboard → 🐛 Report Bug
2. Upload screenshot or capture one
3. Fill in bug description
4. Submit
5. AI will analyze and generate fix
6. Check GitHub for auto-created PR

---

## 🚀 Production Deployment

### Deploy to Netlify

1. Push code to GitHub
2. Netlify auto-deploys frontend
3. For backend API, add to `netlify.toml`:

```toml
[functions]
  directory = "api"
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Or Deploy Backend Separately

Deploy backend to:
- Railway.app
- Render.com
- Heroku
- DigitalOcean App Platform

Then update `VITE_API_URL` to your deployed backend URL.

---

## 💡 Optional Services

### Email Notifications (SendGrid)
```bash
SENDGRID_API_KEY=SG...
EMAIL_FROM=noreply@fortheweebs.com
```

### Crypto Payments (Coinbase Commerce)
```bash
COINBASE_COMMERCE_API_KEY=...
```

### Analytics (Google Analytics)
```bash
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

---

## 🔒 Security Notes

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use test keys in development** - Switch to live keys in production
3. **Rotate keys regularly** - Especially after team changes
4. **Use environment-specific configs** - Different keys for dev/staging/prod

---

## 📚 API Endpoints

### Stripe Payments
- `POST /api/create-checkout-session` - Create payment session
- `POST /api/stripe-webhook` - Stripe webhook handler
- `GET /api/user/:userId/tier` - Get user tier
- `GET /api/user/:userId/payments` - Get payment history

### AI Bug Fixer
- `POST /api/ai/analyze-screenshot` - Analyze bug screenshot
- `POST /api/ai/generate-fix` - Generate code fix
- `POST /api/ai/create-pr` - Create GitHub PR with fix
- `GET /api/ai/bug/:reportId/status` - Get bug fix status

---

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### Stripe webhook not receiving events
- Use Stripe CLI for local testing:
```bash
stripe listen --forward-to localhost:3001/api/stripe-webhook
```

### OpenAI rate limit errors
- Add payment method to OpenAI account
- Increase rate limits in OpenAI dashboard

### Supabase connection errors
- Check URL and keys are correct
- Verify database schema is applied
- Check RLS policies allow access

---

## 📞 Need Help?

Check the logs:
- Backend: Check terminal running `npm run dev:server`
- Frontend: Check browser console
- Stripe: Check Dashboard → Developers → Logs
- Supabase: Check project logs in dashboard

---

**Your platform is now ready for production! 🎉**
