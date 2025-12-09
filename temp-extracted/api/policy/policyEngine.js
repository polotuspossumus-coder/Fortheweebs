/**
 * Policy Engine - Dynamic runtime policy management
 * Allows updating system policies without code changes or redeployment
 */

const EventEmitter = require('events');

class PolicyEngine extends EventEmitter {
    constructor() {
        super();
        this.policies = {
            features: {},
            limits: {},
            security: {},
            content: {}
        };
        this.version = 1;
    }

    /**
     * Update a policy value
     * @param {string} type - Policy type (features, limits, security, content)
     * @param {string} key - Policy key
     * @param {any} value - New policy value
     */
    updatePolicy(type, key, value) {
        const oldValue = this.policies[type]?.[key];
        
        if (!this.policies[type]) {
            this.policies[type] = {};
        }

        this.policies[type][key] = value;
        this.version++;

        // Emit policy change event
        this.emit('policy:changed', {
            type,
            key,
            value,
            oldValue,
            version: this.version,
            ts: new Date().toISOString()
        });

        console.log(`🔄 Policy updated: ${type}.${key} = ${value} (v${this.version})`);
        return { success: true, version: this.version };
    }

    /**
     * Get a policy value
     * @param {string} type - Policy type
     * @param {string} key - Policy key
     */
    getPolicy(type, key) {
        return this.policies[type]?.[key];
    }

    /**
     * Get all policies of a type
     * @param {string} type - Policy type
     */
    getPolicies(type) {
        return this.policies[type] || {};
    }

    /**
     * Get all policies
     */
    getAllPolicies() {
        return {
            policies: this.policies,
            version: this.version
        };
    }

    /**
     * Reset policies to defaults
     */
    reset() {
        this.policies = {
            features: {},
            limits: {},
            security: {},
            content: {}
        };
        this.version = 1;
        console.log('🔄 Policy engine reset to defaults');
    }
}

// Create singleton instance
const policyEngine = new PolicyEngine();

// Initialize with default policies
policyEngine.updatePolicy('features', 'socialMedia', false);
policyEngine.updatePolicy('features', 'aiFeatures', true);
policyEngine.updatePolicy('features', 'adultContent', true);
policyEngine.updatePolicy('limits', 'maxFileSize', 50 * 1024 * 1024); // 50MB
policyEngine.updatePolicy('limits', 'maxBatchFiles', 100);
policyEngine.updatePolicy('limits', 'rateLimitWindow', 900000); // 15 min
policyEngine.updatePolicy('limits', 'rateLimitMax', 100);
policyEngine.updatePolicy('security', 'requireJWT', true);
policyEngine.updatePolicy('security', 'allowCORS', true);
policyEngine.updatePolicy('content', 'allowUserUploads', true);

console.log('✅ Policy engine initialized with defaults');

module.exports = policyEngine;
