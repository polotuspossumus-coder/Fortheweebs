/**
 * Metrics Service
 * Collects and aggregates system metrics
 */

const EventEmitter = require('events');

class MetricsService extends EventEmitter {
    constructor() {
        super();
        this.metrics = {
            requests: {
                total: 0,
                byEndpoint: {},
                byMethod: {},
                errors: 0
            },
            performance: {
                avgResponseTime: 0,
                slowestEndpoints: []
            },
            system: {
                startTime: Date.now(),
                uptime: 0
            }
        };
        
        // Update uptime every second
        setInterval(() => {
            this.metrics.system.uptime = Math.floor((Date.now() - this.metrics.system.startTime) / 1000);
        }, 1000);
    }

    /**
     * Record request
     */
    recordRequest(endpoint, method, responseTime, statusCode) {
        this.metrics.requests.total++;
        
        // Track by endpoint
        if (!this.metrics.requests.byEndpoint[endpoint]) {
            this.metrics.requests.byEndpoint[endpoint] = 0;
        }
        this.metrics.requests.byEndpoint[endpoint]++;
        
        // Track by method
        if (!this.metrics.requests.byMethod[method]) {
            this.metrics.requests.byMethod[method] = 0;
        }
        this.metrics.requests.byMethod[method]++;
        
        // Track errors
        if (statusCode >= 400) {
            this.metrics.requests.errors++;
        }
        
        // Update average response time
        const currentAvg = this.metrics.performance.avgResponseTime;
        const totalRequests = this.metrics.requests.total;
        this.metrics.performance.avgResponseTime = 
            ((currentAvg * (totalRequests - 1)) + responseTime) / totalRequests;
        
        this.emit('request', { endpoint, method, responseTime, statusCode });
    }

    /**
     * Get all metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get specific metric
     */
    getMetric(key) {
        const keys = key.split('.');
        let value = this.metrics;
        
        for (const k of keys) {
            if (value[k] === undefined) return null;
            value = value[k];
        }
        
        return value;
    }

    /**
     * Reset metrics
     */
    reset() {
        this.metrics = {
            requests: {
                total: 0,
                byEndpoint: {},
                byMethod: {},
                errors: 0
            },
            performance: {
                avgResponseTime: 0,
                slowestEndpoints: []
            },
            system: {
                startTime: Date.now(),
                uptime: 0
            }
        };
        this.emit('reset');
    }

    /**
     * Get uptime
     */
    getUptime() {
        return this.metrics.system.uptime;
    }

    /**
     * Get request count
     */
    getRequestCount() {
        return this.metrics.requests.total;
    }

    /**
     * Get error count
     */
    getErrorCount() {
        return this.metrics.requests.errors;
    }

    /**
     * Get error rate
     */
    getErrorRate() {
        const total = this.metrics.requests.total;
        if (total === 0) return 0;
        return (this.metrics.requests.errors / total) * 100;
    }
}

// Export singleton instance
const metricsService = new MetricsService();

module.exports = metricsService;
