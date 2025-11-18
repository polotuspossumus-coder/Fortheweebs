# CGI Video Effects Feature - GitHub Copilot Handoff

## 🎯 Feature Overview

**For:** $1000+ tier customers
**Purpose:** Real-time CGI effects, filters, and overlays for video calls and live streams
**Tech Stack:** WebRTC + Canvas API + Three.js + MediaStream API

---

## 📋 Architecture

```
User's Video Stream
    ↓
MediaStream Capture
    ↓
Canvas Processing Layer (CGI Effects Applied)
    ↓
Output Stream (Modified with CGI)
    ↓
WebRTC / Live Stream Platform
```

---

## 🏗️ Implementation Plan

### Phase 1: Video Stream Capture & Canvas Setup

**File:** `src/components/CGIVideoProcessor.jsx`

**What to build:**
1. Capture user's webcam via `navigator.mediaDevices.getUserMedia()`
2. Create hidden `<video>` element for source stream
3. Create `<canvas>` element for CGI processing
4. Set up 60fps rendering loop using `requestAnimationFrame`
5. Output modified stream via `canvas.captureStream()`

**Key APIs:**
- `getUserMedia()` - Capture webcam
- `canvas.captureStream()` - Convert canvas to MediaStream
- `requestAnimationFrame()` - 60fps render loop

---

### Phase 2: CGI Effects System

**File:** `src/effects/CGIEffects.js`

**Effects to implement:**

#### 1. Background Replacement
- Green screen removal using chroma keying
- Replace with custom images/videos
- Use `@vladmandic/face-api` (already installed) for person segmentation

#### 2. Face Filters
- AR masks (animal faces, glasses, hats)
- Beauty filters (smooth skin, adjust lighting)
- Color grading (vintage, neon, cyberpunk)

#### 3. 3D Objects & Overlays
- Use Three.js (already installed) for 3D rendering
- Add floating 3D objects around user
- Particles, explosions, magic effects

#### 4. Real-time Text Overlays
- Animated text messages
- Subtitles with custom fonts
- Emoji reactions

#### 5. Live Stream Enhancements
- Lower thirds (name badges)
- Transition effects
- Picture-in-picture layouts

**Example Effect Structure:**
```javascript
class CGIEffect {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  // Apply effect to current frame
  apply(imageData) {
    // Modify pixels here
    return modifiedImageData;
  }

  // Update effect parameters
  update(params) {
    this.params = { ...this.params, ...params };
  }
}
```

---

### Phase 3: Effect Controls UI

**File:** `src/components/CGIControls.jsx`

**UI Components:**
1. Effect selector (grid of effect thumbnails)
2. Intensity sliders (0-100%)
3. Color pickers for customization
4. Asset uploader (backgrounds, overlays)
5. Effect presets (save/load configurations)
6. Real-time preview

**State Management:**
```javascript
const [activeEffects, setActiveEffects] = useState([]);
const [effectParams, setEffectParams] = useState({});
const [isProcessing, setIsProcessing] = useState(false);
```

---

### Phase 4: WebRTC Integration

**File:** `src/components/CGIVideoCall.jsx`

**Integration points:**
1. Replace default webcam stream with CGI-processed stream
2. Works with any WebRTC library (simple-peer, PeerJS, etc.)
3. User can toggle effects on/off during call
4. Effects sync with screen sharing

**WebRTC Setup:**
```javascript
// Instead of:
const stream = await navigator.mediaDevices.getUserMedia({ video: true });

// Use:
const originalStream = await navigator.mediaDevices.getUserMedia({ video: true });
const processedStream = cgiProcessor.getOutputStream(); // CGI-modified stream
peerConnection.addStream(processedStream);
```

---

### Phase 5: Performance Optimization

**Critical for 60fps:**
1. **Use OffscreenCanvas** for background thread processing
2. **WebAssembly** for heavy pixel manipulation
3. **Web Workers** for face detection
4. **GPU acceleration** via WebGL shaders
5. **Adaptive quality** - reduce resolution if FPS drops

**Performance Monitoring:**
```javascript
let fps = 0;
let lastFrameTime = performance.now();

function renderLoop() {
  const now = performance.now();
  fps = 1000 / (now - lastFrameTime);

  if (fps < 30) {
    // Reduce quality or disable effects
    adaptQuality();
  }

  lastFrameTime = now;
  requestAnimationFrame(renderLoop);
}
```

---

## 🔐 Tier Enforcement

**Backend:** `api/user-tier.js` (already exists)

**Add to effect activation:**
```javascript
const checkCGIAccess = async (userId) => {
  const response = await fetch(`${API_URL}/api/user/${userId}/tier`);
  const { tier } = await response.json();

  if (tier !== 'super_admin') {
    throw new Error('CGI features require $1000/month tier');
  }
};
```

**In component:**
```javascript
useEffect(() => {
  const userId = localStorage.getItem('userId');
  checkCGIAccess(userId).catch(err => {
    setError('Upgrade to $1000/month for CGI features');
    setAccessDenied(true);
  });
}, []);
```

---

## 📦 File Structure

