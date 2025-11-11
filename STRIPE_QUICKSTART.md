# 🚀 Quick Start - Enable Stripe Payments

## ⚡ 5-Minute Setup

### 1. Get Stripe Keys (2 minutes)
```
1. Go to: https://dashboard.stripe.com/register
2. Sign up (free, no credit card needed)
3. Click: Developers → API keys
4. Copy both keys
```

### 2. Add to Project (1 minute)

Create `.env` file in project root:
```bash
VITE_STRIPE_PUBLIC_KEY=pk_test_51abc123...
STRIPE_SECRET_KEY=sk_test_51xyz789...
```

### 3. Restart Server (30 seconds)
```bash
npm run dev
```

### 4. Test It! (1 minute)
1. Open http://localhost:3001/?app=true
2. Go to Premium tab
3. Click "💳 Pay with Card"
4. Use test card: `4242 4242 4242 4242`
5. Any expiry/CVC/ZIP
6. Should unlock! 🎉

## ✅ That's It!

**Balance payments work now** (no Stripe needed)  
**Card payments work after** adding keys above

## 📋 For Netlify Deployment

Add same keys to Netlify:
1. Netlify Dashboard → Site settings
2. Environment variables → Add variables
3. Add both keys (same names as .env)
4. Redeploy site

## 🎯 Next Steps

- Test with test cards (see STRIPE_SETUP.md)
- Switch to live keys when ready ($$$)
- Set up database (replace localStorage)
- Add Stripe webhooks for reliability

**Read full guide:** [STRIPE_SETUP.md](./STRIPE_SETUP.md)
