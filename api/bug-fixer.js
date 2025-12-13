/**
 * Bug Fixer API - Automatic error tracking and AI-powered bug analysis
 * Routes: POST /api/bug-fixer/report, GET /api/bug-fixer/list, POST /api/bug-fixer/analyze
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Report a new bug
 * POST /api/bug-fixer/report
 */
async function reportBug(req, res) {
  try {
    const {
      errorMessage,
      errorStack,
      errorType,
      severity,
      userId,
      userEmail,
      pageUrl,
      userAgent,
      browserInfo,
      screenshotData,
      system,
      component,
      additionalData
    } = req.body;

    if (!errorMessage || !pageUrl || !severity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: errorMessage, pageUrl, severity'
      });
    }

    // Generate unique report ID
    const reportId = `BUG-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Insert bug report
    const { data, error } = await supabase
      .from('bug_reports')
      .insert({
        report_id: reportId,
        error_message: errorMessage,
        error_stack: errorStack,
        error_type: errorType || 'frontend',
        severity,
        user_id: userId,
        user_email: userEmail,
        page_url: pageUrl,
        user_agent: userAgent,
        browser_info: browserInfo,
        screenshot_data: screenshotData,
        system,
        component,
        additional_data: additionalData,
        status: 'open'
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to save bug report'
      });
    }

    res.json({
      success: true,
      reportId,
      message: 'Bug report submitted successfully',
      data
    });
  } catch (error) {
    console.error('Bug report error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Analyze bug with AI
 * POST /api/bug-fixer/analyze
 */
async function analyzeBug(req, res) {
  try {
    const { reportId } = req.body;

    if (!reportId) {
      return res.status(400).json({
        success: false,
        error: 'Missing reportId'
      });
    }

    // Get bug report
    const { data: bugReport, error: fetchError } = await supabase
      .from('bug_reports')
      .select('*')
      .eq('report_id', reportId)
      .single();

    if (fetchError || !bugReport) {
      return res.status(404).json({
        success: false,
        error: 'Bug report not found'
      });
    }

    // Update status to analyzing
    await supabase
      .from('bug_reports')
      .update({ status: 'analyzing' })
      .eq('report_id', reportId);

    // Call OpenAI for analysis
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key not configured'
      });
    }

    const analysisPrompt = `Analyze this bug report and provide a fix suggestion:

Error: ${bugReport.error_message}
Stack: ${bugReport.error_stack || 'Not provided'}
Page: ${bugReport.page_url}
Component: ${bugReport.component || 'Unknown'}
System: ${bugReport.system || 'Unknown'}

Browser: ${bugReport.user_agent || 'Not provided'}
Additional Context: ${JSON.stringify(bugReport.additional_data) || 'None'}

Provide:
1. Root cause analysis
2. Suggested fix (code changes if applicable)
3. Prevention strategies`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert software debugger and developer. Analyze bugs and provide actionable fixes.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    const analysis = openaiData.choices[0].message.content;

    // Update bug report with AI analysis
    const { data: updatedReport, error: updateError } = await supabase
      .from('bug_reports')
      .update({
        ai_analysis: analysis,
        suggested_fix: analysis, // Store full analysis as suggested fix
        status: 'open' // Keep open until manually reviewed
      })
      .eq('report_id', reportId)
      .select()
      .single();

    if (updateError) {
    }

    res.json({
      success: true,
      reportId,
      analysis,
      updatedReport
    });
  } catch (error) {
    console.error('Bug analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * List bug reports
 * GET /api/bug-fixer/list
 */
async function listBugs(req, res) {
  try {
    const { status, severity, limit = 50 } = req.query;

    let query = supabase
      .from('bug_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (status) {
      query = query.eq('status', status);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch bug reports'
      });
    }

    res.json({
      success: true,
      bugs: data,
      count: data.length
    });
  } catch (error) {
    console.error('List bugs error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Mark bug as fixed
 * POST /api/bug-fixer/resolve
 */
async function resolveBug(req, res) {
  try {
    const { reportId, resolutionNotes, resolvedBy } = req.body;

    if (!reportId) {
      return res.status(400).json({
        success: false,
        error: 'Missing reportId'
      });
    }

    const { data, error } = await supabase
      .from('bug_reports')
      .update({
        status: 'fixed',
        fix_applied: true,
        resolution_notes: resolutionNotes || 'Manually resolved',
        resolved_by: resolvedBy || 'admin',
        resolved_at: new Date().toISOString()
      })
      .eq('report_id', reportId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to resolve bug'
      });
    }

    res.json({
      success: true,
      message: 'Bug marked as resolved',
      data
    });
  } catch (error) {
    console.error('Resolve bug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// POST /api/bug-fixer/report
router.post('/report', reportBug);

// POST /api/bug-fixer/analyze
router.post('/analyze', analyzeBug);

// GET /api/bug-fixer/list
router.get('/list', listBugs);

// POST /api/bug-fixer/resolve
router.post('/resolve', resolveBug);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    endpoints: {
      report: 'POST /api/bug-fixer/report',
      analyze: 'POST /api/bug-fixer/analyze',
      list: 'GET /api/bug-fixer/list',
      resolve: 'POST /api/bug-fixer/resolve'
    }
  });
});

module.exports = router;
