// API routes for creator application system
const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto-js');
const { createClient } = require('@supabase/supabase-js');
const { generateApprovalEmail, generateRejectionEmail, generateApplicationSubmittedEmail } = require('../src/utils/emailTemplates');

// Configure multer for ID document uploads (memory storage for encryption)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
    }
  }
});

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Helper function to send emails (placeholder - integrate with your email service)
async function sendEmail(to, subject, html, text) {
  // TODO: Integrate with your email service (SendGrid, AWS SES, etc.)
  console.log('Sending email:', { to, subject });
  
  // For now, just log the email content
  // In production, replace this with actual email sending logic
  try {
    // Example with SendGrid (uncomment and configure when ready):
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    await sgMail.send({
      to,
      from: 'noreply@fortheweebs.com',
      subject,
      html,
      text
    });
    */
    
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

// Encrypt ID document before storage
function encryptIDDocument(buffer) {
  const encryptionKey = process.env.ID_ENCRYPTION_KEY || 'default-key-change-this-in-production';
  const encrypted = crypto.AES.encrypt(buffer.toString('base64'), encryptionKey).toString();
  return encrypted;
}

// Upload ID document (encrypted)
router.post('/upload-id', upload.single('idDocument'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Encrypt the file buffer
    const encryptedData = encryptIDDocument(req.file.buffer);

    // Create a unique filename
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `id_docs/${crypto.SHA256(email + Date.now()).toString()}.${fileExtension}.enc`;

    // Upload encrypted file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('creator-compliance')
      .upload(fileName, Buffer.from(encryptedData), {
        contentType: 'application/octet-stream',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('ID upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload ID document' });
    }

    // Get public URL (even though file is encrypted)
    const { data: { publicUrl } } = supabase
      .storage
      .from('creator-compliance')
      .getPublicUrl(fileName);

    // Log the upload for compliance tracking
    const { error: logError } = await supabase
      .from('id_verification_logs')
      .insert([{
        email,
        file_name: fileName,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        uploaded_at: new Date().toISOString(),
        encrypted: true
      }]);

    if (logError) {
      console.error('Failed to log ID upload:', logError);
    }

    res.status(200).json({
      success: true,
      fileUrl: publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('ID upload error:', error);
    res.status(500).json({ error: 'Failed to upload ID document' });
  }
});

// Submit creator application
router.post('/submit', async (req, res) => {
  try {
    const applicationData = req.body;

    // Validate required fields
    if (!applicationData.fullName || !applicationData.email || !applicationData.stageName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email already has a pending or approved application
    const { data: existingApp } = await supabase
      .from('creator_applications')
      .select('*')
      .eq('email', applicationData.email)
      .in('status', ['pending', 'approved'])
      .single();

    if (existingApp) {
      return res.status(400).json({ 
        error: 'You already have a pending or approved application with this email' 
      });
    }

    // Insert application into database
    const { data: application, error } = await supabase
      .from('creator_applications')
      .insert([{
        ...applicationData,
        status: 'pending',
        submitted_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    // Send confirmation email to applicant
    const confirmationEmail = generateApplicationSubmittedEmail(application);
    await sendEmail(
      application.email,
      confirmationEmail.subject,
      confirmationEmail.html,
      confirmationEmail.text
    );

    res.status(200).json({ 
      success: true, 
      message: 'Application submitted successfully',
      applicationId: application.id 
    });

  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// List applications with filtering
router.get('/list', async (req, res) => {
  try {
    const { status = 'all' } = req.query;

    let query = supabase
      .from('creator_applications')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: applications, error } = await query;

    if (error) throw error;

    res.status(200).json({ applications });

  } catch (error) {
    console.error('Failed to fetch applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Make decision on application (approve/reject)
router.post('/decision', async (req, res) => {
  try {
    const { applicationId, decision, customMessage, reviewedBy } = req.body;

    if (!applicationId || !decision || !['approve', 'reject'].includes(decision)) {
      return res.status(400).json({ error: 'Invalid decision parameters' });
    }

    // Get the application
    const { data: application, error: fetchError } = await supabase
      .from('creator_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (fetchError || !application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update application status
    const { error: updateError } = await supabase
      .from('creator_applications')
      .update({
        status: decision === 'approve' ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy,
        decision_message: customMessage
      })
      .eq('id', applicationId);

    if (updateError) throw updateError;

    // Send appropriate email to applicant
    const emailTemplate = decision === 'approve' 
      ? generateApprovalEmail(application, customMessage)
      : generateRejectionEmail(application, customMessage);

    await sendEmail(
      application.email,
      emailTemplate.subject,
      emailTemplate.html,
      emailTemplate.text
    );

    // If approved, optionally create a provisional creator account
    if (decision === 'approve') {
      // TODO: Create creator account or send invite link
      // This depends on your user creation flow
    }

    res.status(200).json({ 
      success: true, 
      message: `Application ${decision}ed successfully` 
    });

  } catch (error) {
    console.error('Decision error:', error);
    res.status(500).json({ error: 'Failed to process decision' });
  }
});

// Get single application details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: application, error } = await supabase
      .from('creator_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.status(200).json({ application });

  } catch (error) {
    console.error('Failed to fetch application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

module.exports = router;
