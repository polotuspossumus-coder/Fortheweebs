import express from 'express';
import Sentry from './sentry';
import appInsights from './lib/appInsights';
import { globalErrorHandler } from './lib/errorHandler';
import { apiLimiter } from './lib/apiLimiter';

import helmet from 'helmet';

const app = express();

// Security headers and Content Security Policy
app.use(helmet());
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
			objectSrc: ["'none'"],
			upgradeInsecureRequests: [],
		},
	})
);

// Sentry request and tracing handlers
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Application Insights is initialized by import (side effect)


// Apply rate limiter to all /api/ routes
app.use('/api/', apiLimiter);

// Your routes here...

// Sentry error handler
app.use(Sentry.Handlers.errorHandler());

// Global error handler with Discord notification
app.use(globalErrorHandler);

export default app;
