/**
 * SERVER-SIDE ANTI-PIRACY UTILITIES
 * Node.js compatible version for backend use
 * BULLETPROOF EDITION with hash checking and abuse prevention
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const { logModerationAction } = require('./legalCompliance');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Comprehensive list of copyrighted series/movies
const BLOCKED_SERIES = [
  // Top Anime
  'naruto', 'one piece', 'bleach', 'dragon ball', 'dragonball',
  'attack on titan', 'shingeki no kyojin',
  'demon slayer', 'kimetsu no yaiba',
  'jujutsu kaisen', 'my hero academia', 'boku no hero',
  'hunter x hunter', 'death note', 'fullmetal alchemist',
  'sword art online', 'sao', 'tokyo ghoul', 'fairy tail',
  'black clover', 'chainsaw man', 'spy x family',
  'one punch man', 'mob psycho', 'steins gate',
  'cowboy bebop', 'neon genesis evangelion',
  
  // Hentai Series
  'boku no pico', 'euphoria', 'bible black', 'discipline',
  'mankitsu happening', 'resort boin', 'kanojo x kanojo',
  'princess lover', 'rance', 'taimanin asagi',
  
  // Western Shows
  'game of thrones', 'breaking bad', 'the office', 'friends',
  'stranger things', 'mandalorian', 'rick and morty',
  'south park', 'family guy', 'simpsons',
  
  // Movies
  'avengers', 'star wars', 'harry potter', 'lord of the rings',
  'spider-man', 'spiderman', 'batman', 'superman',
  'jurassic park', 'transformers', 'frozen', 'moana',
  
  // Piracy indicators
  'season', 'episode', 'complete series', 'full season',
  'batch', 'torrent', '1080p', '720p', '480p',
  'bluray', 'blu-ray', 'webrip', 'web-dl', 'hdtv',
  'x264', 'x265', 'hevc', 'h.264', 'h.265',
  'horriblesubs', 'subsplease', 'erai-raws', 'commie'
];

const PIRACY_PATTERNS = [
  /S\d{2}E\d{2}/i, // S01E05
  /\[.*\]/i, // [GroupName]
  /\d{3,4}p/i, // 1080p, 720p
  /x26[45]/i, // x264, x265
  /BluRay|WEB-?DL|HDTV|WEBRip/i,
  /season \d+/i,
  /episode \d+/i,
  /ep\d+/i,
  /complete/i,
  /batch/i
];

/**
 * Main piracy check function
 */
