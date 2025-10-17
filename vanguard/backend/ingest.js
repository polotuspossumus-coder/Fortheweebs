// Vanguard media ingestion module
// Accepts any media type, sorts files, generates filenames and metadata, and persists to db

const path = require('path');
const fs = require('fs');

// Accepts: { fileBuffer, originalName, userId, mediaType }
// Returns: { success, filePath, metadata }
async function ingestMedia({ fileBuffer, originalName, userId, mediaType }) {
  // 1. Determine folder by media type
  const folderMap = {
    image: 'images',
    video: 'videos',
    audio: 'audio',
    book: 'books',
    document: 'documents',
    other: 'other',
  };
  const folder = folderMap[mediaType] || folderMap.other;
  const baseDir = path.join(__dirname, '../../media', folder);
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

  // 2. Generate unique filename
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const fileName = `${userId}_${timestamp}_${safeName}`;
  const filePath = path.join(baseDir, fileName);

  // 3. Write file
  fs.writeFileSync(filePath, fileBuffer);

  // 4. Generate metadata
  const metadata = {
    userId,
    originalName,
    fileName,
    filePath,
    mediaType,
    timestamp,
    size: fileBuffer.length,
  };

  // 5. Persist metadata (db.saveFileMeta)
  try {
    const db = require('../../db');
    await db.saveFileMeta(metadata);
    await db.logUserAction(userId, 'upload', `Uploaded ${mediaType}: ${fileName}`);
  } catch (err) {
    // Log but do not fail ingestion
    console.error('DB error:', err);
  }

  return { success: true, filePath, metadata };
}

module.exports = { ingestMedia };
