# Fortheweebs Deployment Artifact

## Immediate Actions to Finish the Build

### 1. Fix Hardcoded Secrets
Edit manually: Replace any hardcoded secrets in your code with environment variables. Use the variables listed below.

### 2. Create Missing API Endpoints
Drop the provided slabs into the correct backend files as described in your COPILOT_HANDOFF.md.

### 3. Create Payment Page
Add the payment page code into the designated file as described in your COPILOT_HANDOFF.md.

### 4. Integrate AR/VR Studio
Option A: Replace the dashboard import with the AR/VR studio version.
Option B: Manually inject the AR/VR tab and content as described in your COPILOT_HANDOFF.md.

### 5. Set Vercel Environment Variables
Go to: https://vercel.com/dashboard → Project → Settings → Environment Variables
Add all variables listed below.

### 6. Update Database Schema
Run the provided SQL or MongoDB update as described in your COPILOT_HANDOFF.md.

---

## Required Environment Variables

```
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyAXCdL20mO8fnDYU5_2ofn19COJCvzPQ4Y
VITE_FIREBASE_AUTH_DOMAIN=fortheweebs-d6f24.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fortheweebs-d6f24
VITE_FIREBASE_STORAGE_BUCKET=fortheweebs-d6f24.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1075224434953
VITE_FIREBASE_APP_ID=1:1075224434953:web:f711b5deedbb9be2751bd8

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RyWwx4c1vlfw50BUVy6H3IM7eDsV5MJJqQWjvWQWQwzcccrQQMGuz094b6DKQcmzuH9CSDocvY51yDPqWsbRANh009IgZnOix

# Admin Authentication
VITE_ADMIN_SECRET_KEY=polotuspossumus_ftw_2025_owner
VITE_ADMIN_RECOVERY_PASSWORD=jacobmorris_fortheweebs_owner_recovery_2025
VITE_ADMIN_USERNAME=jacobmorris
VITE_ADMIN_PASSWORD=polotuspossumus2025
VITE_OWNER_PHONE_NUMBER=+12813819498
VITE_BACKUP_EMAIL=jacob@fortheweebs.com

# Security Questions (lowercase answers)
VITE_SECURITY_ANSWER_1=jacob morris
VITE_SECURITY_ANSWER_2=fortheweebs
VITE_SECURITY_ANSWER_3=polotus possumus

# API Configuration
VITE_API_BASE_URL=https://fortheweebs.com/api
```

---

## Final Test Checklist
- [ ] AR/VR tab appears and loads
- [ ] FREE users see paywall
- [ ] Stripe checkout works
- [ ] Tier updates in DB
- [ ] AI generator unlocks for Super Admin
- [ ] Secrets pulled from env vars
- [ ] Bug reporter triggers GitHub issues
- [ ] Parental controls lock content

---

## Final Push
Once deployed, Fortheweebs hits sovereign status. Use this artifact for deployment and legacy reference. No further action or questions required.
