// Stub for Application Insights if not present
const appInsights = {
  setup: () => ({
    setAutoCollectRequests: () => appInsights,
    setAutoCollectPerformance: () => appInsights,
    setAutoCollectExceptions: () => appInsights,
    start: () => appInsights,
  }),
};
export default appInsights;
