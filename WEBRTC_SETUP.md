# 📞 WebRTC Video Call Setup Guide

Complete guide to implementing WebRTC signaling server and integrating video calls with CGI effects.

## 🎯 Overview

The video call system is **fully implemented on the frontend** with:
- ✅ WebRTC peer connection management
- ✅ CGI effects integration (24 effects)
- ✅ Screen sharing with effects
- ✅ Recording capability
- ✅ Tier enforcement (Super Admin only for CGI)

**What's needed**: Signaling server implementation for WebRTC signaling (SDP exchange & ICE candidates).

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   User A        │         │  Signaling       │         │   User B        │
│   Browser       │◄───────►│  Server          │◄───────►│   Browser       │
│                 │  Socket │  (Socket.io)     │  Socket │                 │
│ VideoCall.jsx   │         │                  │         │ VideoCall.jsx   │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                                                         │
        │                                                         │
        └────────── WebRTC Peer Connection (Direct) ─────────────┘
                    (Video/Audio/Data Streams)
```

### Flow:
1. **Signaling Server** coordinates connection setup via Socket.io
2. **WebRTC Peer Connection** handles actual media streaming (direct P2P)
3. **CGI Processing** happens locally before sending to peer

---

## 🚀 Quick Setup (5 steps)

### Step 1: Install Socket.io

```bash
npm install socket.io
```

### Step 2: Create Signaling Server

Create `api/signaling.js`:

```javascript
const express = require('express');
const router = express.Router();

// Store active calls and their participants
const activeCalls = new Map();

// Socket.io setup (called from server.js)
function setupSignaling(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join call
    socket.on('join-call', ({ callId, userId, userName }) => {
      socket.join(callId);

      if (!activeCalls.has(callId)) {
        activeCalls.set(callId, new Set());
      }

      const participants = activeCalls.get(callId);
      participants.add({ id: socket.id, userId, userName });

      // Notify others in call
      socket.to(callId).emit('user-joined', {
        id: socket.id,
        userId,
        userName
      });

      // Send current participants to new user
      socket.emit('current-participants', Array.from(participants));

      console.log(`User ${userName} joined call ${callId}`);
    });

    // WebRTC signaling - Offer
    socket.on('webrtc-offer', ({ callId, targetId, offer }) => {
      io.to(targetId).emit('webrtc-offer', {
        senderId: socket.id,
        offer
      });
    });

    // WebRTC signaling - Answer
    socket.on('webrtc-answer', ({ callId, targetId, answer }) => {
      io.to(targetId).emit('webrtc-answer', {
        senderId: socket.id,
        answer
      });
    });

    // WebRTC signaling - ICE Candidate
    socket.on('ice-candidate', ({ callId, targetId, candidate }) => {
      io.to(targetId).emit('ice-candidate', {
        senderId: socket.id,
        candidate
      });
    });

    // Leave call
    socket.on('leave-call', ({ callId }) => {
      socket.to(callId).emit('user-left', { id: socket.id });
      socket.leave(callId);

      const participants = activeCalls.get(callId);
      if (participants) {
        participants.delete(socket.id);
        if (participants.size === 0) {
          activeCalls.delete(callId);
        }
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);

      // Remove from all calls
      activeCalls.forEach((participants, callId) => {
        if (participants.has(socket.id)) {
          participants.delete(socket.id);
          io.to(callId).emit('user-left', { id: socket.id });

          if (participants.size === 0) {
            activeCalls.delete(callId);
          }
        }
      });
    });
  });
}

