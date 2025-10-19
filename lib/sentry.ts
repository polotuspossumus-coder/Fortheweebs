// Stub for Sentry if not present
export default {
  Handlers: {
    requestHandler: () => (req: any, res: any, next: any) => next(),
    tracingHandler: () => (req: any, res: any, next: any) => next(),
    errorHandler: () => (err: any, req: any, res: any, next: any) => next(err),
  },
  init: () => {},
};
