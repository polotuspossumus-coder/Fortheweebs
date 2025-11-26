const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { WebSocketServer } = require('ws');

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Store active rooms and connections
const activeRooms = new Map();

// Middleware to verify authentication
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Get all collaboration rooms
router.get('/rooms', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, active_only } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('collaboration_rooms')
      .select('*, owner:profiles!owner_id(*), members:room_members(user:profiles(*))', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (active_only === 'true') {
      query = query.eq('active', true);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Add active user counts from WebSocket
    const rooms = data.map(room => ({
      ...room,
      active_users: activeRooms.get(room.id)?.size || 0
    }));

    res.json({
      rooms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Get single room
router.get('/rooms/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('collaboration_rooms')
      .select('*, owner:profiles!owner_id(*), members:room_members(user:profiles(*))')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Check if user has access
    const isMember = data.members.some(m => m.user.id === req.user.id);
    const isOwner = data.owner_id === req.user.id;

    if (!isOwner && !isMember && !data.public) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      room: {
        ...data,
        active_users: activeRooms.get(id)?.size || 0
      }
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// Create collaboration room
router.post('/rooms', requireAuth, async (req, res) => {
  try {
    const { name, description, public_room, project_type } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const { data, error } = await supabase
      .from('collaboration_rooms')
      .insert({
        owner_id: req.user.id,
        name,
        description,
        public: public_room || false,
        project_type: project_type || 'general',
        active: true
      })
      .select()
      .single();

    if (error) throw error;

    // Add owner as member
    await supabase
      .from('room_members')
      .insert({
        room_id: data.id,
        user_id: req.user.id,
        role: 'owner'
      });

    res.status(201).json({ room: data });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Update room
router.patch('/rooms/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify ownership
    const { data: room } = await supabase
      .from('collaboration_rooms')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!room || room.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('collaboration_rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ room: data });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

// Delete room
router.delete('/rooms/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: room } = await supabase
      .from('collaboration_rooms')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!room || room.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { error } = await supabase
      .from('collaboration_rooms')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Close all WebSocket connections for this room
    if (activeRooms.has(id)) {
      const connections = activeRooms.get(id);
      connections.forEach(ws => ws.close());
      activeRooms.delete(id);
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

// Add member to room
router.post('/rooms/:id/members', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, role } = req.body;

    // Verify ownership
    const { data: room } = await supabase
      .from('collaboration_rooms')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!room || room.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('room_members')
      .insert({
        room_id: id,
        user_id,
        role: role || 'member'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ member: data });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Remove member from room
router.delete('/rooms/:id/members/:user_id', requireAuth, async (req, res) => {
  try {
    const { id, user_id } = req.params;

    // Verify ownership
    const { data: room } = await supabase
      .from('collaboration_rooms')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!room || room.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { error } = await supabase
      .from('room_members')
      .delete()
      .eq('room_id', id)
      .eq('user_id', user_id);

    if (error) throw error;

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Get room assets
router.get('/rooms/:id/assets', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('room_assets')
      .select('*, uploaded_by:profiles!uploaded_by(*)')
      .eq('room_id', id)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    res.json({ assets: data });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Upload asset to room
router.post('/rooms/:id/assets', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, type, size } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('room_assets')
      .insert({
        room_id: id,
        uploaded_by: req.user.id,
        name,
        url,
        type: type || 'file',
        size: size || 0
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ asset: data });
  } catch (error) {
    console.error('Error uploading asset:', error);
    res.status(500).json({ error: 'Failed to upload asset' });
  }
});

// WebSocket handler for real-time collaboration
function setupCollaborationWebSocket(wss) {
  wss.on('connection', async (ws, req) => {
    try {
      // Extract token and room ID from URL
      const url = new URL(req.url, 'http://localhost');
      const token = url.searchParams.get('token');
      const roomId = url.searchParams.get('room');

      if (!token || !roomId) {
        ws.close(1008, 'Missing token or room ID');
        return;
      }

      // Verify token
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        ws.close(1008, 'Invalid token');
        return;
      }

      // Add to active room
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, new Set());
      }
      activeRooms.get(roomId).add(ws);

      ws.userId = user.id;
      ws.roomId = roomId;

      // Broadcast user joined
      broadcast(roomId, {
        type: 'user_joined',
        user_id: user.id,
        timestamp: new Date().toISOString()
      }, ws);

      // Handle messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          broadcast(roomId, {
            ...message,
            user_id: user.id,
            timestamp: new Date().toISOString()
          }, ws);
        } catch (err) {
          console.error('Message parse error:', err);
        }
      });

      // Handle disconnect
      ws.on('close', () => {
        if (activeRooms.has(roomId)) {
          activeRooms.get(roomId).delete(ws);
          if (activeRooms.get(roomId).size === 0) {
            activeRooms.delete(roomId);
          } else {
            broadcast(roomId, {
              type: 'user_left',
              user_id: user.id,
              timestamp: new Date().toISOString()
            });
          }
        }
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(1011, 'Internal server error');
    }
  });
}

// Broadcast to all users in a room
function broadcast(roomId, message, excludeWs = null) {
  if (!activeRooms.has(roomId)) return;

  const connections = activeRooms.get(roomId);
  const messageStr = JSON.stringify(message);

  connections.forEach(ws => {
    if (ws !== excludeWs && ws.readyState === 1) { // OPEN
      ws.send(messageStr);
    }
  });
}

export default router;
