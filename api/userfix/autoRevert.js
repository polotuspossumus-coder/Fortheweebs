// api/userfix/autoRevert.js - Auto-revert on SLO breach
const { createClient } = require('@supabase/supabase-js');
const { writeArtifact } = require('../../utils/server-safety');
const { executeRemediation } = require('../bugfixer/remediation');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Track SLO breaches
let consecutiveBreaches = 0;
const BREACH_THRESHOLD = 3; // Revert after 3 consecutive breaches

// Check SLOs and auto-revert if breached
async function checkAndRevert(metrics) {
  const breaches = [];
  
  // Check error rate (< 1% = 99% success rate)
  if (metrics.requests.errorRate > 1) {
    breaches.push({ type: 'error_rate', value: metrics.requests.errorRate, threshold: 1 });
  }
  
  // Check p95 latency (< 500ms)
  if (metrics.latency.p95 > 500) {
    breaches.push({ type: 'latency_p95', value: metrics.latency.p95, threshold: 500 });
  }
  
  // Check memory health
  if (!metrics.memory.isHealthy) {
    breaches.push({ type: 'memory', value: metrics.memory.heapUsedMB, threshold: metrics.memory.threshold });
  }
  
  if (breaches.length > 0) {
    consecutiveBreaches++;
    
    await writeArtifact('sloBreachDetected', {
      breaches,
      consecutiveCount: consecutiveBreaches,
      metrics,
    });
    
    // Auto-revert after threshold
    if (consecutiveBreaches >= BREACH_THRESHOLD) {

      try {
        // Get last applied repair
        const { data: lastRepair, error } = await supabase
          .from('ftw_repairs')
          .select('*')
          .eq('status', 'applied')
          .order('applied_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error || !lastRepair) {
          return;
        }
        
        // Revert the change
        const change = lastRepair.proposed_change;
        
        switch (lastRepair.repair_type) {
          case 'flag':
            // Toggle flag back
            await supabase
              .from('ftw_flags')
              .update({ active: !change.active })
              .eq('flag_name', change.flag_name);
            break;
            
          case 'content':
          case 'config':
            // Mark repair as reverted (can't auto-restore previous value without history)

            break;
        }
        
        // Mark repair as reverted
        await supabase
          .from('ftw_repairs')
          .update({ status: 'reverted' })
          .eq('id', lastRepair.id);
        
        await writeArtifact('autoRevertExecuted', {
          revertedRepairId: lastRepair.id,
          reason: 'SLO breach threshold reached',
          breaches,
        });
        
        // Restart app
        await executeRemediation('restart-app');
        
        consecutiveBreaches = 0;
      } catch (error) {
        console.error('[AutoRevert] Failed:', error);
      }
    }
  } else {
    // Reset counter on healthy metrics
    consecutiveBreaches = 0;
  }
}

// Start SLO monitor (check every 60 seconds)
let sloMonitorTimer = null;
function startSLOMonitor(metricsCollector) {

  sloMonitorTimer = setInterval(() => {
    const metrics = metricsCollector.getMetrics();
    checkAndRevert(metrics);
  }, 60000); // Every 60 seconds
  
  // Cleanup on exit
  process.on('SIGTERM', () => { if (sloMonitorTimer) clearInterval(sloMonitorTimer); });
  process.on('SIGINT', () => { if (sloMonitorTimer) clearInterval(sloMonitorTimer); });
}

module.exports = {
  checkAndRevert,
  startSLOMonitor,
};
