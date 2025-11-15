# 🚀 Quick Setup - 5 Minutes

## Step 1: Create Database Tables (2 minutes)

1. Open this file: `supabase-schema.sql`
2. Copy EVERYTHING (Ctrl+A, Ctrl+C)
3. Go to: <https://app.supabase.com/project/iqipomerawkvtobjtvom/sql/new>
4. Paste the SQL
5. Click "RUN" (or press F5)
6. Wait for "Success. No rows returned"

✅ **Done** - You now have 11 database tables ready

---

## Step 2: Create Storage Bucket (1 minute)

1. Go to: <https://app.supabase.com/project/iqipomerawkvtobjtvom/storage/buckets>
2. Click "Create a new bucket"
3. Name: `artworks`
4. Make it **Public** ✓
5. Click "Create bucket"

Then add policies:

1. Click the `artworks` bucket
2. Click "Policies"
3. Click "New Policy" → "For full customization"
4. Policy name: `Public access`
5. Allowed operations: Check ALL (SELECT, INSERT, UPDATE, DELETE)
6. Policy definition: `true`
7. Click "Review" → "Save policy"

✅ **Done** - File uploads now work

---

## Step 3: Test Your App (2 minutes)

```powershell
npm run dev
```

Open: <http://localhost:5173>

**Try these:**

1. ✅ Sign up with email/password
2. ✅ Upload an image
3. ✅ Create a commission listing
4. ✅ View creator dashboard

**Everything should work!**

---

## Optional: Set Up Stripe Webhooks (later)

When you deploy to production:

1. Go to: <https://dashboard.stripe.com/test/webhooks>
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.paid
   - invoice.payment_failed
4. Copy webhook signing secret
5. Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## What's Already Working

✅ **Supabase configured** - URL + Keys in .env  
✅ **Stripe configured** - Test mode keys ready  
✅ **App integrated** - All components use Supabase  
✅ **Firebase removed** - Clean codebase  
✅ **Build passing** - 702.75 kB compiled  

---

## If Something Breaks

**"Cannot read properties of null"**

- You're not logged in, sign up first

**"Network error"**

- Check you ran the SQL schema
- Check storage bucket exists

**"Upload failed"**

- Check storage bucket is Public
- Check policies allow INSERT

---

## Deploy When Ready

```powershell
npm run build
git add -A
git commit -m "Ready for production"
git push origin main
```

Netlify will auto-deploy. Make sure environment variables are set there too.

---

# That's It

Just run the SQL, create the bucket, test locally. Everything else is done.
