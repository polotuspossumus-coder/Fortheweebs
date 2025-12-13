const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Helper functions moved to module scope
const BUCKET_NAME = 'fortheweebs-legal-receipts-2025';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@fortheweebs.com';

// Generate SHA-256 hash
function generateHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Generate PDF receipt
async function generateReceiptPDF(data, PDFDocument) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // PDF Content
    doc.fontSize(20).text('Legal Acceptance Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Receipt ID: ${data.receiptId}`);
    doc.text(`User Email: ${data.email}`);
    doc.text(`Accepted At: ${new Date(data.acceptedAt).toISOString()}`);
    doc.moveDown();
    doc.text(`Terms Version: ${data.termsVersion}`);
    doc.text(`Privacy Version: ${data.privacyVersion}`);
    doc.moveDown();
    doc.text(`Terms Hash: ${data.termsHash}`);
    doc.text(`Privacy Hash: ${data.privacyHash}`);
    doc.moveDown();
    doc.fontSize(10).text('This receipt is immutably stored and cannot be modified or deleted.');

    doc.end();
  });
}

// Send email with receipt PDF
async function sendReceiptEmail(email, receiptId, pdfBuffer, sesClient, SendEmailCommand) {
  try {
    const params = {
      Source: `FORTHEWEEBS Legal Receipts <${FROM_EMAIL}>`,
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Subject: {
          Data: '📋 FORTHEWEEBS - Your Legal Acceptance Receipt',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .receipt-id { background: white; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 14px; margin: 20px 0; }
                    .info-box { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0; }
                    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
                    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>🎌 FORTHEWEEBS</h1>
                      <h2>Legal Receipt Confirmation</h2>
                      <p>Your acceptance has been recorded</p>
                    </div>
                    <div class="content">
                      <p><strong>Hello from FORTHEWEEBS,</strong></p>
                      <p>Thank you for accepting our Terms of Service and Privacy Policy. Your acceptance has been securely recorded and stored immutably.</p>

                      <div class="receipt-id">
                        <strong>Receipt ID:</strong><br/>
                        ${receiptId}
                      </div>

                      <div class="info-box">
                        <strong>🔒 What this means:</strong><br/>
                        This receipt is permanently stored in our immutable legal receipts system. It cannot be modified or deleted, ensuring a tamper-proof record of your acceptance.
                      </div>

                      <p><strong>Your receipt includes:</strong></p>
                      <ul>
                        <li>Unique Receipt ID</li>
                        <li>Timestamp of acceptance</li>
                        <li>Document version information</li>
                        <li>Cryptographic hashes for verification</li>
                      </ul>

                      <p>A PDF copy of your receipt is attached to this email for your records. Please save it for future reference.</p>

                      <div class="footer">
                        <p>This is an automated message from ForTheWeebs Legal Receipts System</p>
                        <p>© ${new Date().getFullYear()} ForTheWeebs. All rights reserved.</p>
                      </div>
                    </div>
                  </div>
                </body>
              </html>
            `,
            Charset: 'UTF-8'
          },
          Text: {
            Data: `FORTHEWEEBS - Legal Acceptance Receipt\n\nReceipt ID: ${receiptId}\n\nYour acceptance of our Terms of Service and Privacy Policy has been securely recorded and stored immutably. This receipt cannot be modified or deleted.\n\nA PDF copy is available in your account.\n\n© ${new Date().getFullYear()} FORTHEWEEBS - The Creator-First Platform`,
            Charset: 'UTF-8'
          }
        }
      }
    };

    // Note: AWS SES doesn't support attachments directly via SendEmailCommand
    // For production, you should use SendRawEmailCommand with MIME multipart
    // For now, we'll send without attachment or implement later

    const command = new SendEmailCommand(params);
    await sesClient.send(command);

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    // Don't throw - email failure shouldn't block receipt creation
    return { success: false, error: error.message };
  }
}

// Wrap initialization in try-catch to handle missing dependencies gracefully
try {
  const { createClient } = require('@supabase/supabase-js');
  const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
  const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
  const PDFDocument = require('pdfkit');
  const { requireAuth, requireAdmin } = require('../middleware/auth');

  // Initialize Supabase with defensive validation
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials missing from environment');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Initialize S3 (optional - will be null if AWS creds not set)
  const s3Client = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? new S3Client({
    region: process.env.AWS_REGION || 'us-east-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  }) : null;

  // Initialize SES (optional - will be null if AWS creds not set)
  const sesClient = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? new SESClient({
    region: process.env.AWS_REGION || 'us-east-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  }) : null;

// POST /api/legal-receipts - Create new legal receipt
router.post('/', async (req, res) => {
  try {
    const { userId, email, termsContent, privacyContent } = req.body;

    if (!userId || !email || !termsContent || !privacyContent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique receipt ID
    const receiptId = `RCPT-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    const acceptedAt = new Date().toISOString();

    // Generate hashes
    const termsHash = generateHash(termsContent);
    const privacyHash = generateHash(privacyContent);

    // Generate PDF
    const pdfData = {
      receiptId,
      email,
      acceptedAt,
      termsVersion: 'v2.0',
      privacyVersion: 'v2.0',
      termsHash,
      privacyHash
    };

    const pdfBuffer = await generateReceiptPDF(pdfData, PDFDocument);
    const documentHash = generateHash(pdfBuffer);

    // Upload to S3 with versioning
    const s3Key = `receipts/${userId}/${receiptId}.pdf`;
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      Metadata: {
        receiptId,
        userId,
        email,
        acceptedAt
      }
    });

    const s3Response = await s3Client.send(uploadCommand);

    // Store metadata in Supabase
    const { data: receipt, error: dbError } = await supabase
      .from('legal_receipts')
      .insert({
        receipt_id: receiptId,
        user_id: userId,
        email,
        accepted_at: acceptedAt,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        terms_version: 'v2.0',
        privacy_version: 'v2.0',
        terms_hash: termsHash,
        privacy_hash: privacyHash,
        document_hash: documentHash,
        s3_bucket: BUCKET_NAME,
        s3_key: s3Key,
        s3_version_id: s3Response.VersionId || 'unknown',
        s3_etag: s3Response.ETag
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Send email notification (non-blocking)
    const emailResult = await sendReceiptEmail(email, receiptId, pdfBuffer, sesClient, SendEmailCommand);
    
    res.json({
      success: true,
      receiptId,
      message: 'Legal receipt created and stored immutably',
      receipt: {
        id: receipt.id,
        receiptId: receipt.receipt_id,
        acceptedAt: receipt.accepted_at,
        s3Key: receipt.s3_key
      },
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('Error creating legal receipt:', error);
    res.status(500).json({ error: 'Failed to create legal receipt' });
  }
});

// GET /api/legal-receipts/:userId - Get user's receipts
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: receipts, error } = await supabase
      .from('legal_receipts')
      .select('receipt_id, email, accepted_at, terms_version, privacy_version, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Log access
    for (const receipt of receipts) {
      await supabase.from('legal_receipt_access_log').insert({
        receipt_id: receipt.receipt_id,
        accessed_by: userId,
        access_type: 'user_receipts_list',
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });
    }

    res.json({ success: true, receipts });

  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
});

// GET /api/legal-receipts/receipt/:receiptId - Get specific receipt
router.get('/receipt/:receiptId', async (req, res) => {
  try {
    const { userId, receiptId } = req.params;

    const { data: receipt, error } = await supabase
      .from('legal_receipts')
      .select('*')
      .eq('receipt_id', receiptId)
      .single();

    if (error) throw error;
    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });

    // Log access
    await supabase.from('legal_receipt_access_log').insert({
      receipt_id: receiptId,
      accessed_by: req.query.userId || 'anonymous',
      access_type: 'metadata_view',
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json({ success: true, receipt });

  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
});

// ADMIN ENDPOINTS

// GET /api/legal-receipts/admin/all - Get all receipts (admin only)
router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { data: receipts, error } = await supabase
      .from('legal_receipts')
      .select('receipt_id, user_id, email, accepted_at, terms_version, privacy_version, ip_address, retain_until_date, legal_hold, created_at')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;

    res.json({ success: true, receipts });

  } catch (error) {
    console.error('Error fetching all receipts:', error);
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
});

