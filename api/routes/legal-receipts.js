/**
 * Legal Receipts API - Immutable Lifetime-Locked Storage
 * 
 * FEATURES:
 * - Write-once PDF receipts with Object Lock (COMPLIANCE mode)
 * - Far-future retention (2099-12-31) with annual extension
 * - Legal holds for disputes (immutable even past retain date)
 * - Dual storage: Postgres + S3 with hash verification
 * - Audit trail for every access/retrieval
 * - Signed URLs with short expiry (5 minutes)
 */

const express = require('express');
const router = express.Router();
const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectLegalHoldCommand, PutObjectRetentionCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { createClient } = require('@supabase/supabase-js');
const PDFDocument = require('pdfkit');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const {
  LEGAL_RECEIPTS_CONFIG,
  generateReceiptId,
  calculateDocumentHash,
  generateS3Key,
  getFarFutureRetentionDate,
  createReceiptMetadata,
  LEGAL_HOLD_REASONS
} = require('../../config/legalReceipts');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Initialize S3 client with Object Lock support
const s3Client = new S3Client({
  region: LEGAL_RECEIPTS_CONFIG.region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/**
 * Generate legal receipt PDF with immutable evidence
 */
async function generateReceiptPDF(metadata) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text('LEGAL ACCEPTANCE RECEIPT', { align: 'center' });
    doc.fontSize(10).text('IMMUTABLE RECORD - LIFETIME RETENTION', { align: 'center' });
    doc.moveDown(2);

    // Receipt ID (unique identifier)
    doc.fontSize(12).text(`Receipt ID: ${metadata.receiptId}`, { bold: true });
    doc.fontSize(10).text(`Issued: ${new Date().toISOString()}`);
    doc.moveDown();

    // User Information
    doc.fontSize(14).text('User Information:', { underline: true });
    doc.fontSize(10);
    doc.text(`User ID: ${metadata.userId}`);
    doc.text(`Email: ${metadata.email}`);
    doc.text(`IP Address: ${metadata.ipAddress}`);
    doc.text(`User Agent: ${metadata.userAgent}`);
    doc.moveDown();

    // Acceptance Details
    doc.fontSize(14).text('Acceptance Details:', { underline: true });
    doc.fontSize(10);
    doc.text(`Accepted At: ${metadata.acceptedAt}`);
    doc.text(`Terms of Service Version: ${metadata.termsVersion}`);
    doc.text(`Privacy Policy Version: ${metadata.privacyVersion}`);
    doc.moveDown();

    // Document Integrity Hashes
    doc.fontSize(14).text('Document Integrity Verification:', { underline: true });
    doc.fontSize(10);
    doc.text(`Terms Hash (SHA-256): ${metadata.termsHash}`);
    doc.text(`Privacy Hash (SHA-256): ${metadata.privacyHash}`);
    doc.moveDown();

    // Storage Information
    doc.fontSize(14).text('Immutable Storage Details:', { underline: true });
    doc.fontSize(10);
    doc.text(`Object Lock Mode: COMPLIANCE`);
    doc.text(`Retain Until: ${metadata.retainUntilDate}`);
    doc.text(`Write-Once: TRUE (No modifications permitted)`);
    doc.text(`Legal Hold Available: TRUE`);
    doc.moveDown();

    // Legal Notice
    doc.fontSize(12).text('LEGAL NOTICE', { underline: true, bold: true });
    doc.fontSize(9);
    doc.text(
      'This receipt constitutes immutable evidence of user acceptance under the Electronic Signatures in Global and National Commerce Act (E-SIGN Act). ' +
      'The document is stored with AWS S3 Object Lock in COMPLIANCE mode with far-future retention date (2099-12-31). ' +
      'No party, including ForTheWeebs administrators, can modify or delete this record before the retention date expires. ' +
      'Legal holds may be applied during disputes to extend retention indefinitely.',
      { align: 'justify' }
    );
    doc.moveDown();

    // Signature Block
    doc.fontSize(10);
    doc.text('ForTheWeebs Platform', { align: 'left' });
    doc.text('Jacob Morris, Owner', { align: 'left' });
    doc.text('North Carolina, United States', { align: 'left' });
    doc.text(`legal@fortheweebs.com`, { align: 'left' });

    doc.end();
  });
}

