/**
 * Bug Fixer Integration for Adult Content System
 * Automatically detects, reports, and fixes issues across the platform
 */

const BUG_FIXER_API = '/api/ai/analyze-screenshot';
const BUG_FIXER_FIX_API = '/api/ai/generate-fix';
const BUG_FIXER_PR_API = '/api/ai/create-pr';

/**
 * Critical systems to monitor
 */
export const MONITORED_SYSTEMS = {
  CREATOR_APPLICATION: 'creator_application',
  ID_UPLOAD: 'id_upload',
  COMPLIANCE_2257: 'compliance_2257',
  ADULT_CONTENT_VERIFICATION: 'adult_content_verification',
  PAYMENT_ROUTING: 'payment_routing',
  ENCRYPTION: 'encryption',
  DATABASE: 'database',
  EMAIL_TEMPLATES: 'email_templates',
  API_ENDPOINTS: 'api_endpoints',
};

/**
 * Error severity levels
 */
export const SEVERITY = {
  CRITICAL: 'critical', // System down, data loss, security breach
  HIGH: 'high',         // Major feature broken, compliance violation
  MEDIUM: 'medium',     // Minor feature broken, degraded UX
  LOW: 'low',          // Cosmetic issues, warnings
};

/**
 * Auto-report error to bug fixer
 */
export async function reportBugToFixer(error, context = {}) {
  try {
    const bugReport = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context: {
        system: context.system || 'unknown',
        severity: context.severity || SEVERITY.MEDIUM,
        userAction: context.userAction || 'unknown',
        component: context.component || 'unknown',
        timestamp: new Date().toISOString(),
        userId: localStorage.getItem('userId') || 'anonymous',
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context,
      },
      screenshot: await captureScreenshot(),
    };

    // Send to bug fixer API
    const response = await fetch(BUG_FIXER_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bugReport),
    });

    if (!response.ok) {
      console.error('Failed to report bug to fixer:', response.statusText);
      return null;
    }

    const result = await response.json();

    // If critical, attempt auto-fix
    if (context.severity === SEVERITY.CRITICAL) {
      await attemptAutoFix(result.analysisId, bugReport);
    }

    return result;
  } catch (err) {
    console.error('Error reporting to bug fixer:', err);
    return null;
  }
}

/**
 * Attempt automatic fix for critical bugs
 */
async function attemptAutoFix(analysisId, bugReport) {
  try {
    console.log('🔧 Attempting auto-fix for critical bug:', analysisId);

    const response = await fetch(BUG_FIXER_FIX_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analysisId,
        bugReport,
        autoApply: false, // Don't auto-apply, create PR instead
      }),
    });

    if (response.ok) {
      const fix = await response.json();
      console.log('✅ Fix generated:', fix);

      // Create PR with fix
      await createFixPR(fix);

      return fix;
    }
  } catch (err) {
    console.error('Auto-fix failed:', err);
  }
  return null;
}

/**
 * Create PR with automated fix
 */
async function createFixPR(fix) {
  try {
    const response = await fetch(BUG_FIXER_PR_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `🤖 Auto-fix: ${fix.title}`,
        description: fix.description,
        changes: fix.changes,
        branch: `autofix/${Date.now()}`,
      }),
    });

    if (response.ok) {
      const pr = await response.json();
      console.log('✅ PR created:', pr.url);

      // Notify user
      showNotification({
        type: 'info',
        message: `Automated fix created: ${pr.url}`,
        duration: 10000,
      });

      return pr;
    }
  } catch (err) {
    console.error('PR creation failed:', err);
  }
  return null;
}

/**
 * Capture screenshot for bug report
 */
async function captureScreenshot() {
  try {
    // Use html2canvas if available
    if (window.html2canvas) {
      const canvas = await window.html2canvas(document.body);
      return canvas.toDataURL('image/png');
    }
  } catch (err) {
    console.warn('Screenshot capture failed:', err);
  }
  return null;
}

/**
 * Monitor specific system health
 */
export function monitorSystem(system, healthCheck) {
  const interval = setInterval(async () => {
    try {
      const isHealthy = await healthCheck();
      if (!isHealthy) {
        reportBugToFixer(
          new Error(`System health check failed: ${system}`),
          {
            system,
            severity: SEVERITY.HIGH,
            component: 'SystemMonitor',
            healthCheckResult: isHealthy,
          }
        );
      }
    } catch (err) {
      reportBugToFixer(err, {
        system,
        severity: SEVERITY.HIGH,
        component: 'SystemMonitor',
      });
    }
  }, 60000); // Check every minute

  return () => clearInterval(interval);
}

/**
 * Wrap async function with error reporting
 */
export function withBugReporting(fn, context = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      await reportBugToFixer(error, context);
      throw error; // Re-throw so app can handle it
    }
  };
}

/**
 * React Error Boundary wrapper
 */
