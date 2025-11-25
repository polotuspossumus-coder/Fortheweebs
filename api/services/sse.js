/**
 * Server-Sent Events (SSE) Broadcaster
 * Manages real-time artifact streaming to connected clients
 * Provides live governance visibility through DockedConsole
 */

const clients = new Set();

/**
 * Initialize the global artifact stream
 * Sets up periodic flushing of artifacts to all connected SSE clients
 */
function initArtifactStream() {
  if (!global.artifactStream) {
    global.artifactStream = [];
    console.log("📡 Artifact stream initialized");
  }

  // Flush artifacts to all connected clients every 250ms
  setInterval(() => {
    while (global.artifactStream.length > 0) {
      const artifact = global.artifactStream.shift();
      const payload = `data: ${JSON.stringify(artifact)}\n\n`;

      for (const res of clients) {
        try {
          res.write(payload);
        } catch (err) {
          // Client disconnected, will be cleaned up on 'close' event
          console.warn("⚠️ Failed to write to SSE client:", err.message);
        }
      }
    }
  }, 250);

  console.log("✅ SSE broadcaster started (250ms interval)");
}

/**
 * SSE route handler
 * Establishes persistent connection for streaming artifacts
 */
function sseRoute(req, res) {
  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
  res.flushHeaders();

  // Send connection confirmation
  res.write(`data: ${JSON.stringify({
    type: "connected",
    timestamp: new Date().toISOString(),
    message: "SSE connection established"
  })}\n\n`);

  // Add client to active set
  clients.add(res);
  console.log(`📡 SSE client connected (${clients.size} active)`);

  // Keep-alive ping every 30 seconds
  const keepAlive = setInterval(() => {
    try {
      res.write(`: keepalive ${Date.now()}\n\n`);
    } catch (err) {
      clearInterval(keepAlive);
    }
  }, 30000);

  // Clean up on disconnect
  req.on("close", () => {
    clearInterval(keepAlive);
    clients.delete(res);
    console.log(`📡 SSE client disconnected (${clients.size} active)`);
  });
}

/**
 * Manually push an artifact to the stream
 * @param {Object} artifact - Artifact to push
 */
function pushArtifact(artifact) {
  if (!global.artifactStream) {
    initArtifactStream();
  }

  global.artifactStream.push({
    timestamp: new Date().toISOString(),
    ...artifact,
  });
}

/**
 * Get current client count
 */
function getClientCount() {
  return clients.size;
}

/**
 * Broadcast immediate message to all clients (bypass queue)
 */
function broadcast(artifact) {
  const payload = `data: ${JSON.stringify({
    timestamp: new Date().toISOString(),
    ...artifact
  })}\n\n`;

  for (const res of clients) {
    try {
      res.write(payload);
    } catch (err) {
      console.warn("⚠️ Failed to broadcast to SSE client:", err.message);
    }
  }
}

module.exports = {
  initArtifactStream,
  sseRoute,
  pushArtifact,
  getClientCount,
  broadcast,
};
