// ritualScheduler.ts
export async function scheduleRitual(userId: string, ritualType: 'tribute' | 'campaign' | 'drop', date: string) {
  const payload = {
    userId,
    ritualType,
    date,
    legacyId: `RIT-${userId}-${ritualType}-${Date.now()}`,
  };

  const response = await fetch('/api/ritual/schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Ritual scheduling failed');
  return await response.json(); // returns ritual ID, countdown, legacy sync
}
