import express from 'express';
import User from '../models/User';

export const auditLog = express.Router().get('/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).send('User not found');
  res.status(200).json(user.log);
});