// REST endpoints for call management
router.post('/create', async (req, res) => {
  try {
    const { creatorId, participants } = req.body;
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store call in database (optional)
    // await db.calls.create({ id: callId, creatorId, participants });

    res.json({
      success: true,
      callId,
      participants
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:callId', async (req, res) => {
  try {
    const { callId } = req.params;

    // Fetch from database or active calls
    const participants = activeCalls.get(callId);

    if (!participants) {
      return res.status(404).json({ error: 'Call not found' });
    }

    res.json({
      callId,
      participants: Array.from(participants)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { router, setupSignaling };
```

### Step 3: Update server.js

Add Socket.io support:

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { router: signalingRouter, setupSignaling } = require('./api/signaling');

const app = express();
const server = http.createServer(app);

// Setup Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Setup signaling
setupSignaling(io);

// Mount REST routes
app.use('/api/calls', signalingRouter);

// ... rest of your server.js

// Use server.listen instead of app.listen
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
```

### Step 4: Update VideoCall.jsx

Replace the stub `sendSignal` function with Socket.io:

```javascript
import { io } from 'socket.io-client';

// At component level
const [socket, setSocket] = useState(null);

useEffect(() => {
  // Connect to signaling server
  const newSocket = io(import.meta.env.VITE_API_URL.replace('/api', ''));

  newSocket.on('connect', () => {
    console.log('Connected to signaling server');

    // Join call
    newSocket.emit('join-call', {
      callId,
      userId: user?.id,
      userName: user?.name
    });
  });

  // Listen for new users
  newSocket.on('user-joined', ({ id, userId, userName }) => {
    console.log('User joined:', userName);
    createPeerConnection(id);
  });

  // Listen for WebRTC offers
  newSocket.on('webrtc-offer', async ({ senderId, offer }) => {
    const pc = peerConnectionsRef.current[senderId] || createPeerConnection(senderId);

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    newSocket.emit('webrtc-answer', {
      callId,
      targetId: senderId,
      answer
    });
  });

  // Listen for WebRTC answers
  newSocket.on('webrtc-answer', async ({ senderId, answer }) => {
    const pc = peerConnectionsRef.current[senderId];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  });

  // Listen for ICE candidates
  newSocket.on('ice-candidate', async ({ senderId, candidate }) => {
    const pc = peerConnectionsRef.current[senderId];
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  });

  // Listen for user leaving
  newSocket.on('user-left', ({ id }) => {
    console.log('User left:', id);
    if (peerConnectionsRef.current[id]) {
      peerConnectionsRef.current[id].close();
      delete peerConnectionsRef.current[id];
    }
  });

  setSocket(newSocket);

  return () => {
    newSocket.emit('leave-call', { callId });
    newSocket.close();
  };
}, [callId]);

// Replace sendSignal function
const sendSignal = (targetId, data) => {
  if (!socket) return;

  if (data.type === 'offer') {
    socket.emit('webrtc-offer', { callId, targetId, offer: data.offer });
  } else if (data.type === 'answer') {
    socket.emit('webrtc-answer', { callId, targetId, answer: data.answer });
  } else if (data.type === 'candidate') {
    socket.emit('ice-candidate', { callId, targetId, candidate: data.candidate });
  }
};
```

### Step 5: Add socket.io-client to Frontend

```bash
cd src
npm install socket.io-client
```

---

## 🎮 Testing

### 1. Start Backend
```bash
node server.js
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Create a Call

Option A - Direct navigation:
```
http://localhost:5173/call/test-call-123
```

Option B - Programmatic:
```javascript
const response = await fetch('/api/calls/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    creatorId: user.id,
    participants: [{ id: 'user2', name: 'Alice' }]
  })
});

const { callId } = await response.json();
navigate(`/call/${callId}`);
```

### 4. Open in Two Tabs

- Tab 1: `http://localhost:5173/call/test-call-123`
- Tab 2: `http://localhost:5173/call/test-call-123`

Both should connect via WebRTC and see each other's video!

---

## 🎨 CGI Effects in Calls

### Enable CGI (Super Admin Only)

1. Click the **"✨ CGI"** button in call controls
2. CGI panel opens on the right
3. Add effects (any of the 24 available)
4. Effects are applied in real-time to your outgoing video
5. Other participants see your video with effects

### Recording with Effects

1. Enable CGI effects
2. Open CGI panel
3. Scroll down to **🎬 Recording** section
4. Click **"⏺️ Start Recording"**
5. Recording captures video with all active effects
6. Click **"⏹️ Stop Recording"** to download WebM file

### Screen Share with Effects

1. Click **"🖥️"** button in call controls
2. Select window/screen to share
3. If CGI is enabled, effects are applied to screen share too
4. Click again to return to camera

---

## 🔐 Security Considerations

### 1. Authentication

Add authentication to call endpoints:

```javascript
const { verifyToken } = require('./middleware/auth');

router.post('/create', verifyToken, async (req, res) => {
  // Only authenticated users can create calls
});

router.get('/:callId', verifyToken, async (req, res) => {
  // Only call participants can access
  const isParticipant = await checkParticipant(req.user.id, req.params.callId);
  if (!isParticipant) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  // ...
});
```

### 2. Socket Authentication

```javascript
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  try {
    const user = await verifyToken(token);
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});
```

### 3. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const callLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // Max 10 calls per 15 minutes
});

router.post('/create', callLimiter, async (req, res) => {
  // ...
});
```

---

## 🌐 Production Deployment

### Railway Deployment

1. **Add Socket.io to package.json** (already installed in Step 1)

2. **Update Procfile**:
```
web: node server.js
```

3. **Environment Variables** (Railway dashboard):
```
FRONTEND_URL=https://yourapp.netlify.app
NODE_ENV=production
```

4. **Deploy**:
```bash
git add .
git commit -m "feat: Add WebRTC signaling server"
git push railway main
```

### Netlify Environment

Update Netlify env var:
```
VITE_API_URL=https://your-railway-app.up.railway.app/api
```

### TURN Server (for NAT traversal)

Free STUN servers work for most cases. For production, add TURN server:

```javascript
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ]
};
```

**Free TURN providers**:
- [Twilio TURN](https://www.twilio.com/stun-turn)
- [Xirsys](https://xirsys.com/)
- [Metered TURN](https://www.metered.ca/tools/openrelay/)

---

## 📊 Performance Optimization

### 1. Reduce Video Resolution

For better performance with CGI effects:

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 1280 },  // Lower to 854 for weaker devices
    height: { ideal: 720 },  // Lower to 480
    frameRate: { ideal: 30 } // Keep at 30, don't go higher
  },
  audio: true
});
```

### 2. Adaptive Bitrate

```javascript
const sender = pc.getSenders().find(s => s.track?.kind === 'video');
const params = sender.getParameters();

if (!params.encodings) {
  params.encodings = [{}];
}

params.encodings[0].maxBitrate = 2500000; // 2.5 Mbps

await sender.setParameters(params);
```

### 3. Selective Effect Loading

Only load face detection models when face effects are used:

```javascript
// Models are lazy-loaded in FaceDetectionEffect.loadModels()
// Called only when first face effect is added
```

---

## 🐛 Troubleshooting

### Issue: "Connection failed"

**Causes**:
- Signaling server not running
- CORS misconfiguration
- Socket.io version mismatch

**Fix**:
```bash
# Check server logs
node server.js

# Verify Socket.io connection in browser console
# Should see: "Connected to signaling server"
```

### Issue: "ICE connection failed"

**Causes**:
- Symmetric NAT (both users behind strict firewalls)
- No TURN server configured

**Fix**:
- Add TURN server to rtcConfig (see Production Deployment section)
- Test with one user on mobile data (different network)

### Issue: "Video not showing"

**Causes**:
- Camera permission denied
- Track not added to peer connection
- Remote stream not assigned to video element

**Fix**:
```javascript
// Check tracks
pc.getSenders().forEach(sender => {
  console.log('Sending:', sender.track);
});

pc.getReceivers().forEach(receiver => {
  console.log('Receiving:', receiver.track);
});
```

### Issue: "CGI effects lagging in call"

**Causes**:
- Too many effects active
- High video resolution
- Weak CPU/GPU

**Fix**:
- Use max 2-3 effects simultaneously
- Lower resolution to 720p or 480p
- Disable face detection effects (most CPU-intensive)

---

## 📚 Additional Resources

- [WebRTC API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [STUN/TURN Explained](https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/)

---

## 🎉 You're Ready!

Your video call system is now complete with:
- ✅ WebRTC peer connections
- ✅ Signaling server (Socket.io)
- ✅ 24 CGI effects
- ✅ Screen sharing
- ✅ Recording
- ✅ Tier enforcement

**Next Steps**:
1. Implement signaling server (5 minutes)
2. Test with two browser tabs
3. Deploy to Railway + Netlify
4. Add TURN server for production
5. Invite users and enjoy! 🚀
