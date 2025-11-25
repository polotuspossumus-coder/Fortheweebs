/**
 * Policy Engine - Core live configuration system
 * Manages thresholds, caps, and toggles with event emission
 * Integrates with governance notary for immutable audit trail
 */

const EventEmitter = require("events");

class PolicyEngine extends EventEmitter {
  constructor(initial = {}) {
    super();
    this.state = {
      thresholds: {
        default: 100,
        violence: 0.75,
        nsfw: 0.70,
        hate: 0.80,
        csam: 0.30,
        ...initial.thresholds
      },
      caps: {
        default: 1000,
        uploadPerDay: 100,
        postsPerHour: 10,
        ...initial.caps
      },
      toggles: {
        postingEnabled: true,
        moderationStrict: false,
        guardMode: false,
        ...initial.toggles
      },
      version: 1,
      lastUpdated: new Date().toISOString(),
    };
  }

  setThreshold(key, value) {
    const v = Number(value);
    if (Number.isNaN(v) || v < 0 || v > 1) {
      throw new Error(`Invalid threshold: ${value}. Must be between 0 and 1.`);
    }
    const oldValue = this.state.thresholds[key];
    this.state.thresholds[key] = v;
    this.bump("thresholds", key, v, oldValue);
    return { key, value: v, oldValue };
  }

  setCap(key, value) {
    const v = Number(value);
    if (Number.isNaN(v) || v < 0) {
      throw new Error(`Invalid cap: ${value}. Must be non-negative number.`);
    }
    const oldValue = this.state.caps[key];
    this.state.caps[key] = v;
    this.bump("caps", key, v, oldValue);
    return { key, value: v, oldValue };
  }

  togglePolicy(key, value) {
    const v = value === true || value === "true";
    const oldValue = this.state.toggles[key];
    this.state.toggles[key] = v;
    this.bump("toggles", key, v, oldValue);
    return { key, value: v, oldValue };
  }

  getThreshold(key) {
    return this.state.thresholds[key] || this.state.thresholds.default;
  }

  getCap(key) {
    return this.state.caps[key] || this.state.caps.default;
  }

  getToggle(key) {
    return this.state.toggles[key] !== undefined ? this.state.toggles[key] : false;
  }

  bump(type, key, value, oldValue) {
    this.state.version++;
    this.state.lastUpdated = new Date().toISOString();

    const event = {
      type,
      key,
      value,
      oldValue,
      version: this.state.version,
      ts: this.state.lastUpdated,
    };

    this.emit("policy:changed", event);
    console.log(`📋 Policy Updated: ${type}.${key} = ${value} (was: ${oldValue}) [v${this.state.version}]`);

    return event;
  }

  snapshot() {
    return JSON.parse(JSON.stringify(this.state)); // Deep clone
  }

  reset() {
    this.state = {
      thresholds: { default: 100, violence: 0.75, nsfw: 0.70, hate: 0.80, csam: 0.30 },
      caps: { default: 1000, uploadPerDay: 100, postsPerHour: 10 },
      toggles: { postingEnabled: true, moderationStrict: false, guardMode: false },
      version: 1,
      lastUpdated: new Date().toISOString(),
    };
    this.emit("policy:reset", { ts: this.state.lastUpdated });
    console.log("🔄 Policy Engine reset to defaults");
  }
}

// Export singleton instance
const policyEngine = new PolicyEngine();
module.exports = policyEngine;
