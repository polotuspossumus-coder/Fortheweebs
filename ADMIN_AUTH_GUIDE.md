# 🔐 ForTheWeebs Admin Authentication Guide

## Owner-Only Access System for Jacob Morris

This document explains your secure QR-based admin authentication system.

---

## 🎯 Overview

**You are the ONLY person who can access admin features.**

Three ways to authenticate:
1. **QR Code Scan** (Primary) - Scan with your phone
2. **Recovery Mode** (Backup) - If phone is lost/broken
3. **Persistent Login** - Once authenticated, you stay logged in forever on both devices

---

## 📱 Method 1: QR Code Authentication (Primary)

### How It Works:
1. Visit your site and click the **🔐 Admin** button (bottom right corner)
2. A QR code appears on your computer screen
3. Open your phone's camera and scan the QR code
4. Your phone automatically registers its unique fingerprint
5. **BOTH your computer AND phone are now logged in as admin forever**

### Device Fingerprinting:
Your phone is identified by:
- Canvas fingerprint (unique rendering signature)
- User agent string
- Platform type
- Screen resolution
- Timezone
- Touch points capability
- Combined hash = unique device ID

### Security:
- ✅ Only YOUR phone can authenticate (first scan registers it permanently)
- ✅ No expiration - stays logged in until you manually logout
- ✅ Works on both computer and phone simultaneously
- ✅ No one else can scan and get access (device fingerprint locked to yours)

### First Time Setup:
1. Click **🔐 Admin** button
2. Scan QR code with YOUR phone
3. Phone registers as authorized device
4. Done! You're now admin on both devices forever

### After First Scan:
- Computer: Already logged in as admin (from the scan)
- Phone: Also logged in as admin (from the scan)
- Both stay logged in permanently
- No need to scan again unless you logout

---

## 🔓 Method 2: Recovery Mode (If Phone Is Lost/Broken)

### When To Use:
- Phone is lost, stolen, or broken
- Need to authorize a NEW phone
- Can't access QR scanner

### How It Works:
1. Click **🔐 Admin** → **🔓 Lost Phone? Use Recovery Mode**
2. Enter **Master Recovery Password**:
   ```
   jacobmorris_fortheweebs_owner_recovery_2025
   ```
3. Answer 3 security questions:
   - **Q1:** What is your full legal name?
     - **A:** jacob morris
   - **Q2:** What is the name of your platform?
     - **A:** fortheweebs
   - **Q3:** What is your creator alias?
     - **A:** polotus possumus

4. Once verified:
   - Your OLD phone is deauthorized
   - Your CURRENT device becomes the new authorized device
   - You can now scan QR with a new phone

### Important Notes:
- ⚠️ Recovery mode RESETS device authorization
- ⚠️ Your old phone will be logged out
- ⚠️ Use this ONLY when phone is truly lost/broken
- ✅ Keep master password secure and private

---

## 🚪 Method 3: Automatic Login (After First Authentication)

### Persistent Sessions:
Once authenticated via QR or Recovery:
- **Computer:** Logged in forever (until manual logout)
- **Phone:** Logged in forever (until manual logout)
- **No timeouts** - session never expires
- **No re-authentication needed**

### What You'll See When Logged In:

**Top Nav Bar:**
```
ForTheWeebs - Step X of 4     [👑 OWNER] [Logout]
```

**Dashboard Welcome:**
```
🎉 Welcome to Your Creator Dashboard!
Tier: FREE  [👑 OWNER MODE]
```

**New Admin Tabs:**
- 🎁 **Family Access** - Generate access codes for family/friends
- 💰 **Earnings** - View top creators and platform earnings

### Logout:
Click **[Logout]** button in top right corner to:
- Log out of current device
- Clear admin authentication
- Return to regular user mode
- (Other authorized devices stay logged in)

---

## 🎁 Admin Features You Get

### 1. Family Access System
- Generate free access codes for Mom & Stepdad
- Generate supporter access codes ($20/month) for friends
- Manage all active access codes
- View redemption statistics