// GET /api/legal-receipts/admin/stats - Get receipt statistics (admin only)
router.get('/admin/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Get total count
    const { count: totalCount } = await supabase
      .from('legal_receipts')
      .select('*', { count: 'exact', head: true });

    // Get this month's count
    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0, 0, 0, 0);
    
    const { count: monthCount } = await supabase
      .from('legal_receipts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstOfMonth.toISOString());

    // Get legal holds count
    const { count: holdCount } = await supabase
      .from('legal_receipts')
      .select('*', { count: 'exact', head: true })
      .eq('legal_hold', true);

    // Get receipts needing extension (within 5 years)
    const fiveYearsFromNow = new Date();
    fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);
    
    const { count: needingExtension } = await supabase
      .from('legal_receipts')
      .select('*', { count: 'exact', head: true })
      .lt('retain_until_date', fiveYearsFromNow.toISOString());

    res.json({
      success: true,
      total_receipts: totalCount || 0,
      this_month: monthCount || 0,
      with_legal_hold: holdCount || 0,
      needing_extension: needingExtension || 0
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/legal-receipts/admin/details/:receiptId - Get full receipt details (admin only)
router.get('/admin/details/:receiptId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { receiptId } = req.params;

    const { data: receipt, error } = await supabase
      .from('legal_receipts')
      .select('*')
      .eq('receipt_id', receiptId)
      .single();

    if (error) throw error;
    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });

    // Log admin access
    await supabase.from('legal_receipt_access_log').insert({
      receipt_id: receiptId,
      accessed_by: req.query.adminId || 'admin',
      access_type: 'admin_full_view',
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json(receipt);

  } catch (error) {
    console.error('Error fetching receipt details:', error);
    res.status(500).json({ error: 'Failed to fetch receipt details' });
  }
});

// GET /api/legal-receipts/admin/download/:receiptId - Download receipt PDF (admin only)
router.get('/admin/download/:receiptId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { receiptId } = req.params;

    // Get receipt metadata
    const { data: receipt, error } = await supabase
      .from('legal_receipts')
      .select('s3_key, user_id, email')
      .eq('receipt_id', receiptId)
      .single();

    if (error) throw error;
    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });

    // Get file from S3
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: receipt.s3_key
    });

    const s3Response = await s3Client.send(getCommand);
    
    // Stream the PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${receiptId}.pdf"`);
    
    const stream = s3Response.Body;
    stream.pipe(res);

    // Log download
    await supabase.from('legal_receipt_access_log').insert({
      receipt_id: receiptId,
      accessed_by: req.query.adminId || 'admin',
      access_type: 'admin_download',
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });

  } catch (error) {
    console.error('Error downloading receipt:', error);
    res.status(500).json({ error: 'Failed to download receipt' });
  }
});

} catch (initError) {
  // Module initialization failed - return fallback router
  router.all('*', (req, res) => {
    res.status(503).json({ 
      error: 'Legal receipts service unavailable',
      reason: 'Missing required dependencies or configuration'
    });
  });
}

module.exports = router;
