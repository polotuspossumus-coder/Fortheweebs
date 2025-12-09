/**
 * Collaboration Ghosts API
 * Multiplayer real-time editing cursors and presence
 */

const express = require('express');
const router = express.Router();

/**
 * Join Session
 * POST /api/collaboration-ghosts/join
 */
router.post('/join', async (req, res) => {
    try {
        const { sessionId, userId, username } = req.body;

        if (!sessionId || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const ghostId = `ghost_${userId}_${Date.now()}`;

        res.json({
            ghostId,
            sessionId,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
            joined: true
        });
    } catch (error) {
        console.error('Join collaboration ghosts error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Update Cursor Position
 * POST /api/collaboration-ghosts/cursor
 */
router.post('/cursor', async (req, res) => {
    try {
        const { ghostId, x, y } = req.body;

        if (!ghostId || x === undefined || y === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        res.json({ success: true, ghostId, position: { x, y } });
    } catch (error) {
        console.error('Update cursor error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
