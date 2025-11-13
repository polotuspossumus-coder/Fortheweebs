/**
 * API Route: Family Access System (CommonJS version)
 * Generate special access codes for family/friends
 * - Full free access codes (for Mom, Dad, testers)
 * - Supporter plan codes ($20/month toward $1000 tier)
 */

const express = require('express');
const router = express.Router();

// Mock database for family access codes (in production, use Supabase)
const accessCodes = new Map();

/**
 * List all access codes (admin only)
 * GET /api/family-access/list
 */
router.get('/list', async (req, res) => {
  try {
    const codes = Array.from(accessCodes.values());
    return res.status(200).json({ codes });
  } catch (error) {
    console.error('Error listing access codes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Generate new access code (admin only)
 * POST /api/family-access/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const { adminId, name, type, notes } = req.body;

    if (!adminId || !name || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique code
    const code = `FAMILY-${name.toUpperCase().replace(/\s+/g, '-')}-${Date.now().toString(36).toUpperCase()}`;

    const baseUrl = process.env.VITE_APP_URL || 'http://localhost:3002';
    const link = `${baseUrl}?familyCode=${code}`;

    const accessCode = {
      id: `fac_${Date.now()}`,
      code,
      name,
      type, // 'free' or 'supporter'
      notes,
      link,
      createdBy: adminId,
      createdAt: new Date().toISOString(),
      usedCount: 0,
      active: true
    };

    // Store in memory (in production, save to Supabase)
    accessCodes.set(code, accessCode);

    return res.status(200).json({
      success: true,
      code: accessCode.code,
      link: accessCode.link,
      accessCode
    });

  } catch (error) {
    console.error('Error generating access code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Verify access code is valid
 * GET /api/family-access/verify?code=XXX
 */
router.get('/verify', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Code required' });
    }

    const accessCode = accessCodes.get(code);

    if (!accessCode || !accessCode.active) {
      return res.status(200).json({ valid: false, message: 'Invalid or expired code' });
    }

    // Return code info
    return res.status(200).json({
      valid: true,
      name: accessCode.name,
      type: accessCode.type,
      code: accessCode.code,
      notes: accessCode.notes
    });

  } catch (error) {
    console.error('Error verifying access code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Redeem access code and grant access
 * POST /api/family-access/redeem
 */
router.post('/redeem', async (req, res) => {
  try {
    const { code, userId } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code required' });
    }

    const accessCode = accessCodes.get(code);

    if (!accessCode || !accessCode.active) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }

    // Increment used count
    accessCode.usedCount = (accessCode.usedCount || 0) + 1;
    accessCode.lastUsedAt = new Date().toISOString();
    accessCodes.set(code, accessCode);

    // Store in localStorage on client side
    const storageKey = `family_access_${userId || 'user'}`;

    return res.status(200).json({
      success: true,
      message: 'Access code redeemed successfully',
      tier: accessCode.type === 'free' ? 'SUPER_ADMIN' : 'CREATOR',
      accessType: accessCode.type,
      storageKey,
      code
    });

  } catch (error) {
    console.error('Error redeeming access code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Delete access code (admin only)
 * DELETE /api/family-access/delete?id=XXX
 */
router.delete('/delete', async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Code ID required' });
    }

    // Find and deactivate the code
    for (const [code, accessCode] of accessCodes.entries()) {
      if (accessCode.id === id) {
        accessCode.active = false;
        accessCodes.set(code, accessCode);
        break;
      }
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error deleting access code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