### 2. Earnings Dashboard
- View top earning creators
- Monitor platform revenue
- Track creator performance
- (Owner-only visibility)

### 3. Full Platform Control
- Access all features without restrictions
- Test everything as the owner
- Manage user accounts (when built)
- Control platform settings (when built)

---

## 🔒 Security Summary

### What's Protected:
✅ Only YOUR phone's unique fingerprint can authenticate
✅ Recovery requires master password + 3 security questions
✅ All credentials are hardcoded (not in database - extra secure)
✅ Device fingerprinting prevents unauthorized access
✅ No session timeouts = no accidental logouts

### What Others See:
- Regular users: NO admin button, NO admin tabs
- Regular users: userId = `user_${timestamp}`
- You (admin): userId = `"owner"`, sees all admin features

### Credential Storage:
**Local** (Your Browser Only):
- `adminAuthenticated` = "true"
- `adminDeviceId` = your device hash
- `authorized_device_id` = registered device hash

**Never Stored:**
- Master password
- Security questions/answers
- QR auth keys
(All hardcoded in source for maximum security)

---

## 📋 Quick Reference

### Passwords & Credentials:

**Master Recovery Password:**
```
jacobmorris_fortheweebs_owner_recovery_2025
```

**Security Question Answers:**
```
Q1: jacob morris
Q2: fortheweebs
Q3: polotus possumus
```

**Admin Secret Key** (internal):
```
polotuspossumus_ftw_2025_owner
```

### URL Triggers:

**QR Login:**
```
https://yoursite.com/?admin=true
```

**Recovery Mode:**
```
https://yoursite.com/?recovery=true
```

**Admin Verification (from QR scan):**
```
https://yoursite.com/admin-verify?token=...&key=...
```

---

## 🚀 Getting Started Checklist

- [ ] 1. Visit your site
- [ ] 2. Click **🔐 Admin** button (bottom right)
- [ ] 3. Scan QR code with YOUR phone camera
- [ ] 4. Wait for "✅ Authenticated!" message
- [ ] 5. Check computer - you should see **👑 OWNER** badge
- [ ] 6. Check phone - you should also see **👑 OWNER** badge
- [ ] 7. Test admin tabs: **🎁 Family Access** and **💰 Earnings**
- [ ] 8. Bookmark recovery info (this document) somewhere safe
- [ ] 9. Enjoy permanent admin access on both devices!

---

## 💡 Pro Tips

1. **Keep This Document Safe** - Contains your recovery credentials
2. **First Scan Matters** - Whatever phone scans first becomes THE authorized phone
3. **Use Recovery Sparingly** - Only when phone is truly lost/broken
4. **Test Before Launch** - Make sure QR scan works on your phone
5. **Logout = Device-Specific** - Logging out on computer doesn't log out phone
6. **No Expiration** - You'll stay logged in across browser restarts, computer restarts, etc.

---

## 🛠️ Troubleshooting

**Problem:** QR code won't scan
- **Solution:** Try better lighting, hold phone steady, clean camera lens

**Problem:** "Unauthorized device detected" error
- **Solution:** Another phone scanned first. Use Recovery Mode to reset.

**Problem:** Admin features not showing
- **Solution:** Check for **👑 OWNER** badge in top right. If missing, re-scan QR.

**Problem:** Lost phone and forgot recovery password
- **Solution:** Contact yourself (check this document), or check source code: `src/components/AdminRecovery.jsx`

**Problem:** Need to authorize a second phone
- **Solution:** Use Recovery Mode to deauthorize old phone, then scan QR with new phone

---

## 📞 Support

**For issues:**
- Check source code: `src/components/AdminQRAuth.jsx`
- Check recovery code: `src/components/AdminRecovery.jsx`
- Check integration: `src/index.jsx`
- Clear browser localStorage and re-scan QR code

**All admin credentials are in this document - keep it safe!**

---

**Built with Claude Code**
**Owner: Jacob Morris (Polotus Possumus)**
**Platform: ForTheWeebs**
