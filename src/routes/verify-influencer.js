/**
 * API Route: Verify Influencer Status
 * Checks social media following and grants free CREATOR tier access
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, platform, username, followers, proofMethod, screenshot, verificationCode } = req.body;

    // Validation
    if (!userId || !platform || !username || !followers) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Minimum follower requirements per platform
    const MINIMUM_FOLLOWERS = {
      youtube: 10000,
      tiktok: 10000,
      instagram: 10000,
      twitter: 10000,
      twitch: 5000,
      facebook: 10000,
      linkedin: 10000,
      reddit: 10000
    };

    const minRequired = MINIMUM_FOLLOWERS[platform] || 10000;

    if (followers < minRequired) {
      return res.status(400).json({
        success: false,
        message: `Minimum ${minRequired.toLocaleString()} followers required for ${platform}`
      });
    }

    // Create verification request in database
    // In production, this would:
    // 1. Store verification request with status "pending"
    // 2. Store proof (screenshot URL, verification code, etc)
    // 3. Trigger manual review by admin
    // 4. Send email notification to user when approved/rejected

    const verificationRequest = {
      id: `verify_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId,
      platform,
      username,
      followers,
      proofMethod,
      screenshot: screenshot ? 'stored_in_blob_storage' : null,
      verificationCode,
      status: 'pending', // pending, approved, rejected
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null
    };

    // For demo: Auto-approve if followers >= 2x minimum
    if (followers >= minRequired * 2) {
      verificationRequest.status = 'approved';
      verificationRequest.reviewedAt = new Date().toISOString();
      verificationRequest.reviewedBy = 'auto_system';

      // Update user tier to INFLUENCER (free CREATOR tier access)
      // In production: await db.users.update({ userId }, { tier: 'INFLUENCER', tierExpiry: null })

      return res.status(200).json({
        success: true,
        autoApproved: true,
        message: 'Congratulations! You have been verified as an influencer. All CREATOR tier features are now FREE for you!',
        verification: verificationRequest
      });
    }

    // Manual review required
    // In production: await db.verificationRequests.create(verificationRequest)
    // In production: await sendEmailToAdmins('New influencer verification request', verificationRequest)

    return res.status(200).json({
      success: true,
      autoApproved: false,
      message: 'Verification request submitted successfully! We will review your application within 24 hours and notify you via email.',
      verification: verificationRequest
    });

  } catch (error) {
    console.error('Error verifying influencer:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during verification'
    });
  }
}

/**
 * Admin endpoint to approve/reject verification requests
 * POST /api/admin/review-verification
 */
export async function reviewVerification(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { verificationId, action, adminId, notes } = req.body;

    // Check admin permissions
    // In production: const admin = await db.users.findOne({ userId: adminId, role: 'admin' })
    // if (!admin) return res.status(403).json({ error: 'Unauthorized' })

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Get verification request
    // In production: const verification = await db.verificationRequests.findOne({ id: verificationId })

    // Update verification status
    // In production: await db.verificationRequests.update({ id: verificationId }, {
    //   status: action === 'approve' ? 'approved' : 'rejected',
    //   reviewedAt: new Date().toISOString(),
    //   reviewedBy: adminId,
    //   notes
    // })

    if (action === 'approve') {
      // Grant INFLUENCER tier (free CREATOR access)
      // In production: await db.users.update({ userId: verification.userId }, {
      //   tier: 'INFLUENCER',
      //   tierExpiry: null,
      //   verifiedPlatforms: [...user.verifiedPlatforms, verification.platform]
      // })

      // Send approval email
      // await sendEmail(user.email, 'Influencer Verification Approved', ...)
    } else {
      // Send rejection email
      // await sendEmail(user.email, 'Influencer Verification Not Approved', ...)
    }

    return res.status(200).json({
      success: true,
      message: `Verification ${action}d successfully`
    });

  } catch (error) {
    console.error('Error reviewing verification:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
