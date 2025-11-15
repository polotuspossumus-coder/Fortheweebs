# 🚀 ForTheWeebs Platform - Supabase Setup Guide

## ✅ What's Already Done

Your platform has been **fully converted from Firebase to Supabase**! All your credentials are configured in `.env`:

```
✅ Supabase URL configured
✅ Supabase Anon Key configured
✅ Stripe Public Key configured
✅ Stripe Secret Key configured
```

## 📋 Setup Steps (5-10 minutes)

### Step 1: Create Database Tables

1. Go to your Supabase Dashboard: <https://app.supabase.com>
2. Select your project: `iqipomerawkvtobjtvom`
3. Click **SQL Editor** in left sidebar
4. Click **New query**
5. Copy the entire contents of `supabase-schema.sql` file
6. Paste into SQL Editor
7. Click **Run** (or press F5)
8. Wait for "Success. No rows returned" message

**What this creates:**

- 11 database tables (users, artworks, commissions, tips, etc.)
- All necessary indexes for performance
- Row Level Security policies for data protection
- Proper foreign keys and constraints

### Step 2: Create Storage Bucket

1. Still in Supabase Dashboard, click **Storage** in left sidebar
2. Click **Create a new bucket**
3. Bucket name: `artworks`
4. Make it **Public**
5. File size limit: `10485760` (10MB in bytes)
6. Click **Create bucket**

**Then set up storage policies:**

1. Click on the `artworks` bucket you just created
2. Click **Policies** tab
3. Add policy: "Allow authenticated users to upload"
   - Policy name: `Allow uploads`
   - Target roles: `authenticated`
   - Allowed operations: `INSERT`
   - Policy definition: `true`
4. Add policy: "Allow public downloads"
   - Policy name: `Public access`
   - Target roles: `public`
   - Allowed operations: `SELECT`
   - Policy definition: `true`

### Step 3: Set Up Stripe Webhooks

1. Go to Stripe Dashboard: <https://dashboard.stripe.com>
2. Click **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
   - (Use your Netlify URL once deployed, or use `https://yourdomain.netlify.app/api/webhooks/stripe`)
5. Select events to listen to:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.paid`
   - ✅ `invoice.payment_failed`
6. Click **Add endpoint**
7. Copy the **Signing secret** (starts with `whsec_`)
8. Add to `.env`:

   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

### Step 4: Enable Google OAuth (Optional)

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Go to Google Cloud Console: <https://console.cloud.google.com>
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI:

   ```
   https://iqipomerawkvtobjtvom.supabase.co/auth/v1/callback
   ```

6. Copy Client ID and Client Secret
7. Paste into Supabase Google provider settings
8. Click **Save**

### Step 5: Build and Test

```powershell
# Build the platform
npm run build

# Start dev server
npm run dev
```

**Test these features:**

1. ✅ Sign up / Login (creates user in Supabase)
2. ✅ Upload artwork (saves to Supabase Storage)
3. ✅ Create commission listing
4. ✅ Send a tip (test with Stripe test card: 4242 4242 4242 4242)
5. ✅ View creator dashboard

### Step 6: Deploy to Production

```powershell
# Commit all changes
git add -A
git commit -m "Convert platform to Supabase - Production ready"
git push origin main
```

**If using Netlify:**

- Auto-deploys from GitHub
- Make sure environment variables are set in Netlify Dashboard:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_STRIPE_PUBLIC_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET` (from Step 3)

## 🔑 Environment Variables Reference

Your `.env` file should have:

```bash
# Supabase (✅ Already configured)
VITE_SUPABASE_URL=https://iqipomerawkvtobjtvom.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Stripe (✅ Already configured)
VITE_STRIPE_PUBLIC_KEY=pk_test_51RyWwx4c1vlfw50B...
STRIPE_SECRET_KEY=sk_test_51RyWwx4c1vlfw50B...

# Stripe Webhooks (❌ Add after Step 3)
STRIPE_WEBHOOK_SECRET=whsec_...

# Admin (✅ Already configured)
VITE_ADMIN_USERNAME=polotus
VITE_ADMIN_PASSWORD=Scorpio#96
```

## 📊 Database Tables Created

| Table | Purpose |
|-------|---------|
| `users` | User accounts, profiles, balances, tiers |
| `artworks` | Uploaded art with metadata, NSFW flags |
| `commissions` | Commission listings by creators |
| `commission_orders` | Commission purchases and status |
| `subscriptions` | User subscription records (Bronze/Silver/Gold/Platinum) |
| `tips` | Tip transactions between users |
| `transactions` | All payment records (tips, commissions, subscriptions) |
| `comments` | Comments on artworks |
| `likes` | Artwork likes/favorites |
| `follows` | User follow relationships |
| `notifications` | User notifications |

## 🛡️ Security Features

✅ **Row Level Security (RLS)** - Users can only access their own data
✅ **Authentication Required** - Protected routes and API endpoints
✅ **HTTPS Only** - All connections encrypted
✅ **Input Validation** - All user input sanitized
✅ **NSFW Detection** - Automatic content moderation

## 🚨 Troubleshooting

### "Cannot read properties of null (reading 'user')"

- Make sure you're logged in
- Check that Supabase auth session is active
- Try clearing browser cookies and logging in again

### "Failed to fetch" or "Network error"

- Check that Supabase URL and Anon Key are correct in `.env`
- Make sure `npm run dev` is running
- Check browser console for CORS errors

### "Stripe webhook signature verification failed"

- Make sure `STRIPE_WEBHOOK_SECRET` matches your Stripe dashboard
- Check that webhook endpoint URL is correct
- Verify webhook is receiving events in Stripe dashboard

### "Storage bucket not found"

- Make sure you created the `artworks` bucket in Supabase Storage
- Check that bucket is set to **Public**
- Verify storage policies are configured

### Database errors

- Re-run the `supabase-schema.sql` file
- Check Supabase Dashboard > Table Editor to verify tables exist
- Look at Database > Functions for any errors

## 📱 Testing Payments

**Test Card Numbers (Stripe Test Mode):**

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires Authentication: 4000 0025 0000 3155

Any future expiry date
Any 3-digit CVC
Any postal code
```

## 🎉 You're All Set

Your platform is now running on:

- ✅ **Supabase** - Database + Storage + Authentication
- ✅ **Stripe** - Real payment processing
- ✅ **Netlify/Vercel** - Hosting (when deployed)

**Features Ready:**

- User authentication (email + Google OAuth)
- Creator profiles and dashboards
- Artwork upload and discovery
- Commission system
- Tip system
- Subscription tiers (Bronze, Silver, Gold, Platinum)
- NSFW content moderation
- Social features (comments, likes, follows)
- Admin panel
- Search and filtering

Need help? Check the logs:

- Browser DevTools Console (frontend errors)
- Supabase Dashboard > Logs (database queries)
- Stripe Dashboard > Webhooks (payment events)
