# Stripe Integration Setup Guide

## ✅ What's Done
- ✅ Stripe libraries installed (`@stripe/stripe-js`, `stripe`)
- ✅ Backend API endpoints created:
  - `/api/create-unlock-payment` - Creates payment intent
  - `/api/verify-unlock-payment` - Verifies payment and unlocks tool
- ✅ Frontend updated to process card payments
- ✅ Graceful fallback if Stripe not configured

## 🔑 Get Your Stripe API Keys

### 1. Create Stripe Account
Go to https://stripe.com and sign up (free)

### 2. Get API Keys
1. Go to Dashboard → Developers → API keys
2. Copy your keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

### 3. Add Keys to Project

#### For Local Development:
Create `.env` file in project root:
```bash
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
```

#### For Netlify Production:
1. Go to Netlify Dashboard
2. Site settings → Environment variables
3. Add both keys:
   - `VITE_STRIPE_PUBLIC_KEY` = `pk_test_...`
   - `STRIPE_SECRET_KEY` = `sk_test_...`

### 4. Restart Dev Server
```bash
npm run dev
```

## 🎯 How It Works

### Balance Payment (Works Now):
1. User earns money → balance increases
2. Click "Pay from Balance" → deducts balance
3. Tool unlocks immediately

### Card Payment (After Stripe Setup):
1. Click "Pay with Card"
2. Stripe payment UI appears
3. User enters card details
4. Payment processes
5. Tool unlocks on success

## 🧪 Test with Stripe

### Test Card Numbers:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`
- Use any future expiry date (12/25)
- Use any 3-digit CVC (123)
- Use any ZIP (12345)

## 📝 What Happens Without Stripe

If keys not set:
- Balance payment works 100%
- Card payment shows: "Stripe not configured yet"
- Users can still earn → unlock with balance
- No errors, graceful fallback

## 🚀 Go Live Checklist

When ready for real payments:
1. ✅ Add Stripe keys (see above)
2. ✅ Test with test cards
3. Switch to **live keys**:
   - Dashboard → View test data → Toggle to LIVE
   - Use live keys: `pk_live_...` and `sk_live_...`
4. Replace localStorage with database (Supabase/Firebase)
5. Set up webhook for payment confirmations

## 💰 Stripe Fees
- **2.9% + $0.30** per transaction
- Example: $25 unlock = $0.73 + $0.30 = **$1.03 fee** (you get $23.97)
- $500 unlock = $14.50 + $0.30 = **$14.80 fee** (you get $485.20)

## 🔒 Security Notes
- Never commit `.env` file (already in .gitignore)
- Use test keys in development
- Use live keys only in production
- Webhook secret protects against fake payment events

## ❓ Issues?
If card payments don't work:
1. Check browser console for errors
2. Verify keys are correct (no extra spaces)
3. Make sure dev server restarted after adding keys
4. Try balance payment first to verify unlock logic works
