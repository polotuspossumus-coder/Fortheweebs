# 🔑 How to Get Your Stripe Price IDs

Quick 5-minute guide to finding your Stripe price IDs.

---

## 📍 Step 1: Go to Stripe Dashboard

### Option A: Direct Link
1. Go to: **https://dashboard.stripe.com/products**
2. Log in if needed

### Option B: From Stripe Homepage
1. Go to **https://stripe.com**
2. Click **"Sign in"** (top right)
3. Click **"Products"** in left sidebar
4. OR click **"More +"** → **"Product catalog"**

---

## 🏗️ Step 2: Create Your Products

### Create 6 Products (one for each tier):

#### Product 1: Sovereign ($1000/month)
1. Click **"+ Add product"** button
2. Fill in:
   ```
   Name: Sovereign Tier
   Description: Full platform access + Super Admin + VIP (Limited to 1000 users)
   ```
3. Under **Pricing**:
   - **Price**: `1000.00`
   - **Billing period**: `Monthly`
   - **Currency**: `USD`
4. Click **"Add pricing"**
5. Click **"Save product"**
6. ✅ **Copy the price ID** (looks like `price_1ABC123xyz...`)

#### Product 2: Full Unlock Monthly ($500/month)
```
Name: Full Unlock (Monthly)
Description: All features except Super Admin powers
Price: 500.00
Billing: Monthly
Currency: USD
```
→ Copy price ID

#### Product 3: Full Unlock Lifetime ($500 one-time)
```
Name: Full Unlock (Lifetime)
Description: One-time payment for lifetime access
Price: 500.00
Billing: One time  ← IMPORTANT!
Currency: USD
```
→ Copy price ID

#### Product 4: Half Unlock ($250/month)
```
Name: Half Unlock
Description: 50% of platform features
Price: 250.00
Billing: Monthly
Currency: USD
```
→ Copy price ID

#### Product 5: Advanced ($100/month)
```
Name: Advanced Tier
Description: Advanced tool set
Price: 100.00
Billing: Monthly
Currency: USD
```
→ Copy price ID

#### Product 6: Basic ($50/month)
```
Name: Basic Tier
Description: Basic tool set
Price: 50.00
Billing: Monthly
Currency: USD
```
→ Copy price ID

#### Product 7: Starter ($5/month)
```
Name: Starter Tier
Description: Entry-level access
Price: 5.00
Billing: Monthly
Currency: USD
```
→ Copy price ID

**Note**: Setup fee ($15) is added dynamically in code, not in Stripe.

---

## 📋 Step 3: Find Your Price IDs

### Method 1: From Product Page
1. Click on a product name
2. Look for **"Pricing"** section
3. You'll see the price with an ID like: `price_1ABC123xyz...`
4. Click the **copy icon** next to the ID

### Method 2: From API Keys Page
1. Go to **Developers** → **API keys**
2. Scroll down to **"Restricted keys"**
3. Click **"View test data"** toggle (top right) to see test vs live IDs

### Method 3: Using Stripe CLI (Advanced)
```bash
# Install Stripe CLI first
stripe products list
stripe prices list
```

---

## 💾 Step 4: Add to Your Environment Variables

### Local Development (`.env` file):
```env
# Stripe Price IDs
STRIPE_PRICE_SOVEREIGN=price_1ABC123xyz...
STRIPE_PRICE_FULL_MONTHLY=price_1DEF456xyz...
STRIPE_PRICE_FULL_LIFETIME=price_1GHI789xyz...
STRIPE_PRICE_HALF=price_1JKL012xyz...
STRIPE_PRICE_ADVANCED=price_1MNO345xyz...
STRIPE_PRICE_BASIC=price_1PQR678xyz...
STRIPE_PRICE_STARTER=price_1STU901xyz...
```

