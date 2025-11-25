/**
 * Queue Control Service
 * Handles pause/resume/priority for moderation queues
 */

let queueState = {
  paused: false,
  creatorPriorities: {},  // { creatorId: priority_level }
  pausedAt: null,
  resumedAt: null,
  version: 0,
};

/**
 * Pause the moderation queue
 * @param {string} actor - Who initiated the pause
 * @param {string} reason - Why the queue was paused
 * @returns {object} Updated queue state
 */
function pauseQueue(actor, reason = 'Manual pause') {
  if (queueState.paused) {
    return { success: false, message: 'Queue already paused' };
  }

  queueState.paused = true;
  queueState.pausedAt = new Date().toISOString();
  queueState.version++;

  // Push to artifact stream
  if (global.artifactStream) {
    global.artifactStream.push({
      timestamp: queueState.pausedAt,
      type: 'QUEUE',
      severity: 'warning',
      message: `Queue PAUSED by ${actor}: ${reason}`,
      data: { actor, reason, version: queueState.version },
    });
  }

  console.log(`⏸️  Queue paused by ${actor}: ${reason}`);

  return {
    success: true,
    message: 'Queue paused',
    state: getQueueSnapshot(),
  };
}

/**
 * Resume the moderation queue
 * @param {string} actor - Who initiated the resume
 * @returns {object} Updated queue state
 */
function resumeQueue(actor) {
  if (!queueState.paused) {
    return { success: false, message: 'Queue is not paused' };
  }

  queueState.paused = false;
  queueState.resumedAt = new Date().toISOString();
  queueState.version++;

  // Push to artifact stream
  if (global.artifactStream) {
    global.artifactStream.push({
      timestamp: queueState.resumedAt,
      type: 'QUEUE',
      severity: 'info',
      message: `Queue RESUMED by ${actor}`,
      data: { actor, version: queueState.version },
    });
  }

  console.log(`▶️  Queue resumed by ${actor}`);

  return {
    success: true,
    message: 'Queue resumed',
    state: getQueueSnapshot(),
  };
}

/**
 * Set priority for a specific creator
 * @param {string} creatorId - Creator's user ID
 * @param {number} priority - Priority level (1-10, higher = more urgent)
 * @param {string} actor - Who set the priority
 * @returns {object} Updated state
 */
function setPriority(creatorId, priority, actor) {
  const priorityNum = Number(priority);

  if (Number.isNaN(priorityNum) || priorityNum < 1 || priorityNum > 10) {
    return { success: false, message: 'Priority must be between 1-10' };
  }

  const oldPriority = queueState.creatorPriorities[creatorId] || 5;
  queueState.creatorPriorities[creatorId] = priorityNum;
  queueState.version++;

  const timestamp = new Date().toISOString();

  // Push to artifact stream
  if (global.artifactStream) {
    global.artifactStream.push({
      timestamp,
      type: 'QUEUE',
      severity: 'info',
      message: `Priority set for creator ${creatorId}: ${oldPriority} → ${priorityNum} (by ${actor})`,
      data: { creatorId, oldPriority, newPriority: priorityNum, actor, version: queueState.version },
    });
  }

  console.log(`🎯 Priority set for ${creatorId}: ${priorityNum} (by ${actor})`);

  return {
    success: true,
    message: 'Priority updated',
    creatorId,
    priority: priorityNum,
    state: getQueueSnapshot(),
  };
}

/**
 * Get current queue state snapshot
 * @returns {object} Current queue state
 */
function getQueueSnapshot() {
  return {
    paused: queueState.paused,
    pausedAt: queueState.pausedAt,
    resumedAt: queueState.resumedAt,
    creatorPriorities: { ...queueState.creatorPriorities },
    priorityCount: Object.keys(queueState.creatorPriorities).length,
    version: queueState.version,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check if queue is currently paused
 * @returns {boolean}
 */
function isQueuePaused() {
  return queueState.paused;
}

/**
 * Get priority for a specific creator
 * @param {string} creatorId
 * @returns {number} Priority level (default 5)
 */
function getCreatorPriority(creatorId) {
  return queueState.creatorPriorities[creatorId] || 5;
}

module.exports = {
  pauseQueue,
  resumeQueue,
  setPriority,
  getQueueSnapshot,
  isQueuePaused,
  getCreatorPriority,
};
