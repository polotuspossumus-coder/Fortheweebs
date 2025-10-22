import express from 'express';
import { canMessage } from '../utils/canMessage.js';
// Placeholder for sendMessage utility
async function sendMessage(senderId, receiverId, message) {
  // TODO: Implement actual message sending logic
  return true;
}

const router = express.Router();

router.post('/dm/:receiverId', async (req, res) => {
  const senderId = req.user.id;
  const receiverId = req.params.receiverId;

  if (!canMessage(senderId, receiverId)) {
    return res.status(403).json({ error: 'Blocked: No interaction allowed.' });
  }

  await sendMessage(senderId, receiverId, req.body.message);
  res.status(200).json({ message: 'Message sent.' });
});

export default router;
