/**
 * Queue Control Service
 * Manages background job queues and processing
 */

const EventEmitter = require('events');

class QueueControl extends EventEmitter {
    constructor() {
        super();
        this.queues = new Map();
        this.workers = new Map();
        this.stats = {
            totalProcessed: 0,
            totalFailed: 0,
            activeJobs: 0
        };
    }

    /**
     * Create or get a queue
     */
    getQueue(name) {
        if (!this.queues.has(name)) {
            this.queues.set(name, {
                name: name,
                jobs: [],
                processing: false,
                stats: { processed: 0, failed: 0 }
            });
        }
        return this.queues.get(name);
    }

    /**
     * Add job to queue
     */
    async addJob(queueName, job) {
        const queue = this.getQueue(queueName);
        
        const jobData = {
            id: `${queueName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: job.type,
            data: job.data,
            priority: job.priority || 0,
            status: 'pending',
            createdAt: new Date().toISOString(),
            attempts: 0,
            maxAttempts: job.maxAttempts || 3
        };

        queue.jobs.push(jobData);
        queue.jobs.sort((a, b) => b.priority - a.priority); // Higher priority first

        this.emit('job:added', { queue: queueName, job: jobData });

        // Start processing if not already
        if (!queue.processing) {
            this.processQueue(queueName);
        }

        return jobData.id;
    }

    /**
     * Process jobs in queue
     */
    async processQueue(queueName) {
        const queue = this.getQueue(queueName);
        
        if (queue.processing || queue.jobs.length === 0) {
            return;
        }

        queue.processing = true;
        this.stats.activeJobs++;

        while (queue.jobs.length > 0) {
            const job = queue.jobs.shift();
            job.status = 'processing';
            job.startedAt = new Date().toISOString();

            try {
                const worker = this.workers.get(job.type);
                
                if (!worker) {
                    throw new Error(`No worker registered for job type: ${job.type}`);
                }

                await worker(job.data);

                job.status = 'completed';
                job.completedAt = new Date().toISOString();
                queue.stats.processed++;
                this.stats.totalProcessed++;

                this.emit('job:completed', { queue: queueName, job });

            } catch (error) {
                job.attempts++;
                job.error = error.message;

                if (job.attempts >= job.maxAttempts) {
                    job.status = 'failed';
                    queue.stats.failed++;
                    this.stats.totalFailed++;
                    this.emit('job:failed', { queue: queueName, job, error });
                } else {
                    job.status = 'retry';
                    queue.jobs.push(job); // Re-queue for retry
                    this.emit('job:retry', { queue: queueName, job, error });
                }
            }
        }

        queue.processing = false;
        this.stats.activeJobs--;
    }

    /**
     * Register worker for job type
     */
    registerWorker(jobType, handler) {
        this.workers.set(jobType, handler);

    }

    /**
     * Get queue stats
     */
    getStats(queueName = null) {
        if (queueName) {
            const queue = this.queues.get(queueName);
            return queue ? {
                name: queueName,
                pending: queue.jobs.length,
                ...queue.stats
            } : null;
        }

        return {
            global: this.stats,
            queues: Array.from(this.queues.entries()).map(([name, queue]) => ({
                name,
                pending: queue.jobs.length,
                ...queue.stats
            }))
        };
    }

    /**
     * Clear queue
     */
    clearQueue(queueName) {
        const queue = this.queues.get(queueName);
        if (queue) {
            queue.jobs = [];
            this.emit('queue:cleared', { queue: queueName });
        }
    }

    /**
     * Pause queue
     */
    pauseQueue(queueName) {
        const queue = this.queues.get(queueName);
        if (queue) {
            queue.paused = true;
            this.emit('queue:paused', { queue: queueName });
        }
    }

    /**
     * Resume queue
     */
    resumeQueue(queueName) {
        const queue = this.queues.get(queueName);
        if (queue) {
            queue.paused = false;
            this.processQueue(queueName);
            this.emit('queue:resumed', { queue: queueName });
        }
    }
}

// Export singleton instance
const queueControl = new QueueControl();

// Register default workers
queueControl.registerWorker('email', async (data) => {

    // Email sending logic here
});

queueControl.registerWorker('image-process', async (data) => {

    // Image processing logic here
});

queueControl.registerWorker('notification', async (data) => {

    // Notification logic here
});

module.exports = queueControl;
