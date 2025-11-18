# 🔐 Admin Access Control

## OWNER-ONLY Access

**Owner Email:** `polotuspossumus@gmail.com`

This is the ONLY account with full admin powers.

## What Owner Can Do

✅ **Full Platform Control:**
- View all GitHub Issues
- Access admin dashboard
- See all user data
- Manage all tiers
- Override any restrictions
- Free access to everything
- Auto-bypass legal docs/onboarding
- 4 creator profiles (main + 3 extra)

✅ **Backend Admin Endpoints:**
- `GET /api/github/issues` - List all bugs (Owner only)
- All future admin-only endpoints

✅ **VIP Tier Assignment:**
- Can manually assign VIP status
- First 10 VIP slots managed by owner

## VIP Tier (Limited to 10 People)

**NOT THE SAME AS OWNER** - VIPs get free access but NO admin powers.

VIPs can:
- Use all features for free
- No admin dashboard access
- Cannot view GitHub Issues
- Cannot manage other users

## Security Model

### Owner Check Locations:
1. **Frontend:** `src/index.jsx` - Auto-bypass onboarding
2. **Backend:** `server/src/github/github.controller.ts` - API access
3. **Dashboard:** `src/CreatorDashboard.jsx` - Admin panel
4. **Auth:** `src/components/AuthSupabase.jsx` - Login check

### How It Works:
```javascript
// STRICT check - only this email
if (email === 'polotuspossumus@gmail.com' || userId === 'owner') {
  // Grant admin access
}
```

### What VIPs Get:
```javascript
// VIPs in vipAccess.js - free features, no admin
const VIP_EMAILS = [
  'polotuspossumus@gmail.com', // Owner (also VIP)
  // 9 more slots available
];
```

## Admin Hierarchy

```
👑 OWNER (polotuspossumus@gmail.com)
   ├─ Full admin dashboard
   ├─ View/manage all bugs
   ├─ Database access
   ├─ Deploy access
   └─ Everything free

💎 VIP (10 max)
   ├─ All features free
   ├─ No admin powers
   └─ Premium content access

🔱 Premium Users ($250-$1000/mo)
   ├─ Pay for features
   └─ No admin access

⭐ Regular Users ($15-$100/mo)
   └─ Tier-based access
```

## How to Add More Admins (If Ever Needed)

**WARNING:** Only do this if absolutely necessary.

1. Edit `server/src/github/github.controller.ts`
2. Add email to allowlist:
```typescript
const ADMIN_EMAILS = [
  'polotuspossumus@gmail.com',
  'trusted-admin@example.com'
];

if (!ADMIN_EMAILS.includes(userEmail)) {
  throw new Error('Access denied');
}
```

## Security Notes

- Owner status is hardcoded (not database-driven)
- Cannot be compromised via SQL injection
- Frontend checks are convenience only
- Backend enforces strict email matching
- VIP status doesn't grant admin access

---

**Current Owner:** polotuspossumus@gmail.com  
**VIP Slots Used:** 1/10 (just you)  
**Admin Accounts:** 1 (you)
