const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const PSD = require('psd.js'); // npm install psd.js
const sharp = require('sharp');

/**
 * PSD File Import/Export API
 * Critical migration tool - without this, Photoshop users can't switch
 * 
 * Mico identified this as BLOCKER for graphic design market penetration
 */

// Import PSD file
router.post('/import-psd', async (req, res) => {
  try {
    const { psdData } = req.body; // Base64 PSD data
    
    if (!psdData) {
      return res.status(400).json({ error: 'Missing PSD data' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(psdData.split(',')[1], 'base64');
    
    // Parse PSD
    const psd = await PSD.fromBuffer(buffer);
    await psd.parse();

    // Extract document properties
    const document = {
      width: psd.tree().width,
      height: psd.tree().height,
      channels: psd.tree().channels,
      depth: psd.tree().depth,
      colorMode: psd.tree().colorMode
    };

    // Extract layers recursively
    const extractLayers = (node, parentPath = '') => {
      const layers = [];
      
      if (node.children) {
        node.children().forEach((child, index) => {
          const layer = {
            id: `layer_${Date.now()}_${index}`,
            name: child.name || `Layer ${index}`,
            type: child.type, // 'layer', 'group'
            visible: child.visible,
            opacity: child.opacity / 255, // 0-1 scale
            blendMode: child.blendMode,
            position: {
              left: child.left,
              top: child.top,
              right: child.right,
              bottom: child.bottom
            },
            width: child.width,
            height: child.height,
            // Layer effects
            effects: extractLayerEffects(child),
            // Text layer data
            text: child.type === 'text' ? extractTextData(child) : null,
            // Export layer as PNG
            imageData: null // Will be populated below
          };

          // Export layer image
          if (child.layer && child.layer.image) {
            const layerImage = child.layer.image.toPng();
            layer.imageData = `data:image/png;base64,${layerImage.toString('base64')}`;
          }

          // Recursively extract child layers (for groups)
          if (child.children && child.children().length > 0) {
            layer.children = extractLayers(child, `${parentPath}/${child.name}`);
          }

          layers.push(layer);
        });
      }

      return layers;
    };

    const layers = extractLayers(psd.tree());

    // Extract merged/flattened image
    const flattenedImage = psd.image.toPng();
    const flattenedBase64 = `data:image/png;base64,${flattenedImage.toString('base64')}`;

    res.json({
      success: true,
      document,
      layers,
      flattenedImage: flattenedBase64,
      message: 'PSD imported successfully'
    });

  } catch (error) {
    console.error('PSD import error:', error);
    res.status(500).json({
      error: 'PSD import failed',
      details: error.message
    });
  }
});

// Export to PSD format
router.post('/export-psd', async (req, res) => {
  try {
    const { document, layers } = req.body;

    if (!document || !layers) {
      return res.status(400).json({ error: 'Missing document or layers' });
    }

    // TODO: Implement PSD writing
    // psd.js is read-only, need ag-psd for writing
    // npm install ag-psd

    const agPsd = require('ag-psd');

    // Build PSD structure
    const psdDocument = {
      width: document.width,
      height: document.height,
      channels: document.channels || 4, // RGBA
      bitsPerChannel: document.depth || 8,
      colorMode: agPsd.ColorMode.RGB,
      children: []
    };

    // Convert our layers to ag-psd format
    for (const layer of layers) {
      const psdLayer = {
        name: layer.name,
        opacity: Math.round(layer.opacity * 255),
        blendMode: layer.blendMode || 'normal',
        left: layer.position.left,
        top: layer.position.top,
        right: layer.position.right,
        bottom: layer.position.bottom
      };

      // Add layer image data
      if (layer.imageData) {
        const imageBuffer = Buffer.from(layer.imageData.split(',')[1], 'base64');
        const imageSharp = sharp(imageBuffer);
        const { data, info } = await imageSharp.raw().toBuffer({ resolveWithObject: true });
        
        psdLayer.canvas = {
          width: info.width,
          height: info.height,
          data: new Uint8Array(data)
        };
      }

      // Handle text layers
      if (layer.text) {
        psdLayer.text = {
          text: layer.text.content,
          style: {
            font: layer.text.font || 'Arial',
            fontSize: layer.text.fontSize || 12,
            fillColor: layer.text.color || { r: 0, g: 0, b: 0 }
          }
        };
      }

      psdDocument.children.push(psdLayer);
    }

    // Write PSD buffer
    const psdBuffer = agPsd.writePsd(psdDocument);
    const psdBase64 = `data:application/octet-stream;base64,${psdBuffer.toString('base64')}`;

    res.json({
      success: true,
      psdData: psdBase64,
      filename: `${document.name || 'design'}.psd`,
      message: 'PSD exported successfully'
    });

  } catch (error) {
    console.error('PSD export error:', error);
    res.status(500).json({
      error: 'PSD export failed',
      details: error.message
    });
  }
});

// Helper: Extract layer effects
function extractLayerEffects(layer) {
  const effects = {};

  if (layer.adjustments) {
    // Extract adjustment layers
    effects.adjustments = layer.adjustments;
  }

  if (layer.effects) {
    // Drop shadow, inner shadow, glow, etc.
    effects.dropShadow = layer.effects.dropShadow;
    effects.innerShadow = layer.effects.innerShadow;
    effects.outerGlow = layer.effects.outerGlow;
    effects.innerGlow = layer.effects.innerGlow;
    effects.bevel = layer.effects.bevel;
    effects.satin = layer.effects.satin;
    effects.stroke = layer.effects.stroke;
  }

  return Object.keys(effects).length > 0 ? effects : null;
}

// Helper: Extract text layer data
function extractTextData(layer) {
  if (!layer.text) return null;

  return {
    content: layer.text.value || '',
    font: layer.text.font || 'Arial',
    fontSize: layer.text.sizes ? layer.text.sizes[0] : 12,
    color: layer.text.colors ? layer.text.colors[0] : { r: 0, g: 0, b: 0 },
    alignment: layer.text.alignment || 'left',
    transform: layer.text.transform || {}
  };
}

module.exports = router;
