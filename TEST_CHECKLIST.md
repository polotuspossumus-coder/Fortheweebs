# CRITICAL FEATURE TEST CHECKLIST
## Test Date: 2025-11-13

### 🚨 MUST WORK FOR LAUNCH (Money Makers)

#### 1. Payment System ✅/❌
- [ ] Stripe connects properly
- [ ] Can view pricing tiers
- [ ] Test payment flow (use Stripe test mode)
- [ ] Premium features unlock after payment
- [ ] Free tier still works

#### 2. Dashboard Access ✅/❌
- [ ] Normal user can reach dashboard
- [ ] Owner bypass works: `?owner=polotus`
- [ ] Family links work: `?familyCode=XXX`
- [ ] No black screens or crashes

#### 3. Photo Tools (Main Product) ✅/❌
- [ ] Can upload photos
- [ ] Auto-enhance works (brightness/contrast)
- [ ] Filters apply correctly
- [ ] Can download edited photos
- [ ] Batch processing works
- [ ] Avatar generator creates avatars
- [ ] Banner generator creates banners

#### 4. Profile/Portfolio ✅/❌
- [ ] Can create profile
- [ ] Profile displays correctly
- [ ] Can upload avatar
- [ ] Can upload banner
- [ ] Avatar generator button works
- [ ] Banner generator button works

#### 5. Commission System (Revenue) ✅/❌
- [ ] Can create commission listings
- [ ] Commission prices show correctly
- [ ] Buyers can see commissions
- [ ] Payment integration works

### 🔧 NICE TO HAVE (Test After Critical)

#### 6. Bug Reporter
- [ ] Can submit bug reports
- [ ] Reports save to database

#### 7. Tips/Donations
- [ ] Can receive tips
- [ ] Payment flows to correct account

#### 8. Family Access System
- [ ] Can generate family codes
- [ ] Family codes grant free access
- [ ] Family users see correct badge

### 📝 TESTING URLS

**Local Testing:**
- Normal: http://localhost:3004
- Owner: http://localhost:3004/?owner=polotus
- Family: http://localhost:3004/?familyCode=TEST123

**Production Testing:**
- Normal: https://fortheweebs.netlify.app
- Owner: https://fortheweebs.netlify.app/?owner=polotus
- Family: https://fortheweebs.netlify.app/?familyCode=TEST123

### 🐛 KNOWN ISSUES TO FIX
1. Screenshot sorter integration (not critical)
2. Backend API not deployed (local only on port 3001)
3. Missing OpenAI API key (AI features won't work)
4. Missing GitHub token (PR automation won't work)

### 💰 REVENUE BLOCKERS
**If ANY of these don't work, we can't make money:**
- [ ] Payment processing
- [ ] Photo tools work end-to-end
- [ ] Can download results
- [ ] Commission system functional
