# Stripe Webhook Setup Guide

## What This Does
Webhooks automatically update user tiers when they complete a payment. Without this, users pay but don't get access!

## Setup Steps (5 minutes)

### 1. Get Your Webhook Endpoint URL

**For Local Development:**
- Install Stripe CLI: https://stripe.com/docs/stripe-cli
- Run: `stripe listen --forward-to localhost:3001/api/stripe-webhook`
- Copy the webhook signing secret that appears (starts with `whsec_`)

**For Production:**
- Your webhook URL will be: `https://yourdomain.com/api/stripe-webhook`

### 2. Add Webhook to Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   - Local: Use Stripe CLI forwarding URL
   - Production: `https://yourdomain.com/api/stripe-webhook`
4. Click **"Select events"**
5. Add these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.deleted`
   - ✅ `customer.subscription.updated`
   - ✅ `checkout.session.expired`
   - ✅ `payment_intent.payment_failed`
6. Click **"Add endpoint"**

### 3. Add Webhook Secret to .env

Copy the webhook signing secret and add it to your `.env` file:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

### 4. Restart Your Server

```bash
npm run dev
```

## Testing

1. Make a test payment in Stripe test mode
2. Check your server logs - you should see:
   ```
   ✅ Payment successful for user [userId], tier: [tier]
   ✅ Successfully updated tier for user [userId] to [tier]
   ```
3. Verify the user's tier was updated in Supabase

## Troubleshooting

**Webhook not working?**
- Check server logs for errors
- Verify webhook secret is correct
- Make sure endpoint URL is accessible
- Check Stripe Dashboard > Webhooks for failed attempts

**User paid but didn't get access?**
- Check Stripe Dashboard > Webhooks > Recent events
- Look for errors in webhook delivery
- Manually update user tier in Supabase as temporary fix

## Enable Crypto Payments in Stripe

1. Go to: https://dashboard.stripe.com/settings/payment_methods
2. Scroll to **"Cryptocurrencies"**
3. Enable:
   - ✅ Bitcoin (BTC)
   - ✅ Ethereum (ETH)
   - ✅ USD Coin (USDC)
4. Click **"Save"**

Done! Users can now pay with crypto at checkout.

## What's Already Done ✅

- ✅ Payment tables created in Supabase
- ✅ Stripe API keys configured
- ✅ Payment endpoints ready
- ✅ Webhook handler code written
- ✅ Crypto payment support added to checkout
- ✅ Security challenge component created

## What You Need To Do

1. **Add webhook to Stripe Dashboard** (see steps above)
2. **Add `STRIPE_WEBHOOK_SECRET` to .env**
3. **Enable crypto in Stripe Dashboard** (optional but recommended)
4. **Test a payment** to verify everything works

That's it! Your payment system is ready to go. 🎉
