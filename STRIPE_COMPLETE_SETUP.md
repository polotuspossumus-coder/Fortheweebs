# Stripe Setup - Complete Guide (NO MORE CONFUSION)

## Part 1: Get Stripe Account (5 minutes)

### Step 1: Sign Up
1. Go to https://stripe.com
2. Click "Sign Up" (it's FREE)
3. Use your email
4. Verify email
5. Fill in basic business info (you can skip most of it for testing)

### Step 2: Get Your API Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. You'll see TWO keys:
   - **Publishable key** - Starts with `pk_test_...` (safe to expose)
   - **Secret key** - Click "Reveal" - Starts with `sk_test_...` (NEVER expose)

3. Copy BOTH keys

### Step 3: Add Keys to Your Project

**For Local Development:**

Open your `.env` file and add:
```
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

**For Railway (Production):**

Add these as environment variables in Railway dashboard:
```
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

## Part 2: Create Products & Prices (10 minutes)

### Step 1: Create Products
1. Go to https://dashboard.stripe.com/test/products
2. Click "+ Add Product"

**Product 1: Adult Tier**
- Name: `Adult Tier`
- Description: `Access to adult content`
- Pricing:
  - Model: `Recurring`
  - Price: `$9.99`
  - Billing period: `Monthly`
- Click "Save"
- **COPY THE PRICE ID** (looks like `price_1234abcd...`)

**Product 2: Unlimited Tier**
- Name: `Unlimited Tier`
- Description: `Unlimited access to all features`
- Pricing:
  - Model: `Recurring`
  - Price: `$19.99`
  - Billing period: `Monthly`
- Click "Save"
- **COPY THE PRICE ID**

**Product 3: Super Admin Tier**
- Name: `Super Admin`
- Description: `Full platform access with admin features`
- Pricing:
  - Model: `Recurring`
  - Price: `$49.99`
  - Billing period: `Monthly`
- Click "Save"
- **COPY THE PRICE ID**

### Step 2: Add Price IDs to Your Project

**In `.env` file:**
```
STRIPE_PRICE_ADULT=price_YOUR_ADULT_PRICE_ID
STRIPE_PRICE_UNLIMITED=price_YOUR_UNLIMITED_PRICE_ID
STRIPE_PRICE_SUPER_ADMIN=price_YOUR_SUPER_ADMIN_PRICE_ID
```

**In Railway:**
Add these three variables with your actual price IDs.

## Part 3: Set Up Webhooks (Critical!)

### For Local Development (Testing)

1. Install Stripe CLI:
```bash
npm install -g stripe
```

2. Login to Stripe:
```bash
stripe login
```

3. Forward webhooks to your local server:
```bash
stripe listen --forward-to localhost:3001/api/stripe-webhook
```

4. It will print something like:
```
> Ready! Your webhook signing secret is whsec_1234abcdef...
```

5. Copy that secret and add to `.env`:
```
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

6. Keep that terminal window open while testing!

### For Production (Railway)

1. Get your Railway URL (looks like `https://yourapp.up.railway.app`)

2. Go to https://dashboard.stripe.com/test/webhooks

3. Click "+ Add endpoint"

4. Enter webhook URL:
```
https://your-railway-url.up.railway.app/api/stripe-webhook
```

5. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

6. Click "Add endpoint"

7. Click on your new endpoint

8. Click "Reveal" next to "Signing secret"

9. Copy the secret (looks like `whsec_...`)

10. Add to Railway environment variables:
```
STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_SECRET
```

## Part 4: Testing (DO THIS BEFORE GOING LIVE)

### Test Card Numbers

Stripe provides test cards that simulate different scenarios:

**Successful Payment:**
```
Card: 4242 4242 4242 4242
Expiry: 12/34 (any future date)
CVC: 123 (any 3 digits)
ZIP: 12345 (any 5 digits)
```

**Payment Declined:**
```
Card: 4000 0000 0000 0002
```

**Requires Authentication (3D Secure):**
```
Card: 4000 0025 0000 3155
```

### How to Test

1. Start your local server:
```bash
npm run server
```

2. In another terminal, start Stripe webhook listener:
```bash
stripe listen --forward-to localhost:3001/api/stripe-webhook
```

3. Start your frontend:
```bash
npm run dev
```

4. Try making a test payment
5. Check webhook listener terminal - you should see events coming through
6. Check your app - subscription should activate

## Part 5: Go Live (When Ready)

### Step 1: Activate Your Stripe Account
1. Go to https://dashboard.stripe.com/settings/account
2. Complete business details
3. Add bank account for payouts
4. Complete identity verification

### Step 2: Switch to Live Keys

1. Toggle from "Test mode" to "Live mode" in Stripe dashboard

2. Get live keys from https://dashboard.stripe.com/apikeys:
   - `pk_live_...`
   - `sk_live_...`

3. Update `.env` and Railway with live keys

4. Create live products (same as test but in live mode)

5. Update price IDs with live price IDs

6. Set up live webhook (same process as test but in live mode)

## What Each File Does

**`api/stripe.js`** - Your backend API endpoints:
- Creates checkout sessions
- Verifies payments
- Handles subscription logic

**`src/routes/api/webhooks/stripe.js`** - Webhook handler:
- Listens for Stripe events
- Updates user subscriptions
- Handles payment failures

**`server.js`** - Main server:
- Already configured with webhook endpoint
- Uses raw body parsing for webhook signatures

## Troubleshooting

### "Stripe is not configured"
- Check that env vars are set correctly
- Restart your server after adding env vars
- Verify keys have no extra spaces

### "Webhook signature verification failed"
- Make sure webhook secret is correct
- Check that you're using raw body parsing for webhook route
- Verify the webhook endpoint URL is correct

### "No such price"
- Verify price IDs are correct
- Make sure you're using test price IDs in test mode
- Check for typos in `.env` file

### Payments succeed but subscription doesn't activate
- Check webhook is working (stripe listen shows events)
- Check server logs for errors
- Verify webhook secret is correct

## Stripe Fees

**Test Mode:** FREE (play around all you want)

**Live Mode:**
- 2.9% + $0.30 per successful card charge
- Example: $9.99 subscription = $0.29 + $0.30 = **$0.59 fee**
- You receive: $9.40

## Security Checklist

✅ Never commit `.env` file (already in `.gitignore`)
✅ Never expose secret key in frontend code
✅ Always verify webhook signatures
✅ Use HTTPS in production (Railway does this automatically)
✅ Keep webhook secret secure

## You're Done!

Your Stripe integration is now complete. Test thoroughly in test mode before going live.

**Need help?**
- Stripe docs: https://stripe.com/docs
- Stripe support: https://support.stripe.com
