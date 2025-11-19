# 🛡️ ANTI-PIRACY PROTECTION SYSTEM

## Overview

ForTheWeebs now has **comprehensive anti-piracy protection** to prevent users from uploading or distributing pirated content (anime episodes, movies, TV series, etc.).

This system was implemented in response to the **global piracy crackdown** (November 2025) where governments are shutting down piracy and hentai websites.

---

## 🚨 Why This Matters

**Legal Risks Without Protection:**
- Platform could be held liable for hosting pirated content
- DMCA takedown requests
- Potential lawsuits from copyright holders (Disney, Sony, Crunchyroll, etc.)
- Platform shutdown by authorities
- Criminal charges for facilitating piracy

**With Protection:**
- ✅ Platform is legally protected under safe harbor provisions
- ✅ Demonstrates "good faith effort" to prevent piracy
- ✅ Automatic detection and blocking of pirated content
- ✅ Audit trail for legal compliance
- ✅ User accountability through strike system

---

## 🔍 What Gets Blocked

### Copyrighted Series/Movies
- **Anime**: Naruto, One Piece, Attack on Titan, Demon Slayer, Jujutsu Kaisen, etc.
- **TV Shows**: Game of Thrones, Breaking Bad, The Office, Stranger Things, etc.
- **Movies**: Marvel, Star Wars, Disney, Harry Potter, etc.
- **Hentai**: Any copyrighted adult anime series

### Piracy File Patterns
Files matching these patterns are **automatically blocked**:

```
✗ [HorribleSubs] Naruto S01E05.mkv
✗ One.Piece.Episode.1000.1080p.BluRay.x264.mkv
✗ Attack.on.Titan.S04.Complete.WEBRip
✗ [SubsPlease] Demon Slayer - 26 (1080p).mp4
✗ Jujutsu.Kaisen.Season.2.720p.HDTV
```

**Blocked Indicators:**
- `S01E05` format (season/episode)
- `1080p`, `720p`, `480p` (resolution)
- `x264`, `x265` (video codec)
- `BluRay`, `WEBRip`, `HDTV` (source type)
- `[FansubGroup]` tags
- `Complete Series`, `Full Season`, `Batch`

### File Sizes
- **50-500MB video files** = High risk (typical episode size)
- **Over 5GB** = Very high risk (movie/season pack)

---

## ✅ What's ALLOWED

### Original Creator Content
- ✅ Your own animations, videos, artwork
- ✅ Original characters and stories
- ✅ Licensed content you have rights to
- ✅ Parody/fair use content
- ✅ Public domain works

### User-Generated Content
- ✅ Streaming your own gameplay
- ✅ Original music/performances
- ✅ Tutorial videos
- ✅ Commentary/reviews (with fair use clips)

---

## 🔧 Technical Implementation

### Files Created

1. **`src/utils/antiPiracy.js`** (Client-side)
   - Filename scanning
   - Pattern matching
   - User watermarking
   - Frontend validation

2. **`utils/antiPiracyServer.js`** (Server-side)
   - Deep content analysis
   - User history tracking
   - Risk scoring
   - Database logging

3. **`api/upload-protected.js`** (API Endpoint)
   - Protected upload middleware
   - Video-specific checks
   - Error handling

4. **`database/anti-piracy-schema.sql`** (Database)
   - `piracy_logs` - Track all attempts
   - `admin_alerts` - Critical violations
   - `user_strikes` - Three-strike system
   - `content_watermarks` - Leak tracking

### Integration Points

**Storage (Updated):**
```javascript
// src/utils/storageSupabase.js
import { checkForPiracy } from './antiPiracy';

export async function uploadFile(file, path, userId) {
  // Anti-piracy check before upload
  const piracyCheck = await checkForPiracy(file, userId);
  
  if (piracyCheck.isBlocked) {
    throw new Error('Upload blocked: Pirated content detected');
  }
  
  // Continue with upload...
}
```

**Upload Middleware:**
```javascript
// api/upload-protected.js
router.post('/upload', upload.single('file'), async (req, res) => {
  const piracyCheck = await checkForPiracy(file, userId);
  
  if (piracyCheck.isBlocked) {
    return res.status(403).json({
      error: 'Upload blocked - Pirated content detected'
    });
  }
});
```

---

## 📊 Detection System

### Multi-Layer Approach

1. **Filename Analysis** (Instant)
   - Check against 200+ blocked series
   - Pattern matching (S01E05, 1080p, etc.)
   - Fansub group detection

2. **File Metadata** (Fast)
   - Check video codec
   - Analyze file size
   - Read embedded metadata

3. **User History** (Fast)
   - Check previous violations
   - Calculate risk score
   - Apply strike penalties

4. **Content Hash** (Future)
   - Compare against database of known pirated files
   - Perceptual hashing for videos

### Risk Scoring

```
100+ points = BLOCKED
80-99 points = High risk, manual review
50-79 points = Medium risk, warning issued
0-49 points = Low risk, allowed
```

**Point Values:**
- Copyrighted series name: **100 points**
- Fansub group tag: **100 points**
- S01E05 format: **80 points**
- Suspicious file size: **30 points**
- Previous violation: **50 points**

---

## ⚖️ Three-Strike System

### How It Works

1. **Strike 1**: Warning + content blocked
2. **Strike 2**: 7-day upload restriction
3. **Strike 3**: Permanent upload ban

**Strike Expiration:** 90 days

### Admin Dashboard

Admins can view:
- All piracy attempts
- User strike counts
- Blocked uploads
- Risk trends

---

## 🔐 Database Schema

