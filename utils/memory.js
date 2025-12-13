// memory.js - Memory monitoring and heap snapshot
const { checkMemory, writeArtifact } = require('./server-safety');

// Take heap snapshot (lightweight version)
async function takeHeapSnapshot() {
  const memory = checkMemory();
  const snapshot = {
    timestamp: new Date().toISOString(),
    memory,
    uptime: process.uptime(),
    platform: process.platform,
    nodeVersion: process.version,
  };
  
  await writeArtifact('heapSnapshot', snapshot);
  return snapshot;
}

// Monitor memory periodically
let memoryMonitorTimer = null;
function startMemoryMonitor(intervalMs = 60000) {
  console.log('[Memory] Starting memory monitor...');
  
  memoryMonitorTimer = setInterval(async () => {
    const memory = checkMemory();
    
    if (!memory.isHealthy) {
      console.warn(`[Memory] WARNING: Heap usage ${memory.heapUsedMB}MB exceeds threshold ${memory.threshold}MB`);
      await takeHeapSnapshot();
    }
  }, intervalMs);
  
  // Cleanup on exit
  process.on('SIGTERM', () => { if (memoryMonitorTimer) clearInterval(memoryMonitorTimer); });
  process.on('SIGINT', () => { if (memoryMonitorTimer) clearInterval(memoryMonitorTimer); });
}

module.exports = {
  takeHeapSnapshot,
  startMemoryMonitor,
};