export class BugFixerErrorBoundary extends Error {
  constructor(error, errorInfo, context = {}) {
    super(error.message);
    this.originalError = error;
    this.errorInfo = errorInfo;
    this.context = context;

    // Auto-report to bug fixer
    reportBugToFixer(error, {
      ...context,
      componentStack: errorInfo.componentStack,
      severity: SEVERITY.HIGH,
    });
  }
}

/**
 * Monitor creator application flow
 */
export function monitorCreatorApplication() {
  console.log('👀 Monitoring creator application flow...');

  // Monitor form submissions
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [url, options] = args;

    // Monitor creator application API calls
    if (url.includes('/api/creator-applications')) {
      try {
        const response = await originalFetch(...args);

        // Report failures
        if (!response.ok) {
          const error = new Error(`API call failed: ${url}`);
          await reportBugToFixer(error, {
            system: MONITORED_SYSTEMS.CREATOR_APPLICATION,
            severity: SEVERITY.HIGH,
            component: 'CreatorApplicationAPI',
            url,
            method: options?.method || 'GET',
            status: response.status,
            statusText: response.statusText,
          });
        }

        return response;
      } catch (error) {
        await reportBugToFixer(error, {
          system: MONITORED_SYSTEMS.CREATOR_APPLICATION,
          severity: SEVERITY.CRITICAL,
          component: 'CreatorApplicationAPI',
          url,
        });
        throw error;
      }
    }

    return originalFetch(...args);
  };
}

/**
 * Monitor ID upload encryption
 */
export async function validateEncryption() {
  try {
    // Check if encryption key is set
    const response = await fetch('/api/creator-applications/validate-encryption', {
      method: 'POST',
    });

    if (!response.ok) {
      reportBugToFixer(
        new Error('Encryption validation failed'),
        {
          system: MONITORED_SYSTEMS.ENCRYPTION,
          severity: SEVERITY.CRITICAL,
          component: 'EncryptionValidator',
        }
      );
      return false;
    }

    return true;
  } catch (error) {
    reportBugToFixer(error, {
      system: MONITORED_SYSTEMS.ENCRYPTION,
      severity: SEVERITY.CRITICAL,
      component: 'EncryptionValidator',
    });
    return false;
  }
}

/**
 * Monitor database connectivity
 */
export async function validateDatabaseConnection() {
  try {
    const response = await fetch('/health');
    return response.ok;
  } catch (error) {
    reportBugToFixer(error, {
      system: MONITORED_SYSTEMS.DATABASE,
      severity: SEVERITY.CRITICAL,
      component: 'DatabaseValidator',
    });
    return false;
  }
}

/**
 * Monitor compliance page accessibility
 */
export async function validateCompliancePage() {
  try {
    const response = await fetch('/compliance-2257');
    if (!response.ok) {
      reportBugToFixer(
        new Error('2257 compliance page not accessible'),
        {
          system: MONITORED_SYSTEMS.COMPLIANCE_2257,
          severity: SEVERITY.CRITICAL,
          component: 'CompliancePageValidator',
        }
      );
      return false;
    }
    return true;
  } catch (error) {
    reportBugToFixer(error, {
      system: MONITORED_SYSTEMS.COMPLIANCE_2257,
      severity: SEVERITY.CRITICAL,
      component: 'CompliancePageValidator',
    });
    return false;
  }
}

/**
 * Show notification to user
 */
function showNotification({ type, message, duration = 5000 }) {
  // Use existing toast system if available
  if (window.showToast) {
    window.showToast(message, type);
    return;
  }

  // Fallback to console
  console.log(`[${type.toUpperCase()}]`, message);
}

/**
 * Initialize bug fixer monitoring
 */
export function initBugFixerMonitoring() {
  console.log('🚀 Initializing bug fixer monitoring...');

  // Monitor creator application
  monitorCreatorApplication();

  // Monitor system health
  monitorSystem(MONITORED_SYSTEMS.DATABASE, validateDatabaseConnection);
  monitorSystem(MONITORED_SYSTEMS.ENCRYPTION, validateEncryption);
  monitorSystem(MONITORED_SYSTEMS.COMPLIANCE_2257, validateCompliancePage);

  // Global error handler
  window.addEventListener('error', (event) => {
    reportBugToFixer(event.error, {
      system: 'global',
      severity: SEVERITY.HIGH,
      component: 'GlobalErrorHandler',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    reportBugToFixer(
      new Error(event.reason?.message || 'Unhandled promise rejection'),
      {
        system: 'global',
        severity: SEVERITY.HIGH,
        component: 'UnhandledPromiseRejection',
        reason: event.reason,
      }
    );
  });

  console.log('✅ Bug fixer monitoring active');
}

export default {
  reportBugToFixer,
  monitorSystem,
  withBugReporting,
  BugFixerErrorBoundary,
  initBugFixerMonitoring,
  MONITORED_SYSTEMS,
  SEVERITY,
};
