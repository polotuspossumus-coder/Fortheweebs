/**
 * Governance Ritual API
 * Handles ban proposals, crown restorations, and artifact resurrections
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_KEY
);

export async function POST(request) {
  try {
    const { action, targetId, reason, timestamp } = await request.json();

    if (!action || !targetId || !reason) {
      return new Response(JSON.stringify({
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate action type
    const validActions = ['ban', 'crown', 'resurrect'];
    if (!validActions.includes(action)) {
      return new Response(JSON.stringify({
        error: 'Invalid action type'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Store ritual in database
    const { data, error } = await supabase
      .from('governance_rituals')
      .insert({
        action: action,
        target_id: targetId,
        reason: reason,
        status: 'pending',
        created_at: timestamp || new Date().toISOString(),
        submitted_by: request.headers.get('x-user-id') || 'anonymous'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({
        error: 'Failed to save ritual',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Execute ritual action based on type
    let actionResult;
    switch (action) {
      case 'ban':
        actionResult = await processBanProposal(targetId, reason);
        break;
      case 'crown':
        actionResult = await processCrownRestoration(targetId, reason);
        break;
      case 'resurrect':
        actionResult = await processArtifactResurrection(targetId, reason);
        break;
    }

    // Update ritual status
    await supabase
      .from('governance_rituals')
      .update({
        status: actionResult.success ? 'approved' : 'pending_review',
        result: actionResult.message
      })
      .eq('id', data.id);

    return new Response(JSON.stringify({
      success: true,
      message: actionResult.message,
      ritualId: data.id,
      action: action
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Governance ritual error:', error);
    return new Response(JSON.stringify({
      error: 'Ritual processing failed',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function processBanProposal(userId, reason) {
  // Log ban proposal for admin review
  await supabase
    .from('ban_proposals')
    .insert({
      user_id: userId,
      reason: reason,
      status: 'pending_council_review',
      created_at: new Date().toISOString()
    });

  return {
    success: true,
    message: `Ban proposal for ${userId} has been submitted to the AI Council for review.`
  };
}

async function processCrownRestoration(userId, reason) {
  // Restore user privileges
  const { error } = await supabase
    .from('users')
    .update({
      status: 'active',
      restored_at: new Date().toISOString(),
      restoration_reason: reason
    })
    .eq('id', userId);

  if (error) {
    return {
      success: false,
      message: `Failed to restore crown for ${userId}: ${error.message}`
    };
  }

  return {
    success: true,
    message: `Crown has been restored for ${userId}. Welcome back!`
  };
}

async function processArtifactResurrection(artifactId, reason) {
  // Restore deleted/archived artifact
  const { error } = await supabase
    .from('artifacts')
    .update({
      status: 'active',
      resurrected_at: new Date().toISOString(),
      resurrection_reason: reason
    })
    .eq('id', artifactId);

  if (error) {
    return {
      success: false,
      message: `Failed to resurrect artifact ${artifactId}: ${error.message}`
    };
  }

  return {
    success: true,
    message: `Artifact ${artifactId} has been resurrected from the graveyard.`
  };
}

// GET endpoint to fetch ritual history
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;

    const { data, error } = await supabase
      .from('governance_rituals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({
      rituals: data,
      count: data.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Fetch rituals error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch rituals',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
