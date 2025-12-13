/**
 * Notary Ledger - Immutable audit trail for policy changes and system events
 * Records all critical actions with timestamps, actors, and details
 */

const ledger = [];
const MAX_LEDGER_SIZE = 10000; // Keep last 10,000 entries in memory

/**
 * Record an event in the notary ledger
 * @param {Object} event - Event details
 * @param {string} event.actor - Who performed the action
 * @param {string} event.command - What command/action was performed
 * @param {string} event.key - Key/resource affected
 * @param {any} event.value - New value (if applicable)
 * @param {any} event.oldValue - Previous value (if applicable)
 * @param {number} event.version - Version number (if applicable)
 */
function notaryRecord(event) {
    const entry = {
        id: ledger.length + 1,
        timestamp: new Date().toISOString(),
        actor: event.actor || 'system',
        command: event.command,
        key: event.key,
        value: event.value,
        oldValue: event.oldValue,
        version: event.version,
        metadata: event.metadata || {}
    };

    ledger.push(entry);

    // Trim ledger if it exceeds max size
    if (ledger.length > MAX_LEDGER_SIZE) {
        ledger.shift();
    }

    return entry;
}

/**
 * Get ledger entries with optional filtering
 * @param {Object} filters - Filter criteria
 * @param {string} filters.actor - Filter by actor
 * @param {string} filters.command - Filter by command
 * @param {string} filters.key - Filter by key
 * @param {number} filters.limit - Limit number of results
 */
function getLedger(filters = {}) {
    let results = [...ledger];

    if (filters.actor) {
        results = results.filter(e => e.actor === filters.actor);
    }

    if (filters.command) {
        results = results.filter(e => e.command === filters.command);
    }

    if (filters.key) {
        results = results.filter(e => e.key === filters.key);
    }

    if (filters.limit) {
        results = results.slice(-filters.limit);
    }

    return results;
}

/**
 * Get ledger statistics
 */
function getLedgerStats() {
    const actors = [...new Set(ledger.map(e => e.actor))];
    const commands = [...new Set(ledger.map(e => e.command))];

    return {
        totalEntries: ledger.length,
        uniqueActors: actors.length,
        uniqueCommands: commands.length,
        actors,
        commands,
        oldestEntry: ledger[0],
        newestEntry: ledger[ledger.length - 1]
    };
}

/**
 * Clear the ledger (use with caution)
 */
function clearLedger() {
    const count = ledger.length;
    ledger.length = 0;
    return count;
}

module.exports = {
    notaryRecord,
    getLedger,
    getLedgerStats,
    clearLedger
};
