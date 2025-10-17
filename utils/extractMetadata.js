const mm = require('music-metadata');
const sharp = require('sharp');

async function extractMetadata(filePath, type) {
  if (type === 'audio') {
    const metadata = await mm.parseFile(filePath);
    return {
      duration: metadata.format.duration,
      bitrate: metadata.format.bitrate,
      tags: metadata.common.genre || [],
    };
  }
  if (type === 'image') {
    const { width, height } = await sharp(filePath).metadata();
    return { width, height };
  }
  return {};
}

module.exports = extractMetadata;
