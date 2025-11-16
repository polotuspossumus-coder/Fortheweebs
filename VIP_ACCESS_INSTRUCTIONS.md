# 🌟 VIP Access System - Lifetime Unlimited Access

## How to Grant Someone VIP Access

You can grant **3 people** lifetime unlimited access (beyond yourself as owner).

### Step 1: Add Their Email

1. Open `src/utils/vipAccess.js`
2. Replace the placeholder emails in the `LIFETIME_VIP_EMAILS` array:

```javascript
export const LIFETIME_VIP_EMAILS = [
  'polotuspossumus@gmail.com', // Owner - always VIP
  'friend1@gmail.com',         // VIP Slot 1 - Your first VIP
  'friend2@gmail.com',         // VIP Slot 2 - Your second VIP  
  'friend3@gmail.com'          // VIP Slot 3 - Your third VIP
];
```

### Step 2: Deploy the Update

After editing the file, deploy the changes:

```bash
npm run build
git add .
git commit -m "Add VIP access for 3 friends"
git push origin main
```

Netlify will automatically deploy the update.

## What VIP Users Get

✅ **Lifetime unlimited access** - No payments ever  
✅ **All premium features** - Every tool unlocked  
✅ **LIFETIME_VIP tier** - Better than paid tiers  
✅ **Skip payment flow** - Goes straight to dashboard  
✅ **No restrictions** - Unlimited everything  

## How It Works

1. **Backend Check** (`api/user-tier.js`):
   - When someone logs in, their email is checked against the VIP list
   - If matched, they automatically get `LIFETIME_VIP` tier
   - This bypasses all payment checks

2. **Frontend Check** (`src/index.jsx`):
   - During onboarding, VIP emails skip the payment step entirely
   - They go straight from profile setup → dashboard
   - VIP status is saved in localStorage

3. **Tier System** (`src/utils/vipAccess.js`):
   - `isLifetimeVIP(email)` - Checks if email is in VIP list
   - `shouldSkipPayment(email)` - Returns true for VIPs
   - `getVIPTier()` - Returns 'LIFETIME_VIP' tier

## Adding/Removing VIPs

**To add a VIP:**
- Edit `src/utils/vipAccess.js` and replace a placeholder email
- Also update `api/user-tier.js` (same array at top of file)

**To remove a VIP:**
- Replace their email with `'vip@example.com'` in both files
- They'll revert to normal user on next login

**Current VIP Slots:**
1. polotuspossumus@gmail.com (Owner - permanent)
2. vip1@example.com (Available)
3. vip2@example.com (Available)
4. vip3@example.com (Available)

## Important Notes

⚠️ **Email must match exactly** - Case-insensitive but must be exact  
⚠️ **Update both files** - Both `vipAccess.js` and `user-tier.js`  
⚠️ **Redeploy after changes** - VIPs only take effect after deployment  
⚠️ **Can't be revoked easily** - Once VIP, they have lifetime access  

## Testing VIP Access

1. Add a test email to the VIP list
2. Deploy the changes
3. Sign up with that email
4. Should skip payment and go straight to dashboard
5. Check localStorage - should see `userTier: 'LIFETIME_VIP'`

## Security

The VIP list is server-side (in API) and client-side (in React), so:
- Users can't fake VIP status by editing localStorage
- Backend always validates against the hardcoded list
- Even if they bypass frontend, backend will catch non-VIPs

Enjoy sharing unlimited access with your friends! 🚀
