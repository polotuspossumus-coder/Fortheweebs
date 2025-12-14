// Governance Notary - Immutable audit trail for governance decisions
const crypto = require('node:crypto');
const fs = require('node:fs').promises;
const path = require('node:path');

class GovernanceNotary {
  constructor() {
    this.ledger = [];
    this.version = 0;
    this.ledgerFile = path.join(process.cwd(), 'artifacts', 'governance-ledger.json');
    this.loadLedger();
  }

  /**
   * Load ledger from disk
   */
  async loadLedger() {
    try {
      const data = await fs.readFile(this.ledgerFile, 'utf8');
      const saved = JSON.parse(data);
      this.ledger = saved.ledger || [];
      this.version = saved.version || 0;
    } catch (err) {
      // File doesn't exist yet, start fresh
      this.ledger = [];
      this.version = 0;
    }
  }

  /**
   * Save ledger to disk
   */
  async saveLedger() {
    try {
      await fs.mkdir(path.dirname(this.ledgerFile), { recursive: true });
      await fs.writeFile(this.ledgerFile, JSON.stringify({
        version: this.version,
        ledger: this.ledger,
        lastUpdated: new Date().toISOString()
      }, null, 2));
    } catch (err) {
      console.error('Failed to save governance ledger:', err);
    }
  }

  /**
   * Inscribe a governance action
   */
  inscribe(action, actor, justification) {
    this.version++;
    const prevHash = this.ledger.length > 0 ? this.ledger[this.ledger.length - 1].hash : '0';
    
    const entry = {
      version: this.version,
      timestamp: new Date().toISOString(),
      action,
      actor,
      justification,
      prevHash,
      hash: this.generateHash(this.version, action, actor, justification, prevHash)
    };
    
    this.ledger.push(entry);
    this.saveLedger(); // Fire and forget
    return entry;
  }

  /**
   * Get full ledger
   */
  getLedger() {
    return this.ledger;
  }

  /**
   * Verify ledger integrity
   */
  verifyIntegrity() {
    for (let i = 0; i < this.ledger.length; i++) {
      const entry = this.ledger[i];
      const prevHash = i > 0 ? this.ledger[i - 1].hash : '0';
      const expectedHash = this.generateHash(
        entry.version,
        entry.action,
        entry.actor,
        entry.justification,
        prevHash
      );
      
      if (entry.hash !== expectedHash) {
        return { valid: false, tampered: i };
      }
    }
    return { valid: true };
  }

  /**
   * Generate SHA256 hash
   */
  generateHash(version, action, actor, justification, prevHash) {
    const data = `${version}:${action}:${actor}:${justification}:${prevHash}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

module.exports = new GovernanceNotary();
