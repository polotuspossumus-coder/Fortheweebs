import express from 'express';
import { WebSocketServer } from 'ws';

const router = express.Router();

// In-memory storage for rooms (use Redis in production)
const rooms = new Map();

// WebSocket server setup (called from server.js)
export function setupCollaborationWS(server) {
  const wss = new WebSocketServer({ server, path: '/collaboration' });

  wss.on('connection', (ws) => {
    let currentRoom = null;
    let userId = null;

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);

        switch (data.type) {
          case 'join':
            handleJoin(ws, data);
            break;
          case 'chat':
            handleChat(data);
            break;
          case 'draw':
            handleDraw(data);
            break;
          case 'clear-canvas':
            handleClearCanvas(data);
            break;
          case 'offer':
          case 'answer':
          case 'ice-candidate':
            handleWebRTC(data);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (currentRoom && userId) {
        handleLeave(currentRoom, userId);
      }
    });

    function handleJoin(ws, data) {
      const { roomId, user } = data;
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          participants: [],
          connections: []
        });
      }

      const room = rooms.get(roomId);
      
      // Add user to room
      room.participants.push(user);
      room.connections.push({ userId: user.id, ws });
      
      currentRoom = roomId;
      userId = user.id;

      // Send current participants to new user
      ws.send(JSON.stringify({
        type: 'participants',
        participants: room.participants
      }));

      // Notify others about new user
      broadcast(roomId, {
        type: 'user-joined',
        user
      }, user.id);
    }

    function handleLeave(roomId, userId) {
      const room = rooms.get(roomId);
      if (!room) return;

      const user = room.participants.find(p => p.id === userId);
      
      room.participants = room.participants.filter(p => p.id !== userId);
      room.connections = room.connections.filter(c => c.userId !== userId);

      // Clean up empty rooms
      if (room.participants.length === 0) {
        rooms.delete(roomId);
      } else {
        broadcast(roomId, {
          type: 'user-left',
          userId,
          username: user?.username
        });
      }
    }

    function handleChat(data) {
      broadcast(data.roomId, {
        type: 'chat',
        message: data.message,
        user: data.user,
        timestamp: Date.now()
      });
    }

    function handleDraw(data) {
      broadcast(data.roomId, {
        type: 'draw',
        action: data.action,
        x: data.x,
        y: data.y,
        tool: data.tool,
        color: data.color,
        brushSize: data.brushSize
      }, userId);
    }

    function handleClearCanvas(data) {
      broadcast(data.roomId, {
        type: 'clear-canvas'
      }, userId);
    }

    function handleWebRTC(data) {
      const room = rooms.get(data.roomId);
      if (!room) return;

      const targetConnection = room.connections.find(c => c.userId === data.targetId);
      if (targetConnection) {
        targetConnection.ws.send(JSON.stringify({
          ...data,
          fromId: userId
        }));
      }
    }

    function broadcast(roomId, message, excludeUserId = null) {
      const room = rooms.get(roomId);
      if (!room) return;

      const messageStr = JSON.stringify(message);
      
      room.connections.forEach(({ userId: id, ws }) => {
        if (id !== excludeUserId && ws.readyState === 1) {
          ws.send(messageStr);
        }
      });
    }
  });

  return wss;
}

// REST endpoints for room management
router.get('/rooms', (req, res) => {
  const roomList = Array.from(rooms.entries()).map(([id, room]) => ({
    id,
    participants: room.participants.length
  }));
  
  res.json(roomList);
});

router.post('/rooms', (req, res) => {
  const { roomId } = req.body;
  
  if (!roomId) {
    return res.status(400).json({ error: 'Room ID required' });
  }

  if (rooms.has(roomId)) {
    return res.status(409).json({ error: 'Room already exists' });
  }

  rooms.set(roomId, {
    participants: [],
    connections: []
  });

  res.json({ success: true, roomId });
});

router.get('/rooms/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json({
    id: req.params.roomId,
    participants: room.participants
  });
});

router.delete('/rooms/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  // Close all connections
  room.connections.forEach(({ ws }) => {
    ws.close();
  });

  rooms.delete(req.params.roomId);
  res.json({ success: true });
});

export default router;
