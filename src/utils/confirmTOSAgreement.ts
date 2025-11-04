// Triggered when user confirms signature
export function confirmTOSAgreement(userId: string) {
  return {
    userId,
    artifact: 'Fortheweebs_TOS_v1.1',
    timestamp: new Date().toISOString(),
    signature: 'confirmed',
    jurisdiction: 'sovereign',
    liability: 'none',
    disputeHandling: 'none',
  };
}
