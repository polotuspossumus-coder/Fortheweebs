// Artifact Logger - Logs important artifacts and governance decisions with persistence
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ArtifactLogger {
  constructor() {
    this.artifacts = [];
    this.artifactsDir = path.join(process.cwd(), 'artifacts', 'logs');
    this.indexFile = path.join(this.artifactsDir, 'index.json');
    this.loadIndex();
  }

  /**
   * Load artifact index from disk
   */
  async loadIndex() {
    try {
      const data = await fs.readFile(this.indexFile, 'utf8');
      this.artifacts = JSON.parse(data);
    } catch (err) {
      // Index doesn't exist yet
      this.artifacts = [];
    }
  }

  /**
   * Save artifact index to disk
   */
  async saveIndex() {
    try {
      await fs.mkdir(this.artifactsDir, { recursive: true });
      await fs.writeFile(this.indexFile, JSON.stringify(this.artifacts, null, 2));
    } catch (err) {
      console.error('Failed to save artifact index:', err);
    }
  }

  /**
   * Log an artifact
   */
  async log(type, data, metadata = {}) {
    const id = crypto.randomBytes(16).toString('hex');
    const artifact = {
      id,
      type,
      data,
      metadata,
      timestamp: new Date().toISOString(),
      version: this.artifacts.length + 1
    };
    
    this.artifacts.push(artifact);
    
    // Write individual artifact file
    const artifactFile = path.join(this.artifactsDir, `${id}.json`);
    await fs.mkdir(this.artifactsDir, { recursive: true });
    await fs.writeFile(artifactFile, JSON.stringify(artifact, null, 2));
    
    // Update index
    await this.saveIndex();
    
    console.log(`[ArtifactLogger] Logged: ${type} (${id})`);
    
    return artifact;
  }

  /**
   * Get all artifacts of a specific type
   */
  getByType(type) {
    return this.artifacts.filter(a => a.type === type);
  }

  /**
   * Get all artifacts
   */
  getAll() {
    return this.artifacts;
  }

  /**
   * Get artifact by ID
   */
  getById(id) {
    return this.artifacts.find(a => a.id === id) || null;
  }

  /**
   * Get recent artifacts
   */
  getRecent(limit = 10) {
    return this.artifacts.slice(-limit).reverse();
  }

  /**
   * Clear all artifacts (use with caution)
   */
  clear() {
    this.artifacts = [];
    console.log('[ArtifactLogger] All artifacts cleared');
  }
}

module.exports = new ArtifactLogger();
