# 🚨 ANTI-PIRACY QUICK REFERENCE

## What Changed?

Added comprehensive anti-piracy protection to prevent users from uploading pirated anime, movies, or TV shows.

---

## Files Added

1. **`src/utils/antiPiracy.js`** - Client-side protection
2. **`utils/antiPiracyServer.js`** - Server-side validation  
3. **`api/upload-protected.js`** - Protected API endpoints
4. **`database/anti-piracy-schema.sql`** - Database tables
5. **`ANTI_PIRACY_SYSTEM.md`** - Full documentation

## Files Modified

1. **`src/utils/storageSupabase.js`** - Added piracy checks to uploads
2. **`src/utils/legalProtections.js`** - Added piracy pattern detection
3. **`src/routes/tos.js`** - Enhanced Terms of Service

---

## How It Works

### Upload Flow (NEW)

```
User uploads file
    ↓
Filename check → Blocked series? → ❌ REJECT
    ↓
Pattern check → S01E05 format? → ❌ REJECT
    ↓
File size check → 150-500MB video? → ⚠️ WARNING
    ↓
User history → 2+ violations? → ❌ REJECT
    ↓
✅ ALLOW UPLOAD
```

### What Gets Blocked

❌ `Naruto.S01E05.1080p.BluRay.x264.mkv`  
❌ `[HorribleSubs] One Piece - 1000.mp4`  
❌ `Attack.on.Titan.Season.4.Complete.720p`  
❌ Any file with copyrighted series names  
❌ Any file with piracy patterns (S01E05, 1080p, etc.)

### What's Allowed

✅ `my-original-animation.mp4`  
✅ `gameplay-tutorial-2025.mp4`  
✅ `original-character-art.png`  
✅ User-created content  
✅ Licensed content with proof of rights

---

## Setup (2 Steps)

### 1. Create Database Tables

Go to Supabase → SQL Editor → Paste this:

```sql
-- Run this in Supabase SQL Editor
\i database/anti-piracy-schema.sql
```

Or copy/paste the contents of `database/anti-piracy-schema.sql`

### 2. Restart Dev Server

```bash
npm run dev
```

That's it! Protection is now active.

---

## Testing

### Test Blocked Upload

```javascript
const blockedFile = new File(['test'], 'Naruto.S01E05.1080p.mkv');
// This will be blocked ❌
```

### Test Allowed Upload

```javascript
const allowedFile = new File(['test'], 'my-animation.mp4');
// This will succeed ✅
```

---

## Admin Dashboard

View piracy attempts:

```sql
-- Recent blocked uploads
SELECT user_id, filename, violations_count, timestamp
FROM piracy_logs
WHERE is_blocked = true
ORDER BY timestamp DESC
LIMIT 20;

-- Users with multiple violations
SELECT user_id, COUNT(*) as strikes
FROM piracy_logs
WHERE is_blocked = true
GROUP BY user_id
HAVING COUNT(*) >= 2;
```

---

## Three-Strike System

| Strike | Action | Duration |
|--------|--------|----------|
| 1st | Content blocked + warning | - |
| 2nd | 7-day upload ban + final warning | 7 days |
| 3rd | Permanent upload ban | Permanent |

Strikes expire after **90 days** of good behavior.

---

## Why This Matters

**November 2025:** Global piracy crackdown happening NOW
- Governments shutting down piracy sites
- Anime/hentai sites being targeted
- Legal liability for platforms hosting pirated content

**With Protection:**
- ✅ Platform legally protected
- ✅ Safe harbor compliance
- ✅ Can market as "legal alternative"
- ✅ Audit trail for compliance

**Without Protection:**
- ❌ Platform could be sued
- ❌ Risk of shutdown
- ❌ Criminal liability
- ❌ Users pirating through you

---

## User-Facing Messages

### Blocked Upload

```
❌ Upload Blocked

This file appears to contain pirated content.

Detected: "Naruto S01E05 1080p BluRay"

ForTheWeebs does not allow pirated material.
Only upload original content you created.

Repeated violations result in account suspension.
```

---

## Legal Protection

The ToS now states:

> **By using ForTheWeebs, you acknowledge:**
> - You are solely responsible for your uploads
> - Platform is NOT liable for your violations
> - We cooperate with DMCA requests
> - We report piracy to authorities
> - False ownership claims are fraud

This shifts legal responsibility to users while protecting the platform.

---

## Support

**If users complain "Why was my upload blocked?"**

Response:
> "Our automated system detected pirated content. We only allow original creator content. If you created this content and own the rights, please contact support with proof of ownership."

**If you get a DMCA takedown:**

1. Check piracy_logs for the content
2. Remove content immediately
3. Issue strike to user
4. Reply to DMCA sender with confirmation

---

## Monitoring

Check logs regularly:

```bash
# View recent blocks
psql -c "SELECT * FROM piracy_logs WHERE is_blocked=true ORDER BY timestamp DESC LIMIT 10;"

# Check for suspicious users
psql -c "SELECT user_id, COUNT(*) FROM piracy_logs GROUP BY user_id HAVING COUNT(*) > 2;"
```

---

## Perfect Timing

**Why this matters NOW:**
- ✅ Competitors getting shut down
- ✅ Users need legal alternatives
- ✅ You launch as "the legal option"
- ✅ First-mover advantage
- ✅ Build trust with creators

**Market this as:**
> "ForTheWeebs: The legal, creator-first platform built for the post-piracy era"

---

## Questions?

Read full docs: `ANTI_PIRACY_SYSTEM.md`

**You're now protected! 🛡️**
