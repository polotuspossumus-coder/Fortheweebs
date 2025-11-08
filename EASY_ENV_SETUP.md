# 🎯 EASIEST WAY TO ADD ENVIRONMENT VARIABLES

## Option 1: Automatic (30 seconds)

Just run this command in your terminal:

```bash
./set-env-vars.bat
```

OR double-click the file `set-env-vars.bat` in your file explorer.

---

## Option 2: Manual (5 minutes)

### Step 1: Open Netlify
Click this link: https://app.netlify.com/sites/fortheweebs/settings/env

### Step 2: Click "Add a variable"

### Step 3: Copy and paste these one by one:

**Variable 1:**
- Key: `VITE_FIREBASE_API_KEY`
- Value: `AIzaSyAXCdL20mO8fnDYU5_2ofn19COJCvzPQ4Y`

**Variable 2:**
- Key: `VITE_FIREBASE_AUTH_DOMAIN`
- Value: `fortheweebs-d6f24.firebaseapp.com`

**Variable 3:**
- Key: `VITE_FIREBASE_PROJECT_ID`
- Value: `fortheweebs-d6f24`

**Variable 4:**
- Key: `VITE_FIREBASE_STORAGE_BUCKET`
- Value: `fortheweebs-d6f24.firebasestorage.app`

**Variable 5:**
- Key: `VITE_FIREBASE_MESSAGING_SENDER_ID`
- Value: `1075224434953`

**Variable 6:**
- Key: `VITE_FIREBASE_APP_ID`
- Value: `1:1075224434953:web:f711b5deedbb9be2751bd8`

**Variable 7:**
- Key: `VITE_STRIPE_PUBLISHABLE_KEY`
- Value: `pk_live_51RyWwx4c1vlfw50BUVy6H3IM7eDsV5MJJqQWjvWQWQwzcccrQQMGuz094b6DKQcmzuH9CSDocvY51yDPqWsbRANh009IgZnOix`

**Variable 8:**
- Key: `VITE_ADMIN_SECRET_KEY`
- Value: `polotuspossumus_ftw_2025_owner`

**Variable 9:**
- Key: `VITE_ADMIN_RECOVERY_PASSWORD`
- Value: `jacobmorris_fortheweebs_owner_recovery_2025`

**Variable 10:**
- Key: `VITE_ADMIN_USERNAME`
- Value: `jacobmorris`

**Variable 11:**
- Key: `VITE_ADMIN_PASSWORD`
- Value: `polotuspossumus2025`

**Variable 12:**
- Key: `VITE_OWNER_PHONE_NUMBER`
- Value: `+12813819498`

**Variable 13:**
- Key: `VITE_BACKUP_EMAIL`
- Value: `jacob@fortheweebs.com`

**Variable 14:**
- Key: `VITE_SECURITY_ANSWER_1`
- Value: `jacob morris`

**Variable 15:**
- Key: `VITE_SECURITY_ANSWER_2`
- Value: `fortheweebs`

**Variable 16:**
- Key: `VITE_SECURITY_ANSWER_3`
- Value: `polotus possumus`

**Variable 17:**
- Key: `VITE_API_BASE_URL`
- Value: `https://fortheweebs.com/api`

### Step 4: Trigger Deploy
1. Go to: https://app.netlify.com/sites/fortheweebs/deploys
2. Click "Trigger deploy" → "Deploy site"
3. Wait 2 minutes

### Step 5: Test Your Site
Visit: https://fortheweebs.netlify.app

---

## ✅ How to Know It Worked:
- Your site loads without errors
- Admin login works at `/admin.html`
- No Firebase errors in browser console (F12)

---

## 🆘 If It Still Doesn't Work:
Run this command to redeploy with local env vars:
```bash
netlify deploy --prod --dir=dist --site=5c84f186-9bef-4a99-87b1-5e8eef46ffd2
```
