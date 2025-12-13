/**
 * Auto-Crop API - Intelligent image cropping with edge detection
 * Removes whitespace and crops to content boundaries
 */

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

/**
 * POST /api/crop
 * Auto-crops image by detecting content boundaries
 */
router.post('/crop', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const { removeDuplicates, similarityThreshold } = req.body;
        
        // Process image with sharp
        const image = sharp(req.file.buffer);
        const metadata = await image.metadata();
        
        // Get image data for edge detection
        const { data, info } = await image
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Find content boundaries (detect non-white, non-transparent pixels)
        let minX = info.width, minY = info.height, maxX = 0, maxY = 0;
        const channels = info.channels;

        for (let y = 0; y < info.height; y++) {
            for (let x = 0; x < info.width; x++) {
                const idx = (y * info.width + x) * channels;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const a = channels === 4 ? data[idx + 3] : 255;

                // Check if pixel is not background (not white and not transparent)
                if (a > 10 && (r < 250 || g < 250 || b < 250)) {
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        // Add padding
        const padding = 20;
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(info.width, maxX + padding);
        maxY = Math.min(info.height, maxY + padding);

        const width = maxX - minX;
        const height = maxY - minY;

        // Crop image
        const croppedBuffer = await sharp(req.file.buffer)
            .extract({
                left: minX,
                top: minY,
                width: width,
                height: height
            })
            .toBuffer();

        // Convert to base64 data URL
        const dataURL = `data:${req.file.mimetype};base64,${croppedBuffer.toString('base64')}`;

        res.json({
            dataURL,
            blob: croppedBuffer,
            width,
            height,
            originalWidth: metadata.width,
            originalHeight: metadata.height,
            croppedPixels: (metadata.width * metadata.height) - (width * height)
        });
    } catch (error) {
        console.error('Auto-crop error:', error);
        res.status(500).json({ error: 'Failed to auto-crop image: ' + error.message });
    }
});

/**
 * POST /api/image-hash
 * Computes perceptual hash for duplicate detection
 */
router.post('/image-hash', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Resize to 8x8 for perceptual hash (pHash algorithm)
        const { data } = await sharp(req.file.buffer)
            .resize(8, 8, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Calculate average pixel value
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
        }
        const avg = sum / data.length;

        // Build hash string (1 if pixel > avg, 0 otherwise)
        let hash = '';
        for (let i = 0; i < data.length; i++) {
            hash += data[i] > avg ? '1' : '0';
        }

        res.json({ hash });
    } catch (error) {
        console.error('Image hash error:', error);
        res.status(500).json({ error: 'Failed to compute image hash: ' + error.message });
    }
});

/**
 * POST /api/image-similarity
 * Compares two images and returns similarity percentage
 */
router.post('/image-similarity', upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 }
]), async (req, res) => {
    try {
        if (!req.files || !req.files.image1 || !req.files.image2) {
            return res.status(400).json({ error: 'Two image files required' });
        }

        const image1 = req.files.image1[0];
        const image2 = req.files.image2[0];

        // Compute hashes for both images
        const hash1 = await computeHash(image1.buffer);
        const hash2 = await computeHash(image2.buffer);

        // Calculate Hamming distance
        let distance = 0;
        for (let i = 0; i < hash1.length; i++) {
            if (hash1[i] !== hash2[i]) distance++;
        }

        // Convert to similarity percentage (0-100)
        const similarity = Math.round((1 - distance / hash1.length) * 100);

        res.json({ similarity, hash1, hash2 });
    } catch (error) {
        console.error('Image similarity error:', error);
        res.status(500).json({ error: 'Failed to compare images: ' + error.message });
    }
});

// Helper function to compute perceptual hash
async function computeHash(buffer) {
    const { data } = await sharp(buffer)
        .resize(8, 8, { fit: 'fill' })
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum += data[i];
    }
    const avg = sum / data.length;

    let hash = '';
    for (let i = 0; i < data.length; i++) {
        hash += data[i] > avg ? '1' : '0';
    }
    return hash;
}

module.exports = router;
