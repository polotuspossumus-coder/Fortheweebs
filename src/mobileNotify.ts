// mobileNotify.ts
export async function sendMobileNotification(userId: string, message: string, type: 'artifact' | 'campaign' | 'system') {
  const payload = { userId, message, type, timestamp: Date.now() };
  const response = await fetch('/api/notify/mobile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Notification failed');
  return await response.json(); // returns delivery status
}
