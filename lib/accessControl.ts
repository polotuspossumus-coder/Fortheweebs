export function canTriggerCGI(userRole: string): boolean {
  return ['creator', 'influencer', 'founder'].includes(userRole);
}
