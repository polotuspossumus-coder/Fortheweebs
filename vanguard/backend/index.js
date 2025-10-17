// Remix API
const remixRouter = require('./api/remix');
app.use('/api/remix', remixRouter);
// Advanced media tools APIs
const mixRouter = require('./api/mix');
const imageEditRouter = require('./api/image-edit');
const videoEditRouter = require('./api/video-edit');
app.use('/api/mix', mixRouter);
app.use('/api/image-edit', imageEditRouter);
app.use('/api/video-edit', videoEditRouter);
// Soundboard API
const soundboardRouter = require('./api/soundboard');
app.use('/api/soundboard', soundboardRouter);
// POST /api/meme - meme generation
app.post('/api/meme', express.json({ limit: '2mb' }), async (req, res) => {
  try {
    const { topText, bottomText, imageUrl } = req.body;
    // TODO: Replace with real meme engine
    const memeEngine = {
      generate: async ({ topText, bottomText, imageUrl }) => {
        // Return a dummy meme URL for now
        return `/memes/generated?top=${encodeURIComponent(topText)}&bottom=${encodeURIComponent(bottomText)}&img=${encodeURIComponent(imageUrl)}`;
      }
    };
    const meme = await memeEngine.generate({ topText, bottomText, imageUrl });
    res.json({ meme });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const generatePreview = require('./utils/preview');
const autoFlag = require('./utils/autoFlag');
// POST /api/ingest - accept multiple files, generate preview, auto-flag, and save
app.post('/api/ingest', express.json({ limit: '50mb' }), async (req, res) => {
  try {
    if (!Array.isArray(req.body.files)) return res.status(400).json({ error: 'Missing files array' });
    const files = req.body.files.map(file => {
      const preview = generatePreview(file);
      const flagged = autoFlag(file);
      return { ...file, preview, flagged };
    });
    // Save to DB
    const { Low, JSONFile } = require('lowdb');
    const path = require('path');
    const dbFile = path.join(__dirname, '../../../media/vanguard-meta.json');
    const adapter = new JSONFile(dbFile);
    const db = new Low(adapter);
    await db.read();
    db.data.files.push(...files);
    await db.write();
    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET /api/user-access - return user payment tier (mocked)
app.get('/api/user-access', async (req, res) => {
  // TODO: Replace with real user lookup/auth
  // For now, mock a user with tier '100' (full access)
  const user = { id: 'demo', paymentTier: '100' };
  res.json({ tier: user.paymentTier });
});
// GET /api/moderation-queue - list pending/flagged files
app.get('/api/moderation-queue', async (req, res) => {
  try {
    const { Low, JSONFile } = require('lowdb');
    const path = require('path');
    const dbFile = path.join(__dirname, '../../../media/vanguard-meta.json');
    const adapter = new JSONFile(dbFile);
    const db = new Low(adapter);
    await db.read();
    const queue = (db.data.files || []).filter(f => f.status === 'pending' || f.status === 'flagged' || !f.status);
    res.json(queue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// PATCH /api/moderate/:id - single moderation
app.patch('/api/moderate/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const id = req.params.id;
    if (!status || !id) return res.status(400).json({ error: 'Missing status or id' });
    const { Low, JSONFile } = require('lowdb');
    const path = require('path');
    const dbFile = path.join(__dirname, '../../../media/vanguard-meta.json');
    const adapter = new JSONFile(dbFile);
    const db = new Low(adapter);
    await db.read();
    let updated = false;
    for (const file of db.data.files) {
      if (file.fileName === id || file.id === id || file._id === id) {
        file.status = status;
        updated = true;
        break;
      }
    }
    await db.write();
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// PATCH /api/moderate - batch moderation
app.patch('/api/moderate', async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!Array.isArray(ids) || !action) return res.status(400).json({ error: 'Missing ids or action' });
    // Use lowdb for updateMany
    const { Low, JSONFile } = require('lowdb');
    const path = require('path');
    const dbFile = path.join(__dirname, '../../../media/vanguard-meta.json');
    const adapter = new JSONFile(dbFile);
    const db = new Low(adapter);
    await db.read();
    let updated = 0;
    for (const file of db.data.files) {
      if (ids.includes(file.fileName) || ids.includes(file.id) || ids.includes(file._id)) {
        file.status = action;
        updated++;
      }
    }
    await db.write();
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET /api/files - list all uploaded files
app.get('/api/files', async (req, res) => {
  try {
    const db = require('../../db');
    const files = await db.getAllFiles ? await db.getAllFiles() : (await (async () => { const { Low, JSONFile } = require('lowdb'); const path = require('path'); const dbFile = path.join(__dirname, '../../../media/vanguard-meta.json'); const adapter = new JSONFile(dbFile); const dbInst = new Low(adapter); await dbInst.read(); return dbInst.data.files || []; })());
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Vanguard backend entry point
// Handles media ingestion, moderation queue, and API endpoints


// Vanguard backend entry point
// Handles media ingestion, moderation queue, and API endpoints

const express = require('express');
const multer = require('multer');
const { ingestMedia } = require('./ingest');
const moderateRouter = require('./moderate');
const { errorHandler } = require('./errorHandler');
const listRouter = require('./list');
// List files endpoint
app.use('/api/vanguard/list', listRouter);

require('dotenv').config();

const app = express();
const upload = multer();

// Media ingestion endpoint
app.post('/api/vanguard/ingest', upload.single('file'), async (req, res) => {
  try {
    const { userId, mediaType } = req.body;
    if (!req.file || !userId || !mediaType) {
      return res.status(400).json({ error: 'Missing file, userId, or mediaType' });
    }
    const result = await ingestMedia({
      fileBuffer: req.file.buffer,
      originalName: req.file.originalname,
      userId,
      mediaType,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Moderation endpoint
app.use('/api/vanguard/moderate', moderateRouter);

// Error handler (should be last)
app.use(errorHandler);

module.exports = app;