/**
 * Upload receipt to S3 with Object Lock (COMPLIANCE mode)
 */
async function uploadReceiptToS3(metadata, pdfBuffer) {
  const s3Key = generateS3Key(metadata.userId, metadata.receiptId);
  const retainUntilDate = getFarFutureRetentionDate();

  const command = new PutObjectCommand({
    Bucket: LEGAL_RECEIPTS_CONFIG.bucket,
    Key: s3Key,
    Body: pdfBuffer,
    ContentType: 'application/pdf',
    ServerSideEncryption: 'aws:kms',
    SSEKMSKeyId: LEGAL_RECEIPTS_CONFIG.kmsKeyId,
    
    // Object Lock - COMPLIANCE mode with far-future retain date
    ObjectLockMode: 'COMPLIANCE',
    ObjectLockRetainUntilDate: retainUntilDate,
    
    // Metadata for audit trail
    Metadata: {
      'receipt-id': metadata.receiptId,
      'user-id': metadata.userId,
      'accepted-at': metadata.acceptedAt,
      'terms-version': metadata.termsVersion,
      'privacy-version': metadata.privacyVersion,
      'document-hash': metadata.documentHash,
      'immutable': 'true'
    },
    
    // Tags for lifecycle management
    Tagging: `Type=LegalReceipt&UserId=${metadata.userId}&Version=${metadata.termsVersion}`
  });

  const response = await s3Client.send(command);
  
  return {
    s3Key,
    versionId: response.VersionId,
    etag: response.ETag,
    uploadedAt: new Date().toISOString()
  };
}

/**
 * Store receipt metadata in Postgres (dual evidence)
 */
