import expressStatusMonitor from 'express-status-monitor';

export const setupMonitoring = (app: any) => {
  app.use(expressStatusMonitor());
};
