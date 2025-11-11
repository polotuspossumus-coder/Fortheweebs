# Super Simple Setup Instructions 🎯

## Step 1: Setup Supabase Database (5 minutes)

1. Go to: <https://supabase.com/dashboard>
2. Click on your project: **polotuspossumus-coder's Project**
3. Look on the left side menu
4. Click the **SQL Editor** icon (looks like a database)
5. Click the **"New query"** button (top right, green button)
6. Open the file: `supabase-setup.sql` (it's in your project folder)
7. Copy EVERYTHING from that file
8. Paste it into the SQL Editor on Supabase
9. Click the **"Run"** button (bottom right)
10. You should see "Success. No rows returned"

✅ **Done!** Your database is ready.

---

## Step 2: Setup Stripe Webhook (5 minutes)

### What this does

When someone pays you, Stripe tells your website automatically.

### Instructions

1. Go to: <https://dashboard.stripe.com/test/webhooks>
2. Click **"Add endpoint"** button
3. In the box that says "Endpoint URL", type:

   ```
   https://fortheweebs.netlify.app/.netlify/functions/stripe-webhook
   ```

4. Click **"Select events"**
5. Find and check these boxes:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **"Add events"** button
7. Click **"Add endpoint"** button at the bottom
8. You'll see a new webhook listed
9. Click on it
10. Click **"Reveal"** next to "Signing secret"
11. Copy that secret (starts with `whsec_`)
12. Come back here and paste it in the chat

---

## Step 3: Create Stripe Products (5 minutes)

### Instructions

1. Go to: <https://dashboard.stripe.com/test/products>
2. Click **"Add product"** button
3. Fill in:
   - **Name**: VIP Membership
   - **Description**: Full access to all creator tools
   - **Price**: 9.99
   - **Billing period**: Monthly
4. Click **"Save product"**
5. You'll see a Price ID (starts with `price_`)
6. Copy that Price ID
7. Come back here and paste it in the chat

---

## Step 4: Test Your Site

1. Go to: <https://fortheweebs.netlify.app>
2. Click **"Launch Dashboard"**
3. Accept the terms
4. Create an account
5. Try clicking on the creator tools
6. Everything should work!

---

## What if something breaks?

Tell me what happened and I'll fix it. Use simple words like:

- "I clicked X and nothing happened"
- "I see an error that says..."
- "The page is blank"

---

## Your Site URLs

- **Live Site**: <https://fortheweebs.netlify.app>
- **Stripe Dashboard**: <https://dashboard.stripe.com>
- **Supabase Dashboard**: <https://supabase.com/dashboard>
- **Netlify Dashboard**: <https://app.netlify.com/projects/fortheweebs>

---

## Summary

✅ Site is live
✅ Environment variables set
✅ Database script ready
⏳ Need to run database script (Step 1)
⏳ Need to setup webhook (Step 2)
⏳ Need to create products (Step 3)
