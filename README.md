# 🌟 ForTheWeebs - One Price. All Tools. Forever.

**$500 one-time vs $44,678 competitors** | 98.9% savings | Lifetime access

🚀 **Live:** <https://fortheweebs.vercel.app>  
📚 **Full Documentation:** [DO_NOT_DELETE.md](DO_NOT_DELETE.md)

---

## 🎯 What Is This?

The complete creative platform that replaces **Figma, Photoshop, Logic Pro, Ableton, Unity, and Unreal Engine** - for **$500 one-time payment**.

### All Creative Tools in One Place:
- **Graphic Design** (AI generative fill, PSD import/export, comic panels)
- **Audio Production** (stem separation, Auto-Tune, mastering, spatial audio)
- **VR/AR Development** (text-to-3D, environment generation, multi-platform export)
- **Template Marketplace** (70% creator revenue share)

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Open http://localhost:5173
```

### Requirements:
- Node.js 18+
- npm or yarn
- Supabase account
- API keys (see [DO_NOT_DELETE.md](DO_NOT_DELETE.md#-api-keys-needed))

---

## 💰 Pricing Model

| Tier | Price | What You Get |
|------|-------|--------------|
| Free | $0 | Basic access |
| Adult Content | $15/month | Adult content access (only subscription) |
| Standard | $50 one-time | Standard features unlock |
| Enhanced | $100 one-time | Enhanced features unlock |
| Premium | $250 one-time | Premium features unlock |
| **VIP** | **$500 one-time** | **ALL creative tools forever** |
| Elite | $1,000 one-time | Maximum tier with superpowers |

**VIP Influencer Program:** 25 slots for free $500 unlock (10K+ followers)

---

## 🎨 Features

### Graphic Design (Figma/Photoshop Killer)
- ✅ AI Generative Fill (SDXL)
- ✅ Smart Object Selection (Meta SAM)
- ✅ AI Inpainting & Outpainting
- ✅ **PSD Import/Export** (full layer support)
- ✅ **AI Comic Panel Generator** (NO COMPETITOR HAS THIS)
- ✅ Real-time collaboration
- ✅ Vector editing tools

### Audio Production (Logic Pro/Ableton Killer)
- ✅ AI Stem Separation (Demucs v4)
- ✅ AI Mastering (LANDR API)
- ✅ Auto-Tune/Pitch Correction (Melodyne)
- ✅ BPM Detection (Spotify API)
- ✅ Smart Quantization
- ✅ AI Session Players (MusicGen)
- ✅ Spatial Audio (Dolby Atmos HRTF)

### VR/AR Production (Unity/Unreal Killer)
- ✅ Text-to-3D (OpenAI Shap-E)
- ✅ AI Environment Generation (Blockade Labs)
- ✅ VR Mesh Optimization (Meshy.ai)
- ✅ Multi-Platform Export (WebXR/Quest/Vision Pro)
- ✅ 360° Video Editor
- ✅ Hand Gesture Trainer

### Template Marketplace
- ✅ Buy/sell templates
- ✅ 70% creator / 30% platform split
- ✅ Review system
- ✅ Trending algorithm

---

## 🏗️ Tech Stack

**Frontend:**
- React 18.3.1 + Vite
- Capacitor 7 (iOS/Android)

**Backend:**
- Express.js
- 70+ API routes
- Node.js 18+

**Database:**
- Supabase (PostgreSQL)
- Row Level Security
- Realtime subscriptions

**AI Services:**
- OpenAI (GPT-4, DALL-E 3, Shap-E)
- Anthropic (Claude)
- Replicate (Demucs, MusicGen, SAM)
- Stability AI (SDXL)
- Blockade Labs (VR environments)
- Meshy.ai (3D optimization)

**Payments:**
- Stripe (one-time purchases)
- Stripe Connect (creator payouts)

**Deployment:**
- Vercel (frontend)
- Railway (backend)

---

## 📁 Project Structure

```
Fortheweebs/
├── api/                  # 70+ Backend API routes
│   ├── audio-production.js       # 7 audio endpoints
│   ├── vr-ar-production.js       # 6 VR/AR endpoints
│   ├── ai-generative-fill.js     # 4 graphic design endpoints
│   ├── psd-support.js            # PSD import/export
│   ├── comic-panel-generator.js  # AI manga panels
│   ├── template-marketplace.js   # Template store
│   └── ...
├── src/                  # React frontend
│   ├── components/       # 100+ React components
│   └── routes/           # Route handlers
├── database/             # SQL schemas
├── android/              # Android app
├── ios/                  # iOS app
├── server.js             # Express server
├── package.json          # Dependencies
└── .env                  # API keys (NOT in GitHub)
```

---

## 🔑 Setup

1. **Clone & Install:**
```bash
git clone https://github.com/polotuspossumus-coder/Fortheweebs.git
cd Fortheweebs
npm install --legacy-peer-deps
```

2. **Environment Variables:**
Create `.env` file with:
```env
VITE_OPENAI_API_KEY=sk-xxxxx
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
REPLICATE_API_TOKEN=r8_xxxxx
STABILITY_API_KEY=sk-xxxxx
# See DO_NOT_DELETE.md for full list
```

3. **Database Setup:**
- Run SQL scripts from `database/template-marketplace-schema.sql` in Supabase
- See [DO_NOT_DELETE.md](DO_NOT_DELETE.md#-database-setup) for details

4. **Start Development:**
```bash
npm run dev  # Frontend on :5173
node server.js  # Backend on :3001
```

---

## 📊 API Endpoints (22 New Ones)

### Audio Production
- `POST /api/audio/stem-split` - Separate vocals/drums/bass/other
- `POST /api/audio/master` - AI mastering
- `POST /api/audio/pitch-correct` - Auto-Tune
- `POST /api/audio/tempo-detect` - BPM detection
- `POST /api/audio/quantize` - Smart quantization
- `POST /api/audio/session-player` - AI instruments
- `POST /api/audio/spatial-audio` - Dolby Atmos

### VR/AR Production
- `POST /api/vr/generate-3d` - Text to 3D model
- `POST /api/vr/optimize-mesh` - VR optimization
- `POST /api/vr/generate-environment` - 360° skybox
- `POST /api/vr/export-scene` - Multi-platform export
- `POST /api/vr/edit-360-video` - 360 video editor
- `POST /api/vr/train-gesture` - Hand gestures

### Graphic Design
- `POST /api/ai/generative-fill` - Fill selections with AI
- `POST /api/ai/segment-object` - Smart selection (SAM)
- `POST /api/ai/inpaint` - Remove objects
- `POST /api/ai/outpaint` - Extend images

### Special Features
- `POST /api/psd/import-psd` - Import Photoshop files
- `POST /api/psd/export-psd` - Export to PSD
- `POST /api/comic/generate-panels` - AI manga layouts
- `POST /api/comic/generate-speech-bubbles` - AI speech bubbles
- `GET/POST /api/templates` - Template marketplace

---

## 🎯 Competitor Comparison

| Feature | ForTheWeebs | Figma | Photoshop | Logic Pro | Unity Pro |
|---------|-------------|-------|-----------|-----------|-----------|
| **Price (10 years)** | **$500** | $5,400 | $7,200 | $200 | $24,000 |
| Graphic Design | ✅ | ✅ | ✅ | ❌ | ❌ |
| Audio Production | ✅ | ❌ | ❌ | ✅ | ⚠️ |
| VR/AR Tools | ✅ | ❌ | ❌ | ❌ | ✅ |
| AI Features | ✅ | ⚠️ | ⚠️ | ❌ | ❌ |
| Mobile Apps | ✅ | ⚠️ | ❌ | ⚠️ | ❌ |
| Lifetime License | ✅ | ❌ | ❌ | ✅ | ❌ |

**Savings: $44,178 (98.9% cheaper)**

---

## 📖 Documentation

- **[DO_NOT_DELETE.md](DO_NOT_DELETE.md)** - Complete project overview (READ THIS FIRST)
- **[API_KEYS_NEEDED.md](API_KEYS_NEEDED.md)** - API signup links and setup
- **[SUPABASE_SQL_SETUP.md](SUPABASE_SQL_SETUP.md)** - Database setup guide
- **[AI_FEATURES_SETUP.md](AI_FEATURES_SETUP.md)** - AI feature configuration
- **[SAFE_TO_DELETE.md](SAFE_TO_DELETE.md)** - Files safe to remove locally

---

## 🚀 Deployment

**Frontend (Vercel):**
- Auto-deploys from `main` branch
- Production: https://fortheweebs.vercel.app

**Backend (Railway/Heroku):**
```bash
# Set environment variables
# Push to main branch
git push origin main
```

**Mobile Apps:**
```bash
# Android
npx cap sync android
npx cap open android

