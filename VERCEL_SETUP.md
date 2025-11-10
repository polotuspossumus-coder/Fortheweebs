# 🚀 Vercel Production Setup Guide

## Step 1: Access Vercel Dashboard

1. Go to: https://vercel.com/jacobs-projects-eac77986/fortheweebs
2. Click on **Settings** tab
3. Click on **Environment Variables** in the sidebar

## Step 2: Add Required Environment Variables

### 🔑 **CRITICAL - Must Set These First:**

#### 1. OpenAI API Key (AI Content Generation)
```
Name: OPENAI_API_KEY
Value: sk-proj-...your-key-here
Environment: Production, Preview, Development
```
**Get it from:** https://platform.openai.com/api-keys
- Click "Create new secret key"
- Copy and save it immediately (you won't see it again)

---

#### 2. Stripe Secret Key (Payments)
```
Name: STRIPE_SECRET_KEY
Value: sk_live_...your-live-key (or sk_test_... for testing)
Environment: Production
```
**Get it from:** https://dashboard.stripe.com/apikeys
- Use **Live mode** for production
- Use **Test mode** for development

---

#### 3. Stripe Webhook Secret
```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_...your-webhook-secret
Environment: Production
```
**Get it from:** https://dashboard.stripe.com/webhooks
1. Click "Add endpoint"
2. URL: `https://your-domain.vercel.app/api/stripe-webhook`
3. Events to send: `checkout.session.completed`
4. Copy the "Signing secret"

---

#### 4. Supabase Database
```
Name: SUPABASE_URL
Value: https://xxxxx.supabase.co
Environment: Production, Preview, Development

Name: SUPABASE_ANON_KEY
Value: eyJhbGc...your-anon-key
Environment: Production, Preview, Development

Name: SUPABASE_SERVICE_KEY
Value: eyJhbGc...your-service-key
Environment: Production
```
**Get it from:** https://app.supabase.com/project/_/settings/api
- Create a new project if needed
- Copy URL and both keys

---

#### 5. Vercel Blob Storage (File Uploads)
```
Name: BLOB_READ_WRITE_TOKEN
Value: vercel_blob_rw_...your-token
Environment: Production, Preview, Development
```
**Get it from:** https://vercel.com/dashboard/stores
1. Create a new Blob store
2. Click "Connect Store"
3. Select your project
4. Token will be auto-generated

---

#### 6. JWT Secret (Authentication)
```
Name: JWT_SECRET
Value: [generate a random 32+ character string]
Environment: Production, Preview, Development
```
**Generate it:**
- Open terminal and run: `openssl rand -base64 32`
- Or use: https://generate-secret.vercel.app/32

---

### 🎯 **OPTIONAL BUT RECOMMENDED:**

#### 7. AWS Rekognition (Face Detection)
```
Name: AWS_ACCESS_KEY_ID
Value: AKIA...your-access-key
Environment: Production

Name: AWS_SECRET_ACCESS_KEY
Value: your-secret-access-key
Environment: Production

Name: AWS_REGION
Value: us-east-1
Environment: Production
```
**Get it from:** https://console.aws.amazon.com/iam/
1. Create IAM user with Rekognition permissions
2. Generate access keys
3. Enable Amazon Rekognition in your region

---

## Step 3: Database Setup (Supabase)

### Create Tables:

1. Go to: https://app.supabase.com/project/_/editor
2. Run these SQL commands:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  payment_tier TEXT DEFAULT 'FREE',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Family access codes
CREATE TABLE family_access_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE,
  tier TEXT,
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Governance rituals
CREATE TABLE governance_rituals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT,
  target_id TEXT,
  reason TEXT,
  initiated_by UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ban proposals
CREATE TABLE ban_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  reason TEXT,
  votes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Failed tier updates (for debugging)
CREATE TABLE failed_tier_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Artifacts (for resurrection ritual)
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  type TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Step 4: Stripe Product Setup

1. Go to: https://dashboard.stripe.com/products
2. Create two products:

### Product 1: Creator Tier
- Name: "Creator Tier - Lifetime Access"
- Price: $500.00 (one-time payment)
- Copy the **Price ID** (starts with `price_...`)

### Product 2: Super Admin Tier
- Name: "Super Admin Tier - Lifetime Access"
- Price: $1000.00 (one-time payment)
- Copy the **Price ID** (starts with `price_...`)

3. Update these in your code:
   - File: `src/routes/create-checkout-session.js`
   - Replace the price IDs with your actual ones

---

## Step 5: Redeploy

After adding all environment variables:

```bash
vercel --prod
```

Or just commit changes and Vercel will auto-deploy!

---

## Step 6: Test Everything

### Test Checklist:
- [ ] Visit your live site
- [ ] Try uploading a photo
- [ ] Test the audio recorder
- [ ] Try AI content generation (requires OpenAI key)
- [ ] Test payment flow (use Stripe test card: 4242 4242 4242 4242)
- [ ] Check if images upload (requires Blob storage)
- [ ] Test VR/AR conversion

---

## 🔒 Security Best Practices

1. **Never commit `.env` files to git**
2. **Use different keys for dev/prod**
3. **Enable Stripe webhook signature verification**
4. **Set up Supabase Row Level Security (RLS)**
5. **Monitor API usage on all platforms**
6. **Rotate keys if compromised**

---

## 🆘 Troubleshooting

### "Unauthorized" errors
- Check JWT_SECRET is set correctly
- Verify Supabase keys are correct

### Payment not working
- Verify Stripe keys are in Live mode
- Check webhook is configured correctly
- Test with Stripe test card first

### AI generation failing
- Verify OpenAI API key is valid
- Check you have credits in your account
- Monitor rate limits

### Files not uploading
- Verify Blob storage is connected
- Check BLOB_READ_WRITE_TOKEN is set

---

## 📊 Cost Estimates

**With moderate usage:**
- Vercel: **Free** (hobby plan)
- Supabase: **Free** (up to 500MB database)
- Vercel Blob: **Free** (5GB storage)
- OpenAI: **$5-20/month** (depends on usage)
- Stripe: **2.9% + $0.30** per transaction
- AWS Rekognition: **$1 per 1000 images**

**Total monthly cost: ~$5-30** (mostly API usage)

---

## 🎉 You're Ready!

Once all environment variables are set, your platform is:
- ✅ Fully functional
- ✅ Payment processing enabled
- ✅ AI generation ready
- ✅ File storage connected
- ✅ Database integrated
- ✅ Production-ready!

**GO LIVE AND DOMINATE! 🚀👑**
