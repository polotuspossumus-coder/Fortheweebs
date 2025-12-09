/**
 * Server-Sent Events (SSE) Artifact Stream
 * Real-time event streaming for policy changes, notifications, and system events
 */

class ArtifactStream {
    constructor() {
        this.clients = new Set();
        this.eventHistory = [];
        this.maxHistory = 1000; // Keep last 1000 events
    }

    // Add a client connection
    addClient(res) {
        this.clients.add(res);
        
        // Send initial connection success event
        this.sendToClient(res, {
            type: 'CONNECTED',
            timestamp: new Date().toISOString(),
            message: 'Connected to artifact stream',
            clientCount: this.clients.size
        });

        // Send recent event history
        this.eventHistory.slice(-10).forEach(event => {
            this.sendToClient(res, event);
        });
    }

    // Remove a client connection
    removeClient(res) {
        this.clients.delete(res);
    }

    // Push event to all connected clients
    push(event) {
        const enrichedEvent = {
            ...event,
            id: Date.now(),
            timestamp: event.timestamp || new Date().toISOString()
        };

        // Add to history
        this.eventHistory.push(enrichedEvent);
        if (this.eventHistory.length > this.maxHistory) {
            this.eventHistory.shift();
        }

        // Send to all clients
        this.clients.forEach(client => {
            this.sendToClient(client, enrichedEvent);
        });
    }

    // Send event to specific client
    sendToClient(res, event) {
        try {
            res.write(`data: ${JSON.stringify(event)}\n\n`);
        } catch (error) {
            console.error('Error sending SSE event:', error);
            this.removeClient(res);
        }
    }

    // Get current stats
    getStats() {
        return {
            connectedClients: this.clients.size,
            totalEvents: this.eventHistory.length,
            lastEvent: this.eventHistory[this.eventHistory.length - 1]
        };
    }
}

// Global artifact stream instance
let artifactStream;

function initArtifactStream() {
    if (!artifactStream) {
        artifactStream = new ArtifactStream();
        global.artifactStream = artifactStream;
        console.log('✅ Artifact stream initialized');
    }
    return artifactStream;
}

// SSE route handler
function sseRoute(req, res) {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    if (!artifactStream) {
        initArtifactStream();
    }

    // Add client to stream
    artifactStream.addClient(res);

    // Handle client disconnect
    req.on('close', () => {
        artifactStream.removeClient(res);
    });

    req.on('end', () => {
        artifactStream.removeClient(res);
    });

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
        try {
            res.write(':heartbeat\n\n');
        } catch (error) {
            clearInterval(heartbeat);
            artifactStream.removeClient(res);
        }
    }, 30000); // Every 30 seconds

    req.on('close', () => {
        clearInterval(heartbeat);
    });
}

module.exports = {
    initArtifactStream,
    sseRoute,
    getArtifactStream: () => artifactStream
};