```
src/
├── components/
│   ├── CGIVideoProcessor.jsx      # Main video processing component
│   ├── CGIControls.jsx            # Effect controls UI
│   ├── CGIVideoCall.jsx           # WebRTC integration
│   └── CGIPreview.jsx             # Real-time preview window
├── effects/
│   ├── CGIEffect.js               # Base effect class
│   ├── BackgroundReplacement.js   # Chroma key effect
│   ├── FaceFilters.js             # AR masks & filters
│   ├── ThreeDOverlays.js          # 3D objects using Three.js
│   ├── TextOverlays.js            # Animated text
│   └── ColorGrading.js            # Color filters
├── workers/
│   ├── faceDetection.worker.js    # Face detection in background
│   └── imageProcessing.worker.js  # Heavy pixel operations
└── utils/
    ├── streamCapture.js           # MediaStream utilities
    ├── canvasUtils.js             # Canvas helpers
    └── performanceMonitor.js      # FPS tracking
```

---

## 🎨 Example Effects Library

### 1. Neon Glow Effect
```javascript
class NeonGlowEffect extends CGIEffect {
  apply(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.2 + 30);     // R
      data[i + 1] = Math.min(255, data[i + 1] * 1.5);  // G
      data[i + 2] = Math.min(255, data[i + 2] * 2);    // B
    }
    return imageData;
  }
}
```

### 2. Background Blur
```javascript
class BackgroundBlur extends CGIEffect {
  async apply(imageData) {
    // Use face-api to detect person
    const personMask = await this.detectPerson(imageData);

    // Blur everything except person
    const blurred = this.applyGaussianBlur(imageData, 20);

    // Composite person over blurred background
    return this.composite(blurred, imageData, personMask);
  }
}
```

### 3. Particle Explosion
```javascript
class ParticleExplosion extends CGIEffect {
  constructor(canvas, ctx) {
    super(canvas, ctx);
    this.particles = [];
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height);
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  }

  trigger() {
    // Spawn 100 particles
    for (let i = 0; i < 100; i++) {
      this.particles.push(new Particle());
    }
  }

  apply(imageData) {
    // Render Three.js particles over video
    this.renderer.render(this.scene, this.camera);
    return imageData;
  }
}
```

---

## 🧪 Testing Checklist

- [ ] Works with Chrome, Firefox, Edge
- [ ] Maintains 60fps at 1080p
- [ ] No memory leaks during 1hr+ calls
- [ ] Effects can be toggled mid-call
- [ ] Multiple effects can stack
- [ ] Graceful degradation on low-end devices
- [ ] Works with screen sharing
- [ ] Recording captures CGI effects
- [ ] Mobile support (iOS Safari, Chrome Android)

---

## 🚀 Deployment

### Backend Changes Needed
**None** - This is 100% client-side processing.

### Frontend Changes
1. Add CGI components to dashboard
2. Gate behind `tier === 'super_admin'` check
3. Add CGI toggle to video call UI
4. Deploy to Netlify (already set up)

---

## 📚 References & Resources

**Libraries (Already Installed):**
- `three` - 3D rendering
- `@vladmandic/face-api` - Face detection
- `@react-three/fiber` - React Three.js integration
- `@react-three/drei` - Three.js helpers

**APIs to Use:**
- [MediaStream API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_API)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)

**Effect Inspiration:**
- Snap Camera filters
- OBS Studio plugins
- TikTok effects
- Instagram AR filters
- Zoom virtual backgrounds

---

## 💰 Business Logic

**Tier Gate:**
- Free/Basic: No CGI access
- $9.99 Adult: No CGI access
- $19.99 Unlimited: No CGI access
- **$49.99 Super Admin: Full CGI access** ✅

**Upsell Opportunity:**
When non-super-admin users try to access CGI:
```javascript
<div className="cgi-upsell">
  <h2>🎬 CGI Video Effects</h2>
  <p>Transform your video calls with professional CGI effects!</p>
  <ul>
    <li>Custom backgrounds</li>
    <li>AR face filters</li>
    <li>3D overlays</li>
    <li>Live stream enhancements</li>
  </ul>
  <button onClick={upgradeTier}>
    Upgrade to Super Admin - $49.99/mo
  </button>
</div>
```

---

## 🎯 Next Steps for GitHub Copilot

1. **Start with:** `src/components/CGIVideoProcessor.jsx`
   - Implement basic video capture and canvas rendering
   - Get raw video stream displaying with no effects

2. **Then build:** `src/effects/CGIEffect.js`
   - Create base effect class
   - Implement one simple effect (e.g., grayscale)

3. **Add controls:** `src/components/CGIControls.jsx`
   - Effect on/off toggle
   - Intensity slider

4. **Integrate WebRTC:** `src/components/CGIVideoCall.jsx`
   - Replace normal stream with processed stream

5. **Optimize:** Workers, OffscreenCanvas, WebGL shaders

6. **Polish:** UI/UX, presets, mobile support

---

## ⚡ Quick Start Code

**Minimal CGI Video Processor (Starter Template):**

```javascript
import React, { useEffect, useRef, useState } from 'react';

export default function CGIVideoProcessor({ onStreamReady }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let animationId;

    const startProcessing = async () => {
      // Get webcam
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1920, height: 1080 }
      });

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = 1920;
      canvas.height = 1080;

      // Render loop
      const render = () => {
        // Draw video frame to canvas
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Apply CGI effects here
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // ... modify imageData ...
        ctx.putImageData(imageData, 0, 0);

        animationId = requestAnimationFrame(render);
      };

      render();

      // Output stream for WebRTC
      const outputStream = canvas.captureStream(60);
      onStreamReady(outputStream);
      setIsActive(true);
    };

    startProcessing();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ width: '100%', height: 'auto' }} />
      <p>Status: {isActive ? '🟢 Active' : '🔴 Inactive'}</p>
    </div>
  );
}
```

---

**That's everything GitHub Copilot needs to build the CGI video feature. Ready to implement!** 🚀
