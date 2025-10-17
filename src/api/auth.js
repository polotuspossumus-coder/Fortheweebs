import express from 'express';
import User from '../models/User';

export const registerUser = express.Router().post('/register', async (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
    license: req.body.license || 'Custom',
    log: [`Registered at ${new Date().toISOString()}`],
  });
  await user.save();
  res.status(201).json({ id: user._id });
});

export const loginUser = express.Router().post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user || user.password !== req.body.password || user.banned) {
    return res.status(403).send('Access denied');
  }
  user.log.push(`Logged in at ${new Date().toISOString()}`);
  await user.save();
  res.status(200).json({ id: user._id });
});
