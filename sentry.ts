// sentry.ts
// Sentry initialization for server-side error tracking
// @ts-ignore
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

export default Sentry;
