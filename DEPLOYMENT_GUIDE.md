# ForTheWeebs - Production Deployment Guide

## Environment Variables for Deployment

When deploying to Netlify, Vercel, or any other hosting platform, you MUST add these environment variables in your hosting platform's dashboard:

### Required Environment Variables

```bash
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

## Netlify Deployment

1. **Add Environment Variables:**
   - Go to Netlify Dashboard > Site Settings > Environment Variables
   - Add all variables listed above
   - Click "Save"

2. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Deploy:**
   - Push to your repository
   - Netlify will automatically deploy

## Vercel Deployment

1. **Add Environment Variables:**
   - Go to Vercel Dashboard > Project Settings > Environment Variables
   - Add all variables listed above
   - Select "Production" environment
   - Click "Save"

2. **Deploy:**
   - Push to your repository
   - Vercel will automatically deploy

## Security Notes

- ⚠️ **NEVER** commit `.env` or `.env.local` files to git
- All sensitive credentials are stored in environment variables
- Firebase and Stripe keys are already configured
- Admin credentials are secured via environment variables

## Testing Production Build Locally

Before deploying, test the production build:

```bash
npm run build
npm run preview
```

Then visit `http://localhost:3000` to test the production build.

## Troubleshooting

If admin authentication fails:
1. Verify all `VITE_ADMIN_*` environment variables are set
2. Check browser console for errors
3. Clear localStorage and try again

If Firebase fails to initialize:
1. Verify all `VITE_FIREBASE_*` environment variables are set
2. Check Firebase console for project status
