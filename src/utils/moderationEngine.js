// Moderation proposal engine
function proposeAction(userId, actionType) {
  return {
    userId,
    actionType, // 'ban', 'crown', 'graveyard'
    proposedBy: 'AI Council',
    timestamp: Date.now(),
    status: 'pending'
  };
}

// Polotus confirms or rejects
function confirmAction(proposal, decision) {
  proposal.status = decision === 'approve' ? 'confirmed' : 'rejected';
  proposal.confirmedBy = 'Polotus';
  proposal.confirmedAt = Date.now();
  return proposal;
}

export { proposeAction, confirmAction };
