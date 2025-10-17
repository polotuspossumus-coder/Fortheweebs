export async function logValidatorAction(creatorId: string, action: string, metadata: any = {}) {
  try {
    await fetch('/api/log-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId, action, metadata }),
    });
  } catch (err) {
    console.error('Validator action logging failed:', err);
  }
}