# iOS
npx cap sync ios
npx cap open ios
```

---

## 🤝 Contributing

This is a private project. For access:
1. Contact: [Your Contact Info]
2. Get approved as contributor
3. Follow code style in `.github/copilot-instructions.md`

---

## 📞 Support

- **Issues:** Create GitHub issue
- **Email:** support@fortheweebs.com
- **Docs:** See [DO_NOT_DELETE.md](DO_NOT_DELETE.md)

---

## 📜 License

Proprietary - All Rights Reserved

---

## 🎯 Mission

**Crush every overpriced creative software competitor.**

One price. All tools. Forever.

---

**Last Updated:** December 5, 2025  
**Version:** 2.0.0  
**Status:** Production Ready
- `database/` - Supabase schemas
- `.env` - Environment variables (not in git)
- `vercel.json` - Deployment config

## VIP Access

To grant someone VIP access, add their email to:

1. `src/utils/vipAccess.js` → `LIFETIME_VIP_EMAILS`
2. `src/components/AuthSupabase.jsx` → `VIP_EMAILS`

## Owner Access

If you get logged out, run in browser console:

```javascript
localStorage.setItem('ownerEmail', 'polotuspossumus@gmail.com');
localStorage.setItem('userId', 'owner');
location.reload();
```

## Documentation

All archived docs are in `docs/archive/` folder.
