# 🎬 ForTheWeebs - Creator Platform with CGI Effects

Full-featured creator platform with **24 real-time CGI video effects**, **AI assistant (Mico)**, **WebRTC video calls**, and **tiered monetization**.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Face detection models auto-download via postinstall
# (or run manually: npm run setup)

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials (see below)

# Run dev environment
npm run dev:all
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

### Environment Variables

Create `.env` in project root:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
VITE_STRIPE_PUBLISHABLE_KEY=your_publishable_key

# Anthropic (for Mico AI)
ANTHROPIC_API_KEY=your_anthropic_api_key

# URLs
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:3001/api

NODE_ENV=development
```

---

## ✨ Feature Highlights

### 🎨 24 Real-Time CGI Effects (60 FPS)
- **Basic**: Grayscale, brightness, color tint, neon glow, vintage, pixelate
- **Background**: Blur, vignette
- **Text**: Animated overlays, lower thirds, emoji rain
- **3D**: Cube, particles, ring, hearts, stars (Three.js)
- **Face AR**: Glasses, mustache, hat, anime eyes, beautify, smart blur (face-api.js)

### 🎯 12 Professional Presets
One-click styles: Professional, Fun, Anime, Retro, Minimal, Streamer, Cyberpunk, Mysterious, Celebration, Comedy, Dreamy, Gaming

### 🧠 Mico AI Assistant
- Claude-powered chat
- Voice-controlled CGI effects
- File system operations
- Command execution

### 📞 WebRTC Video Calls
- Real-time CGI in calls
- Screen sharing with effects
- Recording (WebM 5Mbps)
- Socket.io signaling

### 💳 Tiered Monetization
- Free, Pro ($9.99), Super Admin ($49.99)
- Stripe integration
- Family access codes

---

## 📁 Project Structure

```
fortheweebs/
├── api/                          # Express backend
│   ├── mico/                     # AI assistant endpoints
│   │   ├── chat.js              # Claude chat
│   │   ├── cgi-command.js       # Voice CGI control
│   │   └── ...
│   ├── signaling.js             # WebRTC signaling (Socket.io)
│   ├── stripe.js                # Payments
│   └── ...
│
├── src/
│   ├── components/
│   │   ├── CGIVideoProcessor.jsx    # Core 60fps processor
│   │   ├── CGIControls.jsx          # Effect controls
│   │   ├── CGIPresets.jsx           # Preset selector
│   │   ├── CGIRecorder.jsx          # Recording
│   │   ├── VideoCall.jsx            # WebRTC UI
│   │   └── ...
│   ├── effects/                 # Effect classes
│   │   ├── CGIEffect.js             # Base
│   │   ├── BackgroundEffects.js     # Blur, vignette
│   │   ├── TextOverlayEffect.js     # Text, emoji
│   │   ├── ThreeDEffects.js         # 3D (Three.js)
│   │   └── FaceDetectionEffects.js  # AR (face-api)
│   ├── hooks/
│   │   └── useMicoCGI.js           # Mico integration
│   ├── utils/
│   │   └── cgiPresets.js           # Preset defs
│   └── pages/
│       ├── CGIDemo.jsx
│       └── VideoCallPage.jsx
│
├── scripts/
│   └── download-face-models.js  # Auto-fetch models
│
├── public/models/               # face-api.js models (~12MB)
│
├── server.js                    # Express + Socket.io
├── package.json
│
└── docs/
    ├── FACE_DETECTION_SETUP.md
    ├── WEBRTC_SETUP.md
    └── RAILWAY_SETUP.md
```

---

## 📖 Documentation

### Setup Guides

1. **FACE_DETECTION_SETUP.md** - Face AR effects setup
2. **WEBRTC_SETUP.md** - Video call signaling (5-step Socket.io setup)
3. **RAILWAY_SETUP.md** - Production deployment

### API Examples

**Mico AI:**
```javascript
// Voice control CGI
POST /api/mico/cgi-command
Body: { command: "add neon glow" }

// Chat
POST /api/mico/chat
Body: { message: "Hello", history: [] }
```

**Video Calls:**
```javascript
// Create call
POST /api/calls/create
Body: { creatorId: "user123" }

// WebSocket signaling
ws://localhost:3001
Events: join-call, webrtc-offer, webrtc-answer
```

### Usage Example

```javascript
import { useRef } from 'react';
import CGIVideoProcessor from './components/CGIVideoProcessor';
import { applyPreset } from './utils/cgiPresets';

function App() {
  const processorRef = useRef(null);

  return (
    <>
      <CGIVideoProcessor ref={processorRef} />
      <button onClick={() =>
        processorRef.current?.addEffectById('neonglow')
      }>
        Add Neon
      </button>
      <button onClick={() =>
        applyPreset(processorRef, 'cyberpunk')
      }>
        Cyberpunk Preset
      </button>
    </>
  );
}
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 7, Three.js, face-api.js, Canvas API
- **Backend**: Node.js 20, Express 4, Socket.io
- **AI**: Anthropic Claude (Mico assistant)
- **Payments**: Stripe
- **Database**: Supabase
- **Deployment**: Netlify (frontend), Railway (backend)

---

## 🚀 Deployment

### Netlify (Frontend)
```bash
Build: npm run build
Publish: dist
Env vars: VITE_SUPABASE_URL, VITE_API_URL, etc.
```

### Railway (Backend)
```bash
Procfile: web: node server.js
Env vars: ANTHROPIC_API_KEY, STRIPE_SECRET_KEY, etc.
Deploy: git push railway main
```

### Socket.io Setup
See **WEBRTC_SETUP.md** for complete 5-step guide.

---

## 🐛 Troubleshooting

**Models not loading?**
```bash
npm run setup
ls public/models/  # Should see 9 files
```

**WebRTC failing?**
```bash
npm install socket.io socket.io-client
npm run dev:server  # Should see: "✅ WebRTC signaling server initialized"
```

**Effects lagging?**
- Use max 2-3 effects
- Lower resolution
- Disable face detection effects

---

## 🎯 Scripts

```bash
npm run dev              # Frontend only
npm run dev:server       # Backend only
npm run dev:all          # Both concurrently
npm run build            # Production build
npm run server           # Production server
npm run setup            # Download face models
npm run lint             # ESLint
npm test                 # Vitest
```

---

## 📊 System Stats

- ✅ 24 real-time CGI effects
- ✅ 12 professional presets
- ✅ 60 FPS processing
- ✅ Voice control (Mico AI)
- ✅ WebRTC video calls
- ✅ Screen sharing
- ✅ Recording (WebM 5Mbps)
- ✅ Stripe monetization
- ✅ Face detection AR
- ✅ 3D effects (Three.js)

---

## 🤝 Contributing

1. Fork repo
2. Create branch (`git checkout -b feature/amazing`)
3. Commit (`git commit -m 'Add feature'`)
4. Push (`git push origin feature/amazing`)
5. Open PR

---

## 📄 License

MIT License

---

## 🙏 Credits

- **Anthropic Claude** - AI (Mico)
- **@vladmandic/face-api** - Face detection
- **Three.js** - 3D graphics
- **Stripe** - Payments
- **Supabase** - Database
- **Railway** - Backend hosting
- **Netlify** - Frontend hosting

---

## 📞 Support

- 🐛 [Issues](https://github.com/yourusername/fortheweebs/issues)
- 📖 [Docs](./docs/)

---

Built with ❤️ for creators
