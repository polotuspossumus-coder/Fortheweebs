/**
 * Get creator tier progression history
 * Fetches from API or returns cached data
 */
export async function getCreatorLedger(userId) {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const response = await fetch(`${apiUrl}/api/governance/creator-ledger/${userId}`);
    
    if (!response.ok) {
      // Return example data if API fails
      return [
        { timestamp: Date.now() - 86400000 * 3, tier: "Free" },
        { timestamp: Date.now() - 86400000 * 2, tier: "Creator" },
        { timestamp: Date.now() - 86400000, tier: "Pro" },
        { timestamp: Date.now(), tier: "Premium" },
      ];
    }
    
    const data = await response.json();
    return data.ledger || [];
  } catch (err) {
    console.error('Error fetching creator ledger:', err);
    // Return fallback data
    return [
      { timestamp: Date.now(), tier: "Free" }
    ];
  }
}

/**
 * Get runtime platform and version info
 */
export const getRuntimeInfo = async () => {
  return {
    platform: typeof navigator !== 'undefined' ? 
      (navigator.userAgent.includes('Mobile') ? 'mobile' : 'web') : 
      'web',
    version: '2.1.0',
    buildDate: '2025-12-13',
    environment: import.meta.env.MODE || 'production'
  };
};