async function checkForPiracy(file, userId, options = {}) {
  const results = {
    isBlocked: false,
    violations: [],
    riskScore: 0
  };
  
  try {
    // 0. Check if user is banned
    const isBanned = await checkUserBan(userId);
    if (isBanned) {
      return {
        isBlocked: true,
        violations: [{
          type: 'USER_BANNED',
          severity: 'CRITICAL',
          message: 'Your account is currently banned from uploading',
          blocked: true
        }]
      };
    }
    
    // 1. Check file hash against blocklist (prevents re-upload)
    if (file.buffer) {
      const fileHash = crypto.createHash('md5').update(file.buffer).digest('hex');
      const hashCheck = await checkContentHash(fileHash);
      
      if (hashCheck.isBlocked) {
        results.violations.push({
          type: 'BLOCKED_HASH',
          severity: 'CRITICAL',
          message: 'This exact file was previously identified as pirated content',
          blocked: true,
          riskScore: 100
        });
        
        // Log hash circumvention attempt
        await logSuspiciousActivity(userId, 'HASH_MATCH_ATTEMPT', {
          fileHash,
          fileName: file.name
        });
      }
    }
    
    // 2. Filename check
    const filenameViolations = checkFilename(file.name);
    results.violations.push(...filenameViolations);
    
    // 2. File size check (large video files are suspicious)
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 50 && sizeMB < 5000) {
      const isSuspiciousSize = (sizeMB >= 150 && sizeMB <= 500); // Typical episode size
      if (isSuspiciousSize) {
        results.violations.push({
          type: 'SUSPICIOUS_SIZE',
          severity: 'MEDIUM',
          message: `File size (${Math.round(sizeMB)}MB) matches typical pirated episode`,
          blocked: false,
          riskScore: 30
        });
      }
    }
    
    // 3. Check metadata if provided
    if (options.metadata) {
      const metadataViolations = checkMetadata(options.metadata);
      results.violations.push(...metadataViolations);
    }
    
    // 4. Check user history
    const userHistory = await getUserPiracyHistory(userId);
    if (userHistory.strikeCount >= 2) {
      results.violations.push({
        type: 'REPEAT_OFFENDER',
        severity: 'HIGH',
        message: `User has ${userHistory.strikeCount} previous piracy violations`,
        blocked: true,
        riskScore: 50
      });
    }
    
    // 5. Check for suspicious patterns (rapid uploads, testing system)
    const suspiciousCheck = await detectAbusePatterns(userId);
    if (suspiciousCheck.isSuspicious) {
      results.violations.push({
        type: 'SUSPICIOUS_BEHAVIOR',
        severity: 'HIGH',
        message: suspiciousCheck.message,
        blocked: suspiciousCheck.autoBlock,
        riskScore: 40
      });
    }
    
    // Calculate total risk score
    results.riskScore = results.violations.reduce((sum, v) => sum + (v.riskScore || 0), 0);
    
    // Block if any critical violations or high risk score
    results.isBlocked = results.violations.some(v => v.blocked) || results.riskScore >= 80;
    
    // Log the check with full audit trail
    await logPiracyCheck(userId, file.name, results);
    
    // If blocked, add hash to blocklist and log moderation action
    if (results.isBlocked && file.buffer) {
      const fileHash = crypto.createHash('md5').update(file.buffer).digest('hex');
      await addToBlockedHashes(fileHash, file.name, results.violations[0]?.type);
      
      // Legal compliance logging
      await logModerationAction({
        actionType: 'CONTENT_BLOCKED_PIRACY',
        userId,
        reason: results.violations.map(v => v.message).join('; '),
        evidence: { fileName: file.name, violations: results.violations },
        performedBy: 'SYSTEM'
      });
    }
    
    // Auto-report if critical
    if (results.isBlocked) {
      await reportPiracyAttempt(userId, file.name, results.violations);
    }
    
  } catch (error) {
    console.error('Piracy check error:', error);
    // FAIL SECURE
    return {
      isBlocked: true,
      violations: [{
        type: 'CHECK_ERROR',
        severity: 'HIGH',
        message: 'Unable to verify content - blocked for safety',
        blocked: true
      }]
    };
  }
  
  return results;
}

/**
 * Check filename for piracy indicators
 */
function checkFilename(filename) {
  const violations = [];
  const lower = filename.toLowerCase();
  
  // Check blocked series
  for (const series of BLOCKED_SERIES) {
    if (lower.includes(series)) {
      violations.push({
        type: 'COPYRIGHTED_CONTENT',
        severity: 'CRITICAL',
        detected: series,
        message: `Filename contains copyrighted series: "${series}"`,
        blocked: true,
        riskScore: 100
      });
    }
  }
  
  // Check piracy patterns
  for (const pattern of PIRACY_PATTERNS) {
    if (pattern.test(filename)) {
      violations.push({
        type: 'PIRACY_PATTERN',
        severity: 'HIGH',
        detected: pattern.toString(),
        message: 'Filename matches common piracy distribution pattern',
        blocked: true,
        riskScore: 80
      });
    }
  }
  
  return violations;
}

/**
 * Check video metadata
 */
function checkMetadata(metadata) {
  const violations = [];
  
  // Check for fansub groups in metadata
  const metaString = JSON.stringify(metadata).toLowerCase();
  const fansubGroups = ['horriblesubs', 'subsplease', 'erai-raws', 'commie', 'underwater'];
  
  for (const group of fansubGroups) {
    if (metaString.includes(group)) {
      violations.push({
        type: 'FANSUB_GROUP',
        severity: 'CRITICAL',
        detected: group,
        message: `Video metadata contains fansub group: ${group}`,
        blocked: true,
        riskScore: 100
      });
    }
  }
  
  return violations;
}

/**
 * Get user's piracy violation history
 */
