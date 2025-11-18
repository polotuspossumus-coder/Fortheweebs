const express = require('express');
const router = express.Router();

// Store active calls and their participants
const activeCalls = new Map();

/**
 * Socket.io Signaling Setup
 * Handles WebRTC signaling for video calls
 */
function setupSignaling(io) {
  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    // Join call
    socket.on('join-call', ({ callId, userId, userName }) => {
      socket.join(callId);

      if (!activeCalls.has(callId)) {
        activeCalls.set(callId, new Map());
      }

      const participants = activeCalls.get(callId);
      participants.set(socket.id, { userId, userName, socketId: socket.id });

      // Notify others in call
      socket.to(callId).emit('user-joined', {
        id: socket.id,
        userId,
        userName
      });

      // Send current participants to new user
      const participantList = Array.from(participants.values());
      socket.emit('current-participants', participantList);

      console.log(`📞 ${userName} joined call ${callId} (${participants.size} participants)`);
    });

    // WebRTC signaling - Offer
    socket.on('webrtc-offer', ({ callId, targetId, offer }) => {
      console.log(`📤 Forwarding offer from ${socket.id} to ${targetId}`);
      io.to(targetId).emit('webrtc-offer', {
        senderId: socket.id,
        offer
      });
    });

    // WebRTC signaling - Answer
    socket.on('webrtc-answer', ({ callId, targetId, answer }) => {
      console.log(`📤 Forwarding answer from ${socket.id} to ${targetId}`);
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
      handleUserLeave(socket, callId, io);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);

      // Remove from all calls
      activeCalls.forEach((participants, callId) => {
        if (participants.has(socket.id)) {
          handleUserLeave(socket, callId, io);
        }
      });
    });
  });
}

/**
 * Handle user leaving call
 */
function handleUserLeave(socket, callId, io) {
  const participants = activeCalls.get(callId);
  if (!participants) return;

  const user = participants.get(socket.id);
  participants.delete(socket.id);

  // Notify others
  socket.to(callId).emit('user-left', { id: socket.id });
  socket.leave(callId);

  console.log(`👋 ${user?.userName || socket.id} left call ${callId} (${participants.size} remaining)`);

  // Clean up empty calls
  if (participants.size === 0) {
    activeCalls.delete(callId);
    console.log(`🗑️ Deleted empty call ${callId}`);
  }
}

/**
 * REST Endpoints
 */

// Create new call
router.post('/create', async (req, res) => {
  try {
    const { creatorId, participants = [] } = req.body;
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store call metadata (optional - can save to database)
    const callData = {
      id: callId,
      creatorId,
      participants,
      createdAt: new Date().toISOString()
    };

    console.log(`🆕 Created call ${callId}`);

    res.json({
      success: true,
      callId,
      participants,
      createdAt: callData.createdAt
    });
  } catch (error) {
    console.error('Failed to create call:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get call details
router.get('/:callId', async (req, res) => {
  try {
    const { callId } = req.params;

    // Get active participants
    const participants = activeCalls.get(callId);

    if (!participants) {
      // Call exists but no one is in it yet
      return res.json({
        callId,
        participants: [],
        active: false
      });
    }

    const participantList = Array.from(participants.values());

    res.json({
      callId,
      participants: participantList,
      active: true,
      participantCount: participantList.length
    });
  } catch (error) {
    console.error('Failed to get call:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all active calls (admin only)
router.get('/admin/active', async (req, res) => {
  try {
    const calls = [];

    activeCalls.forEach((participants, callId) => {
      calls.push({
        callId,
        participantCount: participants.size,
        participants: Array.from(participants.values())
      });
    });

    res.json({
      totalCalls: calls.length,
      calls
    });
  } catch (error) {
    console.error('Failed to get active calls:', error);
    res.status(500).json({ error: error.message });
  }
});

// End call (admin only)
router.delete('/:callId', async (req, res) => {
  try {
    const { callId } = req.params;

    const participants = activeCalls.get(callId);
    if (!participants) {
      return res.status(404).json({ error: 'Call not found' });
    }

    // Notify all participants that call was ended
    // (Would need access to io instance - can enhance later)

    activeCalls.delete(callId);

    res.json({
      success: true,
      message: `Call ${callId} ended`
    });
  } catch (error) {
    console.error('Failed to end call:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = { router, setupSignaling };
