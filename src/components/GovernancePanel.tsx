import React from 'react';
import VotingModule from './VotingModule'; // Ensure this exists or stub as needed
import { post } from '../utils/apiHooks';

const submitVote = (option) => {
  // Send vote to backend
  post('/api/governance/vote', {
    proposalType: 'ritualUnlock',
    option,
    timestamp: Date.now(),
  });
};

const GovernancePanel = () => (
  <div className="governance-panel">
    <h2>Governance Voting: Ritual Unlock</h2>
    <VotingModule
      proposalType="ritualUnlock"
      options={["Unlock Now", "Delay", "Seal"]}
      onVote={submitVote}
    />
  </div>
);

export default GovernancePanel;