async function getUserPiracyHistory(userId) {
  try {
    const { data, error } = await supabase
      .from('piracy_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('is_blocked', true)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
    
    if (error) throw error;
    
    return {
      strikeCount: data?.length || 0,
      recentAttempts: data || []
    };
  } catch (error) {
    console.error('Error checking user history:', error);
    return { strikeCount: 0, recentAttempts: [] };
  }
}

/**
 * Log piracy check to database
 */
async function logPiracyCheck(userId, filename, results) {
  try {
    await supabase.from('piracy_logs').insert({
      user_id: userId,
      filename: filename,
      is_blocked: results.isBlocked,
      violations_count: results.violations.length,
      violations: results.violations,
      risk_score: results.riskScore,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error logging piracy check:', error);
  }
}

/**
 * Report critical piracy attempt
 */
async function reportPiracyAttempt(userId, filename, violations) {
  try {
    await supabase.from('admin_alerts').insert({
      type: 'PIRACY_ATTEMPT',
      severity: 'CRITICAL',
      user_id: userId,
      details: {
        filename,
        violations: violations.map(v => ({
          type: v.type,
          detected: v.detected,
          message: v.message
        })),
        timestamp: new Date().toISOString()
      },
      requires_action: true
    });
    
    console.warn(`🚨 PIRACY BLOCKED: User ${userId} - "${filename}"`);
  } catch (error) {
    console.error('Error reporting piracy:', error);
  }
}

/**
 * NEW: Check if user is banned
 */
async function checkUserBan(userId) {
  try {
    const { data, error } = await supabase
      .from('user_bans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('ban_type.eq.PERMANENT,expires_at.gt.' + new Date().toISOString())
      .limit(1);
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking user ban:', error);
    return false;
  }
}

/**
 * NEW: Check content hash against blocklist
 */
async function checkContentHash(fileHash) {
  try {
    const { data, error } = await supabase
      .from('blocked_content_hashes')
      .select('*')
      .eq('file_hash', fileHash)
      .limit(1);
    
    if (data && data.length > 0) {
      return {
        isBlocked: true,
        reason: data[0].reason,
        blockedAt: data[0].blocked_at
      };
    }
    
    return { isBlocked: false };
  } catch (error) {
    console.error('Error checking content hash:', error);
    return { isBlocked: false };
  }
}

/**
 * NEW: Add hash to blocklist
 */
async function addToBlockedHashes(fileHash, fileName, reason) {
  try {
    await supabase
      .from('blocked_content_hashes')
      .insert({
        file_hash: fileHash,
        reason: reason || 'PIRACY_DETECTED',
        metadata: { original_filename: fileName },
        blocked_at: new Date().toISOString()
      });
  } catch (error) {
    // Ignore duplicate key errors
    if (!error.message?.includes('duplicate')) {
      console.error('Error adding to blocked hashes:', error);
    }
  }
}

/**
 * NEW: Detect abuse patterns
 */
async function detectAbusePatterns(userId) {
  try {
    // Check for rapid piracy attempts (testing the system)
    const { data: recentAttempts } = await supabase
      .from('piracy_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('is_blocked', true)
      .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour
    
    if (recentAttempts && recentAttempts.length >= 5) {
      await logSuspiciousActivity(userId, 'RAPID_PIRACY_ATTEMPTS', {
        attemptCount: recentAttempts.length,
        timeWindow: '1 hour'
      });
      
      // Auto temp-ban for 24 hours
      await temporaryBan(userId, 'Multiple piracy attempts - testing detection system', 24);
      
      return {
        isSuspicious: true,
        autoBlock: true,
        message: '5+ piracy attempts in 1 hour - account temporarily suspended'
      };
    }
    
    return { isSuspicious: false };
  } catch (error) {
    console.error('Error detecting abuse patterns:', error);
    return { isSuspicious: false };
  }
}

/**
 * NEW: Log suspicious activity
 */
async function logSuspiciousActivity(userId, activityType, evidence) {
  try {
    await supabase
      .from('suspicious_activity')
      .insert({
        user_id: userId,
        activity_type: activityType,
        description: JSON.stringify(evidence),
        severity: 'HIGH',
        evidence: evidence,
        action_taken: 'LOGGED',
        detected_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error logging suspicious activity:', error);
  }
}

/**
 * NEW: Temporary ban user
 */
async function temporaryBan(userId, reason, durationHours) {
  try {
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    
    await supabase
      .from('user_bans')
      .insert({
        user_id: userId,
        ban_type: 'TEMPORARY',
        reason: reason,
        duration_hours: durationHours,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        created_at: new Date().toISOString()
      });
    
    console.warn(`🚫 User ${userId} temporarily banned: ${reason}`);
  } catch (error) {
    console.error('Error creating temporary ban:', error);
  }
}

module.exports = {
  checkForPiracy,
  logPiracyCheck,
  reportPiracyAttempt,
  checkUserBan,
  checkContentHash,
  addToBlockedHashes
};
