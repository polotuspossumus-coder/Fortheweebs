const express = require('express');
const multer = require('multer');
let GIFEncoder, createCanvas, loadImage;
if (process.env.NODE_ENV === 'test') {
  GIFEncoder = function () {
    return {
      createReadStream: () => ({ pipe: () => {} }),
      start: () => {},
      setRepeat: () => {},
      setDelay: () => {},
      setQuality: () => {},
      addFrame: () => {},
      finish: () => {},
    };
  };
  createCanvas = () => ({
    getContext: () => ({ drawImage: () => {}, font: '', fillStyle: '', fillText: () => {} }),
  });
  loadImage = async () => ({});
} else {
  GIFEncoder = require('gifencoder');
  ({ createCanvas, loadImage } = require('canvas'));
}
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');
const remixLogger = require('../../utils/remixLogger');
const uploadToS3 = require('../../utils/uploadToS3');
const validateUpload = require('../../middleware/validateUpload');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/create', upload.array('images'), validateUpload, async (req, res) => {
  try {
    // Validate files
    if (!req.files || req.files.length === 0) {
      logger.warn('No images uploaded');
      return res.status(400).json({ error: 'No images uploaded' });
    }
    for (const file of req.files) {
      if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
        logger.warn('Invalid file type', { mimetype: file.mimetype });
        return res.status(400).json({ error: 'Invalid file type' });
      }
    }
    const overlayText = req.body.text || '';
    const frameDelay = parseInt(req.body.delay, 10) || 100;
    const outputPath = `uploads/gif-${Date.now()}.gif`;
    const encoder = new GIFEncoder(600, 400);
    const canvas = createCanvas(600, 400);
    const ctx = canvas.getContext('2d');
    const stream = fs.createWriteStream(outputPath);

    encoder.createReadStream().pipe(stream);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(frameDelay);
    encoder.setQuality(10);

    for (const file of req.files) {
      const img = await loadImage(file.path);
      ctx.clearRect(0, 0, 600, 400);
      ctx.globalAlpha = 1;
      ctx.drawImage(img, 0, 0, 600, 400);
      if (overlayText) {
        ctx.font = '32px Arial';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.strokeText(overlayText, 300, 380);
        ctx.fillText(overlayText, 300, 380);
      }
      encoder.addFrame(ctx);
    }

    encoder.finish();
    stream.on('close', async () => {
      // Upload to S3
      let s3Url = null;
      try {
        s3Url = await uploadToS3(outputPath);
        logger.info('GIF uploaded to S3', { s3Url });
      } catch (uploadErr) {
        logger.error('S3 upload failed', { error: uploadErr });
      }
      // Log remix
      if (req.user && req.user.id && req.files && req.files[0]) {
        await remixLogger({
          userId: req.user.id,
          originalAsset: req.files[0].filename,
          changes: `GIF fade + overlay: ${overlayText}`,
          timestamp: Date.now(),
          s3Url,
        });
      }
      res.json({ url: s3Url || `/${outputPath}` });
    });
  } catch (err) {
    logger.error('GIF generation failed', { error: err });
    res.status(500).json({ error: 'GIF generation failed' });
  }
});

module.exports = router;
