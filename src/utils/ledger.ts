/**
 * Sync action to governance ledger
 * Logs user actions for audit trail
 */
export async function syncLedger(userId: string, action: string) {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const response = await fetch(`${apiUrl}/api/governance/ledger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        action,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      console.warn('Ledger sync failed:', response.status);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error syncing ledger:', err);
    return false;
  }
}