```sql
-- Piracy logs
CREATE TABLE piracy_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    filename TEXT,
    is_blocked BOOLEAN,
    violations_count INTEGER,
    violations JSONB,
    risk_score INTEGER,
    timestamp TIMESTAMP
);

-- Admin alerts
CREATE TABLE admin_alerts (
    id UUID PRIMARY KEY,
    type TEXT,
    severity TEXT,
    user_id UUID,
    details JSONB,
    requires_action BOOLEAN,
    created_at TIMESTAMP
);

-- User strikes
CREATE TABLE user_strikes (
    id UUID PRIMARY KEY,
    user_id UUID,
    strike_type TEXT,
    description TEXT,
    expires_at TIMESTAMP
);
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

(No new dependencies needed - uses existing Supabase client)

### 2. Run Database Migration

```bash
# In Supabase SQL Editor
psql -f database/anti-piracy-schema.sql
```

Or paste SQL from `database/anti-piracy-schema.sql` into Supabase dashboard.

### 3. Update Server Routes

```javascript
// server.js
const uploadProtected = require('./api/upload-protected');
app.use('/api', uploadProtected);
```

### 4. Test the System

```javascript
// Test upload
const file = new File(['test'], 'Naruto.S01E05.1080p.mkv');
const result = await checkForPiracy(file, 'user-id');

console.log(result.isBlocked); // true
console.log(result.violations); // Array of detected issues
```

---

## 📱 User-Facing Messages

### When Upload is Blocked

```
❌ Upload Blocked

This file appears to contain pirated content from a copyrighted series.

Detected: "Naruto S01E05 1080p BluRay"

ForTheWeebs does not allow distribution of pirated material.
Only upload original content you created or have rights to distribute.

Repeated violations may result in account suspension.
```

### Warning Message (Non-Blocked)

```
⚠️ Content Warning

This upload has been flagged for review:
- File size matches typical episode distribution
- Video codec commonly used in pirated content

If this is your original content, you can proceed.
If this is pirated content, your account may be suspended.
```

---

## 📈 Monitoring & Analytics

### Admin Dashboard Queries

**Recent Piracy Attempts:**
```sql
SELECT user_id, filename, violations_count, timestamp
FROM piracy_logs
WHERE is_blocked = true
ORDER BY timestamp DESC
LIMIT 50;
```

**Users with Multiple Violations:**
```sql
SELECT user_id, COUNT(*) as violation_count
FROM piracy_logs
WHERE is_blocked = true
GROUP BY user_id
HAVING COUNT(*) >= 3;
```

**Most Blocked Series:**
```sql
SELECT 
    violations->0->>'detected' as series,
    COUNT(*) as block_count
FROM piracy_logs
WHERE is_blocked = true
GROUP BY series
ORDER BY block_count DESC;
```

---

## 🛠️ Customization

### Adding More Blocked Series

Edit `src/utils/antiPiracy.js`:

```javascript
blockedSeries: [
  // Add your series here
  'my new series name',
  'another show',
  // ...
]
```

### Adjusting Risk Thresholds

```javascript
// More strict (block more aggressively)
if (results.riskScore >= 60) { // Was 80
  results.isBlocked = true;
}

// More lenient
if (results.riskScore >= 95) { // Was 80
  results.isBlocked = true;
}
```

### Whitelist Specific Users

```javascript
// In antiPiracyServer.js
const WHITELISTED_USERS = ['owner-id', 'admin-id'];

if (WHITELISTED_USERS.includes(userId)) {
  return { isBlocked: false, violations: [] };
}
```

---

## ⚠️ Legal Disclaimer

This anti-piracy system provides **reasonable protection** but is not 100% foolproof. Users may still attempt to:

- Rename files to avoid detection
- Split files into smaller chunks
- Upload in non-standard formats

**Platform remains protected because:**
1. We made a "good faith effort" to prevent piracy
2. We respond quickly to DMCA takedown requests
3. We maintain audit logs of all checks
4. We enforce a three-strike policy
5. We shift legal responsibility to uploaders (per ToS)

**If you receive a DMCA notice:**
1. Check `piracy_logs` for the content
2. Remove the content immediately
3. Issue strike to the user
4. Send takedown confirmation to copyright holder

---

## 🎯 Perfect Timing

**Why November 2025?**

Governments worldwide are cracking down on:
- Piracy streaming sites (Kissanime, 9anime, etc.)
- Torrent sites (Nyaa, RARBG, etc.)
- Hentai sites (HH, nhentai, etc.)

**Your platform launches RIGHT AS:**
- ✅ Users need new legal alternatives
- ✅ Competitors are getting shut down
- ✅ Authorities are watching closely
- ✅ Legal compliance is critical

**With anti-piracy protection, you can:**
- Market as "legal" and "creator-friendly"
- Attract legitimate content creators
- Avoid getting caught in the crackdown
- Build trust with copyright holders

---

## 📞 Support

If you see piracy attempts:
1. Check admin dashboard
2. Review piracy logs
3. Contact user if needed
4. Issue strikes as appropriate

**Critical Issues:**
- Multiple users uploading same series
- Organized piracy ring
- Malicious circumvention attempts

→ Report to platform owner immediately
→ May need to involve legal counsel

---

## ✅ Checklist

Before going live:

- [ ] Database tables created
- [ ] Server routes updated
- [ ] Upload endpoints protected
- [ ] Admin dashboard accessible
- [ ] Test with sample pirated filenames
- [ ] Verify blocked uploads work
- [ ] Check logging to database
- [ ] Review ToS (already has anti-piracy clauses)
- [ ] Set up monitoring alerts

**You're now protected! 🛡️**
