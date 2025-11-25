/**
 * Governance Metrics Service
 * Tracks system throughput, security events, and governance impact
 */

let metrics = {
  overridesIssued: 0,
  unauthorizedAttempts: 0,
  blockedActions: 0,
  policyChanges: 0,
  queueOperations: 0,
  avgLatencyMs: 0,
  _latencySamples: [],
  _maxSamples: 100,
};

// Event history for trend analysis (last 1000 events)
const eventHistory = [];
const MAX_HISTORY = 1000;

/**
 * Record a successful policy override
 */
function recordOverride() {
  metrics.overridesIssued++;
  logEvent('OVERRIDE', 'Policy override executed');
}

/**
 * Record an unauthorized access attempt
 * @param {string} source - Source of the attempt (IP, user, etc.)
 */
function recordUnauthorized(source = 'unknown') {
  metrics.unauthorizedAttempts++;
  logEvent('UNAUTHORIZED', `Unauthorized attempt from ${source}`, 'warning');
}

/**
 * Record a blocked action (Sentinel Watchdog)
 * @param {string} reason - Why the action was blocked
 */
function recordBlocked(reason = 'sentinel_block') {
  metrics.blockedActions++;
  logEvent('BLOCKED', `Action blocked: ${reason}`, 'warning');
}

/**
 * Record a policy change
 */
function recordPolicyChange() {
  metrics.policyChanges++;
  logEvent('POLICY', 'Policy state updated');
}

/**
 * Record a queue operation
 */
function recordQueueOperation() {
  metrics.queueOperations++;
  logEvent('QUEUE', 'Queue operation executed');
}

/**
 * Record request latency
 * @param {number} ms - Latency in milliseconds
 */
function recordLatency(ms) {
  metrics._latencySamples.push(ms);

  // Keep only recent samples
  if (metrics._latencySamples.length > metrics._maxSamples) {
    metrics._latencySamples.shift();
  }

  // Calculate rolling average
  const sum = metrics._latencySamples.reduce((a, b) => a + b, 0);
  metrics.avgLatencyMs = Math.round(sum / metrics._latencySamples.length);
}

/**
 * Log an event to history
 * @param {string} type - Event type
 * @param {string} message - Event message
 * @param {string} severity - Event severity
 */
function logEvent(type, message, severity = 'info') {
  const event = {
    timestamp: new Date().toISOString(),
    type,
    message,
    severity,
  };

  eventHistory.push(event);

  // Keep history bounded
  if (eventHistory.length > MAX_HISTORY) {
    eventHistory.shift();
  }

  // Push to artifact stream if available
  if (global.artifactStream) {
    global.artifactStream.push({
      timestamp: event.timestamp,
      type: 'METRICS',
      severity,
      message: `📊 ${message}`,
    });
  }
}

/**
 * Get current metrics snapshot
 * @returns {object} Current metrics
 */
function snapshot() {
  return {
    overridesIssued: metrics.overridesIssued,
    unauthorizedAttempts: metrics.unauthorizedAttempts,
    blockedActions: metrics.blockedActions,
    policyChanges: metrics.policyChanges,
    queueOperations: metrics.queueOperations,
    avgLatencyMs: metrics.avgLatencyMs,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get event history
 * @param {number} limit - Max events to return (default: 100)
 * @param {string} type - Filter by event type
 * @returns {array} Recent events (newest first)
 */
function getHistory({ limit = 100, type } = {}) {
  let filtered = eventHistory;

  if (type) {
    filtered = filtered.filter(e => e.type === type);
  }

  return filtered
    .slice(-limit)
    .reverse(); // Newest first
}

/**
 * Get security summary (threats, blocks, etc.)
 * @returns {object} Security metrics
 */
function getSecuritySummary() {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const recentEvents = eventHistory.filter(e => e.timestamp > last24h);

  const unauthorized = recentEvents.filter(e => e.type === 'UNAUTHORIZED').length;
  const blocked = recentEvents.filter(e => e.type === 'BLOCKED').length;

  return {
    totalThreats: metrics.unauthorizedAttempts + metrics.blockedActions,
    unauthorizedAttempts: metrics.unauthorizedAttempts,
    blockedActions: metrics.blockedActions,
    last24hUnauthorized: unauthorized,
    last24hBlocked: blocked,
    threatLevel: calculateThreatLevel(unauthorized, blocked),
  };
}

/**
 * Calculate threat level based on recent activity
 */
function calculateThreatLevel(unauthorized, blocked) {
  const total = unauthorized + blocked;

  if (total === 0) return 'LOW';
  if (total < 5) return 'NORMAL';
  if (total < 20) return 'ELEVATED';
  if (total < 50) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Get governance impact metrics
 * @returns {object} Impact metrics
 */
function getImpactMetrics() {
  return {
    totalActions: metrics.overridesIssued + metrics.policyChanges + metrics.queueOperations,
    overridesIssued: metrics.overridesIssued,
    policyChanges: metrics.policyChanges,
    queueOperations: metrics.queueOperations,
    avgLatencyMs: metrics.avgLatencyMs,
    systemHealth: calculateSystemHealth(),
  };
}

/**
 * Calculate overall system health score (0-100)
 */
function calculateSystemHealth() {
  // Lower latency = better health
  const latencyScore = Math.max(0, 100 - metrics.avgLatencyMs / 10);

  // Fewer unauthorized attempts = better health
  const securityScore = Math.max(0, 100 - metrics.unauthorizedAttempts);

  // Average the scores
  const health = Math.round((latencyScore + securityScore) / 2);

  return Math.min(100, Math.max(0, health));
}

/**
 * Reset metrics (for testing only)
 */
function resetMetrics() {
  metrics = {
    overridesIssued: 0,
    unauthorizedAttempts: 0,
    blockedActions: 0,
    policyChanges: 0,
    queueOperations: 0,
    avgLatencyMs: 0,
    _latencySamples: [],
    _maxSamples: 100,
  };

  eventHistory.length = 0;

  console.warn('⚠️ Metrics: Reset all metrics and history');
}

module.exports = {
  recordOverride,
  recordUnauthorized,
  recordBlocked,
  recordPolicyChange,
  recordQueueOperation,
  recordLatency,
  snapshot,
  getHistory,
  getSecuritySummary,
  getImpactMetrics,
  resetMetrics,
};
