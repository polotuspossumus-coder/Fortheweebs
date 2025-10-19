
import posthog from 'posthog-js';
let Sentry: any;
try {
  // Use require for compatibility with ESM/TS and Next.js
  // @ts-ignore
  Sentry = require('@sentry/node');
} catch (e) {
  Sentry = null;
}

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY!;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

export function initAnalytics() {
  if (typeof window !== 'undefined') {
    posthog.init(POSTHOG_KEY, { api_host: POSTHOG_HOST });
  }
  if (Sentry && Sentry.init) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
    });
  }
}

export function trackEvent(name: string, props: Record<string, any> = {}) {
  if (typeof window !== 'undefined') {
    posthog.capture(name, props);
  }
}

export function captureError(error: Error, context: Record<string, any> = {}) {
  if (Sentry && Sentry.captureException) {
    Sentry.captureException(error, { extra: context });
  }
}
