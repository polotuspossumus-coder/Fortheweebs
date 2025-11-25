/**
 * External Notary Ledger (Append-Only Mirror)
 * Provides immutable, external proof of all governance actions
 */

const fs = require('fs');
const path = require('path');

const ledgerFile = path.join(__dirname, '../data/ledger.log');

// Ensure data directory and file exist
function initLedger() {
  const dataDir = path.dirname(ledgerFile);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 Created data directory for external ledger');
  }

  if (!fs.existsSync(ledgerFile)) {
    fs.writeFileSync(ledgerFile, '', { encoding: 'utf8' });
    console.log('📋 Initialized external ledger file');
  }
}

/**
 * Append a record to the external ledger (append-only, immutable)
 * @param {object} record - Notary record to append
 */
function appendRecord(record) {
  try {
    const line = JSON.stringify(record) + '\n';
    fs.appendFileSync(ledgerFile, line, { encoding: 'utf8' });
  } catch (error) {
    console.error('❌ Failed to append to external ledger:', error);
    // Don't throw - ledger failure shouldn't break governance
  }
}

/**
 * Read all records from the external ledger
 * @param {number} limit - Maximum number of records to return (newest first)
 * @returns {array} Array of ledger records
 */
function readLedger(limit = 1000) {
  try {
    if (!fs.existsSync(ledgerFile)) {
      return [];
    }

    const content = fs.readFileSync(ledgerFile, { encoding: 'utf8' });
    const lines = content.split('\n').filter(line => line.trim());

    const records = lines
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          console.error('Failed to parse ledger line:', line);
          return null;
        }
      })
      .filter(record => record !== null)
      .reverse(); // Newest first

    return limit ? records.slice(0, limit) : records;
  } catch (error) {
    console.error('❌ Failed to read external ledger:', error);
    return [];
  }
}

/**
 * Verify integrity of a record by recomputing its hash
 * @param {object} record - Record to verify
 * @returns {boolean} True if hash matches
 */
function verifyRecordIntegrity(record) {
  const crypto = require('crypto');
  const material = `${record.actor}|${record.command}|${record.key}|${record.value}|v${record.version}|${record.timestamp}`;
  const computedHash = crypto.createHash('sha256').update(material).digest('hex');
  return computedHash === record.hash;
}

/**
 * Get ledger statistics
 * @returns {object} Ledger stats
 */
function getLedgerStats() {
  try {
    if (!fs.existsSync(ledgerFile)) {
      return {
        totalRecords: 0,
        fileSizeBytes: 0,
        fileSizeKB: 0,
        oldestRecord: null,
        newestRecord: null,
      };
    }

    const stats = fs.statSync(ledgerFile);
    const records = readLedger();

    return {
      totalRecords: records.length,
      fileSizeBytes: stats.size,
      fileSizeKB: (stats.size / 1024).toFixed(2),
      oldestRecord: records.length > 0 ? records[records.length - 1].timestamp : null,
      newestRecord: records.length > 0 ? records[0].timestamp : null,
      lastModified: stats.mtime.toISOString(),
    };
  } catch (error) {
    console.error('❌ Failed to get ledger stats:', error);
    return null;
  }
}

// Initialize on load
initLedger();

module.exports = {
  appendRecord,
  readLedger,
  verifyRecordIntegrity,
  getLedgerStats,
};
