/**
 * Get user tier from Supabase profiles
 * Returns array of tier names for the user
 */
export async function getUserTier(userId) {
    if (!userId) return ['Free'];
    
    try {
        // In production, this would query Supabase
        // For now, check localStorage or return default
        const userData = localStorage.getItem('userTier');
        if (userData) {
            return [userData];
        }
        
        // Default tier
        return ['Free'];
    } catch (err) {
        console.error('Error getting user tier:', err);
        return ['Free'];
    }
}
//# sourceMappingURL=tierLogic.js.map