export const trackPageView = async (path: string) => {
  await fetch('/api/track', {
    method: 'POST',
    body: JSON.stringify({ path, timestamp: new Date().toISOString() }),
  });
};
