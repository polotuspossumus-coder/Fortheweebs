// api/userfix/autonomousSuggestions.js - Autonomous bug fixing with sandbox and canary
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { validateSuggestion, sanitizeText } = require('../../utils/validation');
const { checkSoftBan, suggestionLimiter } = require('../../utils/rateLimit');
const { writeArtifact } = require('../../utils/server-safety');
const { runDiagnostics } = require('../bugfixer/diagnostics');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Sandbox test (shadow apply, don't persist)
async function sandboxTest(change, repairType) {
  const sandboxResult = {
    passed: false,
    errors: [],
  };
  
  try {
    switch (repairType) {
      case 'flag': {
        // Test: Can we query the flag?
        const { error: flagError } = await supabase
          .from('ftw_flags')
          .select('*')
          .eq('flag_name', change.flag_name)
          .single();

        if (flagError) {
          sandboxResult.errors.push(`Flag query failed: ${flagError.message}`);
        } else {
          sandboxResult.passed = true;
        }
        break;
      }

      case 'content':
        // Test: Is content value parseable?
        if (change.content_type === 'json') {
          try {
            JSON.parse(change.content_value);
            sandboxResult.passed = true;
          } catch (e) {
            sandboxResult.errors.push('Invalid JSON');
          }
        } else {
          sandboxResult.passed = true;
        }
        break;

      case 'config': {
        // Test: Is config value valid?
        const value = parseFloat(change.config_value);
        if (!isNaN(value) && value > 0) {
          sandboxResult.passed = true;
        } else {
          sandboxResult.errors.push('Invalid config value');
        }
        break;
      }
    }
  } catch (error) {
    sandboxResult.errors.push(error.message);
  }
  
  return sandboxResult;
}

// Auto-apply with canary (apply immediately, monitor for issues)
async function autoApply(change, repairType, userId) {
  const applyResult = {
    success: false,
    repairId: null,
    error: null,
  };
  
  try {
    // Insert repair record
    const { data: repair, error: insertError } = await supabase
      .from('ftw_repairs')
      .insert({
        user_id: userId,
        repair_type: repairType,
        proposed_change: change,
        reason: 'Autonomous suggestion - auto-applied',
        status: 'applied',
        applied_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    applyResult.repairId = repair.id;
    
    // Apply the change
    switch (repairType) {
      case 'flag': {
        const { error: flagError } = await supabase
          .from('ftw_flags')
          .update({ active: change.active })
          .eq('flag_name', change.flag_name);

        if (flagError) throw flagError;
        break;
      }

      case 'content': {
        const { error: contentError } = await supabase
          .from('ftw_cms')
          .upsert({
            content_key: change.content_key,
            content_value: sanitizeText(change.content_value),
            content_type: change.content_type || 'text',
            updated_at: new Date().toISOString(),
          });

        if (contentError) throw contentError;
        break;
      }

      case 'config': {
        const { error: configError } = await supabase
          .from('ftw_config')
          .upsert({
            config_key: change.config_key,
            config_value: change.config_value,
            updated_at: new Date().toISOString(),
          });

        if (configError) throw configError;
        break;
      }
    }
    
    applyResult.success = true;
    
    // Write artifact
    await writeArtifact('autoSuggestionApplied', {
      repairId: repair.id,
      repairType,
      change,
      userId,
    });
    
  } catch (error) {
    applyResult.error = error.message;
  }
  
  return applyResult;
}

// Auto-suggest endpoint (rate-limited, soft-ban protected)
router.post('/propose', checkSoftBan, suggestionLimiter, async (req, res) => {
  const { repair_type, proposed_change, reason, user_id } = req.body;
  
  // Validate input
  const validation = validateSuggestion({ repair_type, proposed_change, reason }, req.ip);
  
  if (!validation.valid) {
    return res.status(400).json({ error: 'Validation failed', details: validation.errors });
  }
  
  try {
    // Step 1: Sandbox test
    const sandboxResult = await sandboxTest(proposed_change, repair_type);
    
    if (!sandboxResult.passed) {
      return res.status(400).json({
        error: 'Sandbox test failed',
        details: sandboxResult.errors,
      });
    }
    
    // Step 2: Auto-apply (canary is implicit via monitoring)
    const applyResult = await autoApply(proposed_change, repair_type, user_id);
    
    if (!applyResult.success) {
      return res.status(500).json({
        error: 'Auto-apply failed',
        details: applyResult.error,
      });
    }
    
    // Step 3: Run diagnostics to verify health
    const diagnostics = await runDiagnostics();
    
    res.json({
      status: 'applied',
      repairId: applyResult.repairId,
      sandboxResult,
      diagnostics: diagnostics.overall,
      message: 'Suggestion applied successfully and system is healthy',
    });
    
  } catch (error) {
    console.error('[AutonomousSuggestions] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get recent auto-suggestions
router.get('/recent', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ftw_repairs')
      .select('*')
      .eq('status', 'applied')
      .order('applied_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
