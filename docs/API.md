# Fortheweebs API Documentation

This document provides an overview of the main API endpoints and core modules for the Fortheweebs protocol platform.

## Endpoints

### /api/onboard
- **GET** `/api/onboard`
  - Returns onboarding status.
  - Response: `{ message: 'Onboard route active.' }`

### Swagger UI
- **GET** `/api-docs`
  - Interactive API documentation powered by Swagger.

## Core Modules

- **backend/server.ts**: Main Express server, integrates logging, monitoring, Swagger docs, and API routes.
- **backend/logger.ts**: Structured logging using pino.
- **backend/monitoring.ts**: Express status monitoring middleware.
- **backend/routes/onboard.ts**: Onboarding API route.
- **backend/swagger.ts**: Swagger API documentation setup.

## Usage
- Start the backend: `npm run start` or `node backend/server.ts`
- Access API docs: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---
For more details, see inline JSDoc comments in each module.
