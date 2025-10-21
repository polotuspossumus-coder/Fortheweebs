import process from 'process';

import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import jwt from 'jsonwebtoken';
import { logLedger } from '../utils/ledger.js';

const router = express.Router();
const users = [];

router.post('/signup', (req, res) => {
  const { username, role } = req.body;
  const user = { id: users.length + 1, username, role };
  users.push(user);

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  logLedger('user_signup', user.id, user.id, { role });
  res.json({ token });
});

router.post('/login', (req, res) => {
  const { username } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).send('User not found');

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  logLedger('user_login', user.id, user.id, {});
  res.json({ token });
});

export default router;
