/**
 * API Route: Family Access System
 * Generate special access codes for family/friends
 * - Full free access codes (for Mom, Dad, testers)
 * - Supporter plan codes ($20/month toward $1000 tier)
 */

import Stripe from 'stripe';

// Initialize Stripe (requires STRIPE_SECRET_KEY environment variable)
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { action } = req.query;

  switch (action) {
    case 'list':
      return listAccessCodes(req, res);
    case 'generate':
      return generateAccessCode(req, res);
    case 'verify':
      return verifyAccessCode(req, res);
    case 'redeem':
      return redeemAccessCode(req, res);
    case 'delete':
      return deleteAccessCode(req, res);
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
}

/**
 * List all access codes (admin only)
 */
async function listAccessCodes(req, res) {
  try {
    // In production: Check if user is admin
    // const { userId } = req.query;
    // const user = await db.users.findOne({ userId });
    // if (user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

    // In production: Get from database
    // const codes = await db.familyAccessCodes.find({ active: true });

    // Mock data for demo
    const mockCodes = [
      {
        id: 'fac_001',
        code: 'FAMILY-MOM-2024',
        name: 'Mom',
        type: 'free',
        notes: 'Full free access for testing',
        link: `${process.env.VERCEL_URL || 'http://localhost:3000'}/redeem?code=FAMILY-MOM-2024`,
        createdAt: new Date().toISOString(),
        usedCount: 0,
        active: true
      }
    ];

    return res.status(200).json({ codes: mockCodes });
  } catch (error) {
    console.error('Error listing access codes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Generate new access code (admin only)
 */
async function generateAccessCode(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { adminId, name, type, notes } = req.body;

    if (!adminId || !name || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // In production: Verify admin
    // const admin = await db.users.findOne({ userId: adminId, role: 'admin' });
    // if (!admin) return res.status(403).json({ error: 'Unauthorized' });

    // Generate unique code
    const code = `FAMILY-${name.toUpperCase().replace(/\s+/g, '-')}-${Date.now().toString(36).toUpperCase()}`;

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const link = `${baseUrl}/redeem?code=${code}`;

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

    // In production: Save to database
    // await db.familyAccessCodes.create(accessCode);

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
}

/**
 * Verify access code is valid
 */
async function verifyAccessCode(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Code required' });
    }

    // In production: Check database
    // const accessCode = await db.familyAccessCodes.findOne({ code, active: true });

    // Mock verification
    const isValid = code.startsWith('FAMILY-');

    if (!isValid) {
      return res.status(200).json({ valid: false });
    }

    // Return code info
    return res.status(200).json({
      valid: true,
      name: 'Family Member',
      type: code.includes('FREE') ? 'free' : 'supporter',
      code
    });

  } catch (error) {
    console.error('Error verifying access code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Redeem access code and grant access
 */
async function redeemAccessCode(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, userId } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code required' });
    }

    // In production: Verify code exists and is active
    // const accessCode = await db.familyAccessCodes.findOne({ code, active: true });
    // if (!accessCode) return res.status(400).json({ success: false, message: 'Invalid code' });

    // Determine access type
    const isFree = code.includes('FREE') || !code.includes('SUPPORTER');
    const type = isFree ? 'free' : 'supporter';

    // In production: Update user account
    // await db.users.update({ userId }, {
    //   tier: 'CREATOR', // Full access
    //   familyAccessType: type,
    //   familyAccessCode: code,
    //   familyAccessActivatedAt: new Date()
    // });

    // If supporter plan, set up Stripe subscription
    if (type === 'supporter') {
      // Uncomment when Stripe is configured
      /*
      const subscription = await stripe.subscriptions.create({
        customer: userId, // Or create customer first
        items: [{ price: 'price_supporter_plan' }], // $20/month price ID
        metadata: {
          type: 'family_supporter',
          accessCode: code,
          targetAmount: 1000
        }
      });

      await db.users.update({ userId }, {
        stripeSubscriptionId: subscription.id,
        supporterPlanStarted: new Date(),
        supporterPlanTotal: 0
      });
      */
    }

    // In production: Increment usage count
    // await db.familyAccessCodes.update({ code }, { $inc: { usedCount: 1 } });

    return res.status(200).json({
      success: true,
      message: 'Access code redeemed successfully',
      tier: 'CREATOR',
      accessType: type
    });

  } catch (error) {
    console.error('Error redeeming access code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete access code (admin only)
 */
async function deleteAccessCode(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Code ID required' });
    }

    // In production: Verify admin
    // const { adminId } = req.body;
    // const admin = await db.users.findOne({ userId: adminId, role: 'admin' });
    // if (!admin) return res.status(403).json({ error: 'Unauthorized' });

    // In production: Soft delete (set active: false)
    // await db.familyAccessCodes.update({ id }, { active: false });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error deleting access code:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Webhook handler for Stripe subscription payments (supporter plan)
 */
export async function handleSupporterPayment(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify Stripe webhook signature
    // const sig = req.headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    // if (event.type === 'invoice.payment_succeeded') {
    //   const invoice = event.data.object;
    //   const subscriptionId = invoice.subscription;
    //   const amountPaid = invoice.amount_paid / 100; // Convert cents to dollars

    //   // Find user by subscription ID
    //   const user = await db.users.findOne({ stripeSubscriptionId: subscriptionId });
    //   if (!user) return res.status(404).json({ error: 'User not found' });

    //   // Update total paid
    //   const newTotal = (user.supporterPlanTotal || 0) + amountPaid;
    //   await db.users.update({ userId: user.userId }, {
    //     supporterPlanTotal: newTotal,
    //     lastPaymentDate: new Date()
    //   });

    //   // Check if they've reached $1000 (Mystery Tier)
    //   if (newTotal >= 1000 && user.tier !== 'SUPER_ADMIN') {
    //     await db.users.update({ userId: user.userId }, {
    //       tier: 'SUPER_ADMIN',
    //       tierUnlockedAt: new Date()
    //     });

    //     // Cancel subscription (they've reached the goal)
    //     await stripe.subscriptions.cancel(subscriptionId);

    //     // Send congratulations email
    //     // await sendEmail(user.email, 'Mystery Tier Unlocked!', ...);
    //   }
    // }

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Error handling supporter payment:', error);
    return res.status(500).json({ error: 'Webhook error' });
  }
}
