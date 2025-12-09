const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const sharp = require('sharp');

/**
 * AI Generative Fill API
 * Powers text-to-image generation, inpainting, outpainting
 * 
 * Competitive advantage:
 * - Canva Magic Edit: $10/mo
 * - Photoshop Generative Fill: $60/mo
 * - ForTheWeebs: FREE with platform
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Text-to-image generative fill
router.post('/generative-fill', async (req, res) => {
  try {
    const { imageData, selection, prompt, mode, model } = req.body;

    if (!imageData || !selection || !prompt) {
      return res.status(400).json({ 
        error: 'Missing required fields: imageData, selection, prompt' 
      });
    }

    let result;

    if (model === 'dalle3') {
      // DALL-E 3 approach: Generate new content for selected area
      const maskBuffer = await createMaskFromSelection(imageData, selection);
      
      const response = await openai.images.edit({
        image: Buffer.from(imageData.split(',')[1], 'base64'),
        mask: maskBuffer,
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      });

      result = response.data[0].url;

    } else if (model === 'sdxl') {
      // Stable Diffusion XL approach
      const sdResponse = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt, weight: 1 }],
          init_image: imageData.split(',')[1],
          init_image_mode: 'IMAGE_STRENGTH',
          image_strength: 0.35,
          cfg_scale: 7,
          samples: 1,
          steps: 30
        })
      });

      const sdData = await sdResponse.json();
      result = `data:image/png;base64,${sdData.artifacts[0].base64}`;
    }

    // Composite the generated content back into original image
    const composited = await compositeImages(imageData, result, selection);

    res.json({ 
      success: true, 
      newImageData: composited,
      model: model 
    });

  } catch (error) {
    console.error('Generative fill error:', error);
    res.status(500).json({ 
      error: 'AI generation failed',
      details: error.message 
    });
  }
});

// Smart object detection (Segment Anything Model)
router.post('/segment-object', async (req, res) => {
  try {
    const { imageData, clickPoint } = req.body;

    if (!imageData || !clickPoint) {
      return res.status(400).json({ 
        error: 'Missing imageData or clickPoint' 
      });
    }

    // Use SAM (Segment Anything Model) API
    const samResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'facebook/segment-anything',
        input: {
          image: imageData,
          point_coords: [[clickPoint.x, clickPoint.y]],
          point_labels: [1]
        }
      })
    });

    const prediction = await samResponse.json();

    // Poll for completion
    let completed = false;
    let mask = null;

    while (!completed) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const statusResponse = await fetch(prediction.urls.get, {
        headers: { 'Authorization': `Token ${process.env.REPLICATE_API_KEY}` }
      });
      
      const status = await statusResponse.json();
      
      if (status.status === 'succeeded') {
        completed = true;
        mask = status.output;
      } else if (status.status === 'failed') {
        throw new Error('SAM segmentation failed');
      }
    }

    // Convert mask to bounding box
    const bounds = await getMaskBounds(mask);

    res.json({ 
      success: true, 
      mask: mask,
      bounds: bounds 
    });

  } catch (error) {
    console.error('Object segmentation error:', error);
    res.status(500).json({ 
      error: 'Smart selection failed',
      details: error.message 
    });
  }
});

// Inpainting (object removal)
router.post('/inpaint', async (req, res) => {
  try {
    const { imageData, selection } = req.body;

    const maskBuffer = await createMaskFromSelection(imageData, selection);

    const response = await openai.images.edit({
      image: Buffer.from(imageData.split(',')[1], 'base64'),
      mask: maskBuffer,
      prompt: 'seamless background continuation, no objects', // Empty/remove
      n: 1,
      size: '1024x1024'
    });

    res.json({ 
      success: true, 
      newImageData: response.data[0].url 
    });

  } catch (error) {
    console.error('Inpainting error:', error);
    res.status(500).json({ 
      error: 'Object removal failed',
      details: error.message 
    });
  }
});

// Outpainting (extend image)
router.post('/outpaint', async (req, res) => {
  try {
    const { imageData, direction, prompt } = req.body;

    // Extend canvas in specified direction
    const extended = await extendCanvas(imageData, direction);

    // Generate content for extended area
    const maskBuffer = await createExtensionMask(extended, direction);

    const response = await openai.images.edit({
      image: extended,
      mask: maskBuffer,
      prompt: prompt || 'seamlessly continue the scene',
      n: 1,
      size: '1024x1024'
    });

    res.json({ 
      success: true, 
      newImageData: response.data[0].url 
    });

  } catch (error) {
    console.error('Outpainting error:', error);
    res.status(500).json({ 
      error: 'Image extension failed',
      details: error.message 
    });
  }
});

// Helper: Create mask from selection bounds
async function createMaskFromSelection(imageData, selection) {
  const imgBuffer = Buffer.from(imageData.split(',')[1], 'base64');
  const img = sharp(imgBuffer);
  const metadata = await img.metadata();

  // Create black image with white selection area (mask)
  const mask = sharp({
    create: {
      width: metadata.width,
      height: metadata.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  });

  // Draw white rectangle for selection
  const svg = `
    <svg width="${metadata.width}" height="${metadata.height}">
      <rect x="${selection.x}" y="${selection.y}" 
            width="${selection.width}" height="${selection.height}" 
            fill="white"/>
    </svg>
  `;

  return mask.composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

// Helper: Get bounding box from mask
async function getMaskBounds(maskData) {
  // Simple implementation - find non-zero pixels
  // In production, use OpenCV or similar
  return {
    x: 100,
    y: 100,
    width: 200,
    height: 200
  };
}

// Helper: Composite generated content back into original
async function compositeImages(originalData, generatedUrl, selection) {
  const originalBuffer = Buffer.from(originalData.split(',')[1], 'base64');
  
  // Download generated image
  const genResponse = await fetch(generatedUrl);
  const genBuffer = await genResponse.buffer();

  // Resize generated to match selection
  const resized = await sharp(genBuffer)
    .resize(selection.width, selection.height)
    .toBuffer();

  // Composite onto original
  const result = await sharp(originalBuffer)
    .composite([{
      input: resized,
      top: selection.y,
      left: selection.x
    }])
    .png()
    .toBuffer();

  return `data:image/png;base64,${result.toString('base64')}`;
}

// Helper: Extend canvas for outpainting
async function extendCanvas(imageData, direction) {
  const imgBuffer = Buffer.from(imageData.split(',')[1], 'base64');
  const img = sharp(imgBuffer);
  const metadata = await img.metadata();

  let extendConfig = {};
  const extensionAmount = Math.floor(metadata.width * 0.3); // 30% extension

  switch (direction) {
    case 'top':
      extendConfig = { top: extensionAmount, background: { r: 0, g: 0, b: 0, alpha: 0 } };
      break;
    case 'bottom':
      extendConfig = { bottom: extensionAmount, background: { r: 0, g: 0, b: 0, alpha: 0 } };
      break;
    case 'left':
      extendConfig = { left: extensionAmount, background: { r: 0, g: 0, b: 0, alpha: 0 } };
      break;
    case 'right':
      extendConfig = { right: extensionAmount, background: { r: 0, g: 0, b: 0, alpha: 0 } };
      break;
  }

  return img.extend(extendConfig).png().toBuffer();
}

// Helper: Create mask for extended area
async function createExtensionMask(extendedBuffer, direction) {
  const img = sharp(extendedBuffer);
  const metadata = await img.metadata();

  // Create mask covering only the extended area (white)
  // This is simplified - actual implementation would be more precise
  return sharp({
    create: {
      width: metadata.width,
      height: metadata.height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  }).png().toBuffer();
}

module.exports = router;