### Railway (Production):
1. Go to Railway dashboard
2. Click your project
3. Click **"Variables"** tab
4. Click **"+ New Variable"**
5. Add each price ID:
   ```
   STRIPE_PRICE_SOVEREIGN = price_1ABC...
   STRIPE_PRICE_FULL_MONTHLY = price_1DEF...
   (etc)
   ```

### Netlify (Frontend):
1. Go to Netlify dashboard
2. Click your site
3. Go to **"Site settings"** → **"Environment variables"**
4. Click **"Add a variable"**
5. Add same variables as above

---

## 🧪 Step 5: Test vs Live Mode

### Stripe has TWO modes:

**Test Mode** (for development):
- Price IDs start with `price_test_...`
- Use test cards: `4242 4242 4242 4242`
- No real money charged

**Live Mode** (for production):
- Price IDs start with `price_live_...` or just `price_...`
- Real credit cards
- Real money charged

### Switch Modes:
1. In Stripe dashboard, look for toggle in top left
2. **"Viewing test data"** = Test mode
3. **"Viewing live data"** = Live mode

### Important:
- Create products in **BOTH** modes
- Use **test price IDs** during development
- Use **live price IDs** in production

---

## 🔍 Quick Reference: Where Are My Price IDs?

```
Stripe Dashboard → Products → [Click Product] → Pricing section → Copy ID

Example:
┌─────────────────────────────────────────┐
│ Sovereign Tier                          │
│ $1,000.00 / month                       │
│                                         │
│ price_1QRzABCxyz123  [📋 Copy]        │
└─────────────────────────────────────────┘
```

---

## ⚠️ Common Issues

### Issue 1: "Price ID not found"
**Solution**: Make sure you're using the right mode (test vs live)

### Issue 2: "Invalid currency"
**Solution**: All prices must be in USD (or change code to support other currencies)

### Issue 3: "Product not active"
**Solution**: In product settings, make sure "Active" is toggled ON

### Issue 4: Can't find the copy button
**Solution**: Hover over the price ID - the copy icon appears on hover

---

## 📱 Mobile Instructions

If you're on mobile:
1. Use **Stripe mobile app** (easier than browser)
2. Go to **Products**
3. Tap a product
4. **Long press** the price ID to copy

---

## ✅ Verification

After adding price IDs, test checkout:

```bash
# Start your server
npm run dev:all

# Go to pricing page
http://localhost:5173/pricing

# Click "Get Starter" (cheapest tier)
# Should redirect to Stripe checkout
# Use test card: 4242 4242 4242 4242
# Complete payment
# Should redirect back with success message
```

If it works → Your price IDs are correct! 🎉

---

## 🚨 Security Note

**NEVER commit price IDs to git!**

Make sure `.env` is in your `.gitignore`:
```
# .gitignore
.env
.env.local
.env.production
```

---

## 🆘 Still Stuck?

1. **Check Stripe logs**: Dashboard → Developers → Logs
2. **Check your webhook**: Dashboard → Developers → Webhooks
3. **Verify API keys**: Dashboard → Developers → API keys
4. **Contact Stripe support**: https://support.stripe.com

---

## 🎯 TL;DR - Copy This

1. Go to https://dashboard.stripe.com/products
2. Create 7 products ($1000, $500 monthly, $500 lifetime, $250, $100, $50, $5)
3. Copy each `price_1ABC...` ID
4. Add to `.env`:
   ```env
   STRIPE_PRICE_SOVEREIGN=price_1ABC...
   STRIPE_PRICE_FULL_MONTHLY=price_1DEF...
   STRIPE_PRICE_FULL_LIFETIME=price_1GHI...
   STRIPE_PRICE_HALF=price_1JKL...
   STRIPE_PRICE_ADVANCED=price_1MNO...
   STRIPE_PRICE_BASIC=price_1PQR...
   STRIPE_PRICE_STARTER=price_1STU...
   ```
5. Restart server
6. Test at `/pricing`

Done! 🚀