async function storeReceiptInDatabase(metadata, s3Info) {
  const { data, error } = await supabase
    .from('legal_receipts')
    .insert([{
      receipt_id: metadata.receiptId,
      user_id: metadata.userId,
      email: metadata.email,
      accepted_at: metadata.acceptedAt,
      ip_address: metadata.ipAddress,
      user_agent: metadata.userAgent,
      terms_version: metadata.termsVersion,
      privacy_version: metadata.privacyVersion,
      terms_hash: metadata.termsHash,
      privacy_hash: metadata.privacyHash,
      document_hash: metadata.documentHash,
      s3_bucket: LEGAL_RECEIPTS_CONFIG.bucket,
      s3_key: s3Info.s3Key,
      s3_version_id: s3Info.versionId,
      s3_etag: s3Info.etag,
      retain_until_date: metadata.retainUntilDate,
      legal_hold: false,
      immutable: true,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * POST /api/legal-receipts/create
 * Create immutable legal receipt (write-once)
 */
router.post('/create', async (req, res) => {
  try {
    const {
      userId,
      email,
      ipAddress,
      userAgent,
      termsVersion,
      privacyVersion,
      termsHash,
      privacyHash
    } = req.body;

    // Validate required fields
    if (!userId || !email || !termsVersion || !privacyVersion) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['userId', 'email', 'termsVersion', 'privacyVersion']
      });
    }

    // Create receipt metadata
    const metadata = createReceiptMetadata({
      userId,
      email,
      timestamp: new Date().toISOString(),
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.get('user-agent'),
      termsVersion,
      privacyVersion,
      termsHash,
      privacyHash
    });

    // Generate PDF receipt
    const pdfBuffer = await generateReceiptPDF(metadata);
    
    // Calculate document hash for integrity verification
    metadata.documentHash = calculateDocumentHash(pdfBuffer);

    // Upload to S3 with Object Lock (COMPLIANCE mode)
    const s3Info = await uploadReceiptToS3(metadata, pdfBuffer);

    // Store metadata in Postgres (dual evidence)
    const dbRecord = await storeReceiptInDatabase(metadata, s3Info);

    res.status(201).json({
      success: true,
      receiptId: metadata.receiptId,
      s3Key: s3Info.s3Key,
      versionId: s3Info.versionId,
      documentHash: metadata.documentHash,
      retainUntilDate: metadata.retainUntilDate,
      immutable: true,
      message: 'Legal receipt created with lifetime retention (COMPLIANCE mode)'
    });

  } catch (error) {
    console.error('❌ Legal receipt creation failed:', error);
    res.status(500).json({
      error: 'Failed to create legal receipt',
      details: error.message
    });
  }
});

/**
 * GET /api/legal-receipts/:receiptId
 * Get receipt metadata (audit logged)
 */
router.get('/:receiptId', async (req, res) => {
  try {
    const { receiptId } = req.params;

    // Retrieve from Postgres
    const { data, error } = await supabase
      .from('legal_receipts')
      .select('*')
      .eq('receipt_id', receiptId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    // Log access for audit trail
    await supabase.from('legal_receipt_access_log').insert([{
      receipt_id: receiptId,
      accessed_by: req.user?.id || 'anonymous',
      access_type: 'metadata_view',
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      accessed_at: new Date().toISOString()
    }]);

    res.json({
      success: true,
      receipt: data
    });

  } catch (error) {
    console.error('❌ Receipt retrieval failed:', error);
    res.status(500).json({ error: 'Failed to retrieve receipt' });
  }
});

/**
 * GET /api/legal-receipts/:receiptId/download
 * Generate signed URL for PDF download (5-minute expiry)
 */
router.get('/:receiptId/download', async (req, res) => {
  try {
    const { receiptId } = req.params;

    // Retrieve receipt metadata
    const { data: receipt, error } = await supabase
      .from('legal_receipts')
      .select('*')
      .eq('receipt_id', receiptId)
      .single();

    if (error || !receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    // Generate signed URL (5-minute expiry)
    const command = new GetObjectCommand({
      Bucket: LEGAL_RECEIPTS_CONFIG.bucket,
      Key: receipt.s3_key,
      VersionId: receipt.s3_version_id
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: LEGAL_RECEIPTS_CONFIG.accessControl.signedUrlExpirySeconds
    });

    // Log download access
    await supabase.from('legal_receipt_access_log').insert([{
      receipt_id: receiptId,
      accessed_by: req.user?.id || 'anonymous',
      access_type: 'pdf_download',
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      accessed_at: new Date().toISOString()
    }]);

    res.json({
      success: true,
      receiptId,
      downloadUrl: signedUrl,
      expiresIn: LEGAL_RECEIPTS_CONFIG.accessControl.signedUrlExpirySeconds,
      documentHash: receipt.document_hash,
      message: 'Download URL expires in 5 minutes'
    });

  } catch (error) {
    console.error('❌ Signed URL generation failed:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

/**
 * POST /api/legal-receipts/:receiptId/legal-hold
 * Apply or remove legal hold on receipt (requires admin auth)
 * 
 * Legal Hold = "Forever freeze" - object cannot be deleted/overwritten
 * even past retain-until date, until hold is explicitly removed
 */
router.post('/:receiptId/legal-hold', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { receiptId } = req.params;
    const { action, reason, appliedBy, notes } = req.body;

    // Validate action
    if (!action || !['apply', 'remove'].includes(action)) {
      return res.status(400).json({
        error: 'Invalid action',
        validActions: ['apply', 'remove']
      });
    }

    // Validate reason when applying hold
    if (action === 'apply' && (!reason || !LEGAL_HOLD_REASONS[reason])) {
      return res.status(400).json({
        error: 'Invalid legal hold reason',
        validReasons: Object.keys(LEGAL_HOLD_REASONS)
      });
    }

    // Retrieve receipt
    const { data: receipt, error } = await supabase
      .from('legal_receipts')
      .select('*')
      .eq('receipt_id', receiptId)
      .single();

    if (error || !receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    // Check if hold already in desired state
    if (action === 'apply' && receipt.legal_hold) {
      return res.status(400).json({
        error: 'Legal hold already active',
        currentReason: receipt.legal_hold_reason
      });
    }

    if (action === 'remove' && !receipt.legal_hold) {
      return res.status(400).json({
        error: 'No active legal hold to remove'
      });
    }

    const holdStatus = action === 'apply' ? 'ON' : 'OFF';

    // Toggle legal hold on S3 object
    const holdCommand = new PutObjectLegalHoldCommand({
      Bucket: LEGAL_RECEIPTS_CONFIG.bucket,
      Key: receipt.s3_key,
      VersionId: receipt.s3_version_id,
      LegalHold: { Status: holdStatus }
    });

    await s3Client.send(holdCommand);

    // Update database record
    const updateData = {
      legal_hold: action === 'apply',
      legal_hold_reason: action === 'apply' ? LEGAL_HOLD_REASONS[reason] : null,
      legal_hold_applied_by: action === 'apply' ? appliedBy : null,
      legal_hold_applied_at: action === 'apply' ? new Date().toISOString() : null,
      legal_hold_removed_by: action === 'remove' ? appliedBy : null,
      legal_hold_removed_at: action === 'remove' ? new Date().toISOString() : null,
      legal_hold_notes: notes || null
    };

    await supabase
      .from('legal_receipts')
      .update(updateData)
      .eq('receipt_id', receiptId);

    // Log legal hold action to audit trail
    await supabase.from('legal_hold_audit_log').insert([{
      receipt_id: receiptId,
      action: action,
      reason: action === 'apply' ? LEGAL_HOLD_REASONS[reason] : 'Hold removed',
      applied_by: appliedBy,
      notes: notes,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      performed_at: new Date().toISOString()
    }]);

    res.json({
      success: true,
      receiptId,
      action,
      legalHold: action === 'apply',
      reason: action === 'apply' ? LEGAL_HOLD_REASONS[reason] : 'Hold removed',
      appliedBy,
      timestamp: new Date().toISOString(),
      message: action === 'apply' 
        ? 'Legal hold applied - receipt frozen indefinitely (cannot be deleted even past retain-until date)'
        : 'Legal hold removed - receipt follows normal retention rules (still immutable until retain-until date)'
    });

  } catch (error) {
    console.error('❌ Legal hold operation failed:', error);
    
    // Log failed attempt
    await supabase.from('legal_hold_audit_log').insert([{
      receipt_id: req.params.receiptId,
      action: req.body.action,
      applied_by: req.body.appliedBy,
      notes: 'Failed: ' + (error.message || 'Unknown error'),
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      performed_at: new Date().toISOString(),
      success: false
    }]).catch(() => {}); // Ignore audit log errors
    
    res.status(500).json({ 
      error: 'Failed to toggle legal hold',
      details: error.message
    });
  }
});

/**
 * GET /api/legal-receipts/user/:userId
 * Get all receipts for a user (audit logged)
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('legal_receipts')
      .select('receipt_id, accepted_at, terms_version, privacy_version, retain_until_date, legal_hold, immutable')
      .eq('user_id', userId)
      .order('accepted_at', { ascending: false });

    if (error) throw error;

    // Log access
    await supabase.from('legal_receipt_access_log').insert([{
      accessed_by: req.user?.id || 'anonymous',
      access_type: 'user_receipts_list',
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      accessed_at: new Date().toISOString(),
      metadata: { user_id: userId, count: data?.length || 0 }
    }]);

    res.json({
      success: true,
      userId,
      receipts: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('❌ User receipts retrieval failed:', error);
    res.status(500).json({ error: 'Failed to retrieve receipts' });
  }
});

module.exports = router;
