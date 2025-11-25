/**
 * Notary Ledger Service
 * Immutable authority record keeping with cryptographic hashing
 * All governance decisions are permanently logged
 */

const crypto = require("crypto");
const { appendRecord } = require("./externalLedger");

// In-memory ledger (can be swapped for database persistence)
let ledger = [];

/**
 * Record a governance decision to the immutable ledger
 * @param {Object} params - Record parameters
 * @param {string} params.actor - Who authorized the action (e.g., sovereign, mico)
 * @param {string} params.command - Command executed (e.g., setThreshold, setCap)
 * @param {string} params.key - Policy key affected
 * @param {any} params.value - New value
 * @param {number} params.version - Policy version
 * @param {any} params.oldValue - Previous value (optional)
 * @returns {Object} The notarized record with hash
 */
function notaryRecord({ actor, command, key, value, version, oldValue }) {
  const timestamp = new Date().toISOString();

  // Create deterministic hash of the record
  const material = `${actor}|${command}|${key}|${value}|${oldValue || 'null'}|v${version}|${timestamp}`;
  const hash = crypto.createHash("sha256").update(material).digest("hex");

  const record = {
    id: ledger.length + 1,
    actor,
    command,
    key,
    value,
    oldValue,
    version,
    timestamp,
    hash,
  };

  ledger.push(record);

  // Append to external ledger (immutable, append-only)
  appendRecord(record);

  // Push to artifact stream if available
  if (global.artifactStream) {
    global.artifactStream.push({
      timestamp,
      type: "NOTARY",
      severity: "info",
      message: `Ledger #${record.id}: ${command} ${key}=${value} v${version} by ${actor}`,
      hash: hash.slice(0, 12),
    });
  }

  console.log(`📜 Notary: Recorded #${record.id} | Hash: ${hash.slice(0, 12)}… | ${command} ${key}=${value}`);

  return record;
}

/**
 * Get recent ledger entries
 * @param {Object} options - Query options
 * @param {number} options.limit - Max records to return (default: 100)
 * @param {string} options.actor - Filter by actor
 * @param {string} options.command - Filter by command
 * @returns {Array} Ledger entries (newest first)
 */
function getLedger({ limit = 100, actor, command } = {}) {
  let filtered = ledger;

  if (actor) {
    filtered = filtered.filter(r => r.actor === actor);
  }

  if (command) {
    filtered = filtered.filter(r => r.command === command);
  }

  const start = Math.max(filtered.length - limit, 0);
  return filtered.slice(start).reverse(); // Newest first
}

/**
 * Verify the integrity of a ledger record
 * @param {number} id - Record ID to verify
 * @returns {Object} Verification result
 */
function verifyRecord(id) {
  const record = ledger[id - 1]; // IDs are 1-indexed

  if (!record) {
    return { valid: false, error: "Record not found" };
  }

  const material = `${record.actor}|${record.command}|${record.key}|${record.value}|${record.oldValue || 'null'}|v${record.version}|${record.timestamp}`;
  const expectedHash = crypto.createHash("sha256").update(material).digest("hex");

  const valid = expectedHash === record.hash;

  return {
    valid,
    record,
    expectedHash: expectedHash.slice(0, 12),
    actualHash: record.hash.slice(0, 12),
  };
}

/**
 * Get ledger statistics
 */
function getStats() {
  const actors = new Set(ledger.map(r => r.actor));
  const commands = new Set(ledger.map(r => r.command));

  return {
    totalRecords: ledger.length,
    actors: Array.from(actors),
    commands: Array.from(commands),
    latestVersion: ledger.length > 0 ? ledger[ledger.length - 1].version : 0,
    oldestRecord: ledger.length > 0 ? ledger[0].timestamp : null,
    newestRecord: ledger.length > 0 ? ledger[ledger.length - 1].timestamp : null,
  };
}

/**
 * Clear the ledger (USE WITH CAUTION - for testing only)
 */
function clearLedger() {
  const count = ledger.length;
  ledger = [];
  console.warn(`⚠️ Notary: Cleared ${count} records from ledger`);
  return { cleared: count };
}

module.exports = {
  notaryRecord,
  getLedger,
  verifyRecord,
  getStats,
  clearLedger,
};
