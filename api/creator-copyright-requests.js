/**
 * Creator-Direct Copyright Request System with AI Validation
 *
 * Allows copyright holders to contact creators directly to request takedowns.
 * AI validates requests to prevent pranks/abuse.
 *
 * Different from DMCA system (which is admin-facing).
 * This is creator-to-creator communication with platform facilitation.
 */

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const OpenAI = require('openai');
const jwt = require('jsonwebtoken');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ==========================================
// MIDDLEWARE: Authenticate User
// ==========================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// ==========================================
// PUBLIC: Submit Copyright Request
// ==========================================
/**
 * POST /api/creator-copyright/submit
 *
 * Copyright holders submit request to contact creator about infringement.
 * AI validates legitimacy before forwarding to creator.
 */
router.post('/submit', async (req, res) => {
  try {
    const {
      complainant_name,
      complainant_email,
      copyright_work_title,
      copyright_work_description,
      copyright_work_url, // Where original work is published
      copyright_proof_urls, // Portfolio, website, social media showing ownership
      infringing_content_url, // Creator's content that allegedly infringes
      infringing_creator_username,
      explanation, // Why they believe it infringes
      good_faith_statement
    } = req.body;

    // Validate required fields
    if (!complainant_name || !complainant_email || !copyright_work_title ||
        !infringing_content_url || !infringing_creator_username || !explanation) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['complainant_name', 'complainant_email', 'copyright_work_title',
                  'infringing_content_url', 'infringing_creator_username', 'explanation']
      });
    }

    // Find creator by username
    const { data: creator, error: creatorError } = await supabase
      .from('users')
      .select('id, username, email, display_name')
      .eq('username', infringing_creator_username)
      .single();

    if (creatorError || !creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    // Create request in database (status: PENDING_VALIDATION)
    const { data: request, error: insertError } = await supabase
      .from('creator_copyright_requests')
      .insert([{
        complainant_name,
        complainant_email,
        copyright_work_title,
        copyright_work_description,
        copyright_work_url,
        copyright_proof_urls: copyright_proof_urls || [],
        infringing_content_url,
        infringing_creator_id: creator.id,
        infringing_creator_username: creator.username,
        explanation,
        good_faith_statement: good_faith_statement || false,
        status: 'PENDING_VALIDATION',
        ai_validation_status: 'PENDING',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating copyright request:', insertError);
      return res.status(500).json({ error: 'Failed to submit request' });
    }

    // Trigger AI validation asynchronously
    validateRequestWithAI(request.id).catch(err => {
      console.error('AI validation error:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Copyright request submitted successfully',
      request_id: request.id,
      status: 'Your request is being validated by AI. You will be notified of the result.',
      next_steps: [
        'AI will review your request for legitimacy (1-2 minutes)',
        'If valid, creator will be notified and given 7 days to respond',
        'If invalid (prank/abuse), request will be rejected',
        'You will receive email updates at ' + complainant_email
      ]
    });

  } catch (error) {
    console.error('Error submitting copyright request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// AI VALIDATION FUNCTION
// ==========================================
async function validateRequestWithAI(requestId) {
  try {
    // Get request from database
    const { data: request, error: fetchError } = await supabase
      .from('creator_copyright_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      console.error('Failed to fetch request for validation:', fetchError);
      return;
    }

    // Prepare AI validation prompt
    const prompt = `You are an AI trained to detect fraudulent or prank copyright takedown requests. Analyze the following copyright infringement claim and determine if it appears legitimate or if it's likely a prank/abuse.

**Copyright Holder Information:**
- Name: ${request.complainant_name}
- Email: ${request.complainant_email}
- Original Work Title: ${request.copyright_work_title}
- Original Work Description: ${request.copyright_work_description || 'Not provided'}
- Original Work URL: ${request.copyright_work_url || 'Not provided'}
- Proof of Ownership URLs: ${request.copyright_proof_urls.join(', ') || 'Not provided'}

**Alleged Infringement:**
- Infringing Content URL: ${request.infringing_content_url}
- Creator Username: ${request.infringing_creator_username}
- Explanation: ${request.explanation}
- Good Faith Statement: ${request.good_faith_statement ? 'Yes' : 'No'}

**Your Task:**
Analyze this request and determine:
1. Does this appear to be a legitimate copyright concern?
2. Is there sufficient evidence of ownership?
3. Is the explanation coherent and specific?
4. Are there red flags suggesting this is a prank, harassment, or abuse?

**Red Flags to Look For:**
- Vague or nonsensical explanations
- Missing or fake proof of ownership
- Suspicious email addresses (throwaway, fake)
- Targeting of specific creator without legitimate reason
- Unreasonable claims (claiming copyright on common concepts)
- Trolling language or harassment indicators

**Response Format (JSON):**
{
  "is_legitimate": true/false,
  "confidence": 0-100,
  "reasoning": "Brief explanation of your decision",
  "red_flags": ["list", "of", "red", "flags", "found"],
  "recommendation": "APPROVE" or "REJECT" or "MANUAL_REVIEW"
}

Respond ONLY with valid JSON.`;

    // Call OpenAI for validation
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert at detecting fraudulent copyright claims and protecting creators from harassment.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent judgments
      max_tokens: 500
    });

    const aiResponse = completion.choices[0].message.content;
    let validation;

    try {
      // Parse AI response (remove markdown if present)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        validation = JSON.parse(jsonMatch[0]);
      } else {
        validation = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Default to manual review if AI response is unparseable
      validation = {
        is_legitimate: null,
        confidence: 0,
        reasoning: 'AI response could not be parsed',
        red_flags: ['AI parsing error'],
        recommendation: 'MANUAL_REVIEW'
      };
    }

    // Determine final status based on AI recommendation
    let finalStatus;
    let notifyCreator = false;

    if (validation.recommendation === 'APPROVE' && validation.confidence >= 70) {
      finalStatus = 'APPROVED_PENDING_CREATOR';
      notifyCreator = true;
    } else if (validation.recommendation === 'REJECT' && validation.confidence >= 70) {
      finalStatus = 'REJECTED_BY_AI';
    } else {
      finalStatus = 'MANUAL_REVIEW_REQUIRED';
    }

    // Update request with AI validation results
    const { error: updateError } = await supabase
      .from('creator_copyright_requests')
      .update({
        status: finalStatus,
        ai_validation_status: 'COMPLETED',
        ai_validation_result: validation,
        ai_confidence_score: validation.confidence,
        ai_reasoning: validation.reasoning,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Failed to update request with AI validation:', updateError);
      return;
    }

    // If approved, notify creator
    if (notifyCreator) {
      await notifyCreatorOfRequest(requestId);
    }

    // Notify complainant of result
    await notifyComplainantOfValidation(requestId, finalStatus, validation);

    console.log(`✅ AI validation complete for request ${requestId}: ${finalStatus} (confidence: ${validation.confidence}%)`);

  } catch (error) {
    console.error('Error in AI validation:', error);

    // Update request to manual review on error
    await supabase
      .from('creator_copyright_requests')
      .update({
        status: 'MANUAL_REVIEW_REQUIRED',
        ai_validation_status: 'FAILED',
        ai_reasoning: 'AI validation encountered an error',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);
  }
}

// ==========================================
// NOTIFY CREATOR OF REQUEST
// ==========================================
async function notifyCreatorOfRequest(requestId) {
  try {
    const { data: request } = await supabase
      .from('creator_copyright_requests')
      .select('*, users!inner(*)')
      .eq('id', requestId)
      .single();

    if (!request) return;

    // Create notification for creator
    await supabase
      .from('notifications')
      .insert([{
        user_id: request.infringing_creator_id,
        type: 'COPYRIGHT_REQUEST',
        title: 'Copyright Request Received',
        message: `${request.complainant_name} has submitted a copyright request regarding your content. Please review and respond within 7 days.`,
        link: `/copyright-requests/${requestId}`,
        read: false,
        created_at: new Date().toISOString()
      }]);

    // Log notification
    console.log(`📧 Creator ${request.infringing_creator_username} notified of copyright request ${requestId}`);

    // TODO: Send email to creator (optional)
    // await sendEmail(request.users.email, 'Copyright Request', emailTemplate);

  } catch (error) {
    console.error('Error notifying creator:', error);
  }
}

// ==========================================
// NOTIFY COMPLAINANT OF VALIDATION RESULT
// ==========================================
async function notifyComplainantOfValidation(requestId, status, validation) {
  try {
    const { data: request } = await supabase
      .from('creator_copyright_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request) return;

    let message;
    if (status === 'APPROVED_PENDING_CREATOR') {
      message = `Your copyright request has been validated and forwarded to ${request.infringing_creator_username}. They have 7 days to respond.`;
    } else if (status === 'REJECTED_BY_AI') {
      message = `Your copyright request was rejected. Reason: ${validation.reasoning}. If you believe this is an error, please contact support@fortheweebs.com.`;
    } else {
      message = `Your copyright request requires manual review. Our team will review it within 48 hours.`;
    }

    // Log notification (in production, send email)
    console.log(`📧 Complainant ${request.complainant_email} notified: ${message}`);

    // TODO: Send email to complainant
    // await sendEmail(request.complainant_email, 'Copyright Request Status', message);

  } catch (error) {
    console.error('Error notifying complainant:', error);
  }
}

// ==========================================
// CREATOR: View Requests
// ==========================================
/**
 * GET /api/creator-copyright/my-requests
 *
 * Creator views copyright requests directed at them.
 */
router.get('/my-requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: requests, error } = await supabase
      .from('creator_copyright_requests')
      .select('*')
      .eq('infringing_creator_id', userId)
      .in('status', ['APPROVED_PENDING_CREATOR', 'CREATOR_RESPONDED', 'RESOLVED', 'ESCALATED'])
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch requests' });
    }

    res.json({
      requests: requests.map(r => ({
        id: r.id,
        complainant_name: r.complainant_name,
        copyright_work_title: r.copyright_work_title,
        explanation: r.explanation,
        infringing_content_url: r.infringing_content_url,
        status: r.status,
        created_at: r.created_at,
        response_deadline: new Date(new Date(r.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }))
    });

  } catch (error) {
    console.error('Error fetching creator requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// CREATOR: Respond to Request
// ==========================================
/**
 * POST /api/creator-copyright/:requestId/respond
 *
 * Creator responds to copyright request.
 */
router.post('/:requestId/respond', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const { response_type, response_message, action_taken } = req.body;

    // Valid response types: AGREE_REMOVE, DISPUTE, COUNTER_CLAIM
    if (!['AGREE_REMOVE', 'DISPUTE', 'COUNTER_CLAIM'].includes(response_type)) {
      return res.status(400).json({
        error: 'Invalid response type',
        valid_types: ['AGREE_REMOVE', 'DISPUTE', 'COUNTER_CLAIM']
      });
    }

    // Verify request belongs to this creator
    const { data: request, error: fetchError } = await supabase
      .from('creator_copyright_requests')
      .select('*')
      .eq('id', requestId)
      .eq('infringing_creator_id', userId)
      .single();

    if (fetchError || !request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Update request with creator response
    let newStatus;
    if (response_type === 'AGREE_REMOVE') {
      newStatus = 'RESOLVED_CONTENT_REMOVED';
    } else if (response_type === 'DISPUTE') {
      newStatus = 'ESCALATED_TO_ADMIN';
    } else {
      newStatus = 'COUNTER_CLAIM_FILED';
    }

    const { error: updateError } = await supabase
      .from('creator_copyright_requests')
      .update({
        status: newStatus,
        creator_response_type: response_type,
        creator_response_message: response_message,
        creator_action_taken: action_taken,
        creator_responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to submit response' });
    }

    res.json({
      success: true,
      message: 'Response submitted successfully',
      status: newStatus,
      next_steps: response_type === 'AGREE_REMOVE'
        ? 'Request marked as resolved. Complainant will be notified.'
        : 'Request escalated to admin for review.'
    });

  } catch (error) {
    console.error('Error responding to request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// ADMIN: View All Requests
// ==========================================
/**
 * GET /api/creator-copyright/admin/all
 *
 * Admin views all copyright requests (for manual review).
 */
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin/owner
    const userId = req.user.id;
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || !['admin', 'owner', 'moderator'].includes(user.role)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status } = req.query;

    let query = supabase
      .from('creator_copyright_requests')
      .select('*, users!inner(username, email, display_name)')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: requests, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch requests' });
    }

    res.json({ requests });

  } catch (error) {
    console.error('Error fetching admin requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// ADMIN: Manual Review Decision
// ==========================================
/**
 * POST /api/creator-copyright/admin/:requestId/review
 *
 * Admin makes decision on request requiring manual review.
 */
router.post('/admin/:requestId/review', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const { decision, admin_notes } = req.body;

    // Check admin access
    const { data: user } = await supabase
      .from('users')
      .select('role, username')
      .eq('id', userId)
      .single();

    if (!user || !['admin', 'owner', 'moderator'].includes(user.role)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Valid decisions: APPROVE, REJECT, ESCALATE
    if (!['APPROVE', 'REJECT', 'ESCALATE'].includes(decision)) {
      return res.status(400).json({
        error: 'Invalid decision',
        valid_decisions: ['APPROVE', 'REJECT', 'ESCALATE']
      });
    }

    const newStatus = decision === 'APPROVE'
      ? 'APPROVED_PENDING_CREATOR'
      : decision === 'REJECT'
        ? 'REJECTED_BY_ADMIN'
        : 'ESCALATED_LEGAL_REVIEW';

    const { error: updateError } = await supabase
      .from('creator_copyright_requests')
      .update({
        status: newStatus,
        admin_review_decision: decision,
        admin_review_notes: admin_notes,
        reviewed_by: user.username,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update request' });
    }

    // If approved, notify creator
    if (decision === 'APPROVE') {
      await notifyCreatorOfRequest(requestId);
    }

    res.json({
      success: true,
      message: `Request ${decision.toLowerCase()}d by admin`,
      status: newStatus
    });

  } catch (error) {
    console.error('Error in admin review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
