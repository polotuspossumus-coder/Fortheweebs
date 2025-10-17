import React from 'react';
/**
 * @param {{ proposal: {id: string, title: string, rationale: string} }} props
 */
export default function MobileGovernanceVote({ proposal }) {
  const vote = async (choice) => {
    try {
      await fetch('/api/governance-vote', {
        method: 'POST',
        body: JSON.stringify({ proposalId: proposal.id, vote: choice }),
        headers: { 'Content-Type': 'application/json' },
      });
      // Optionally show feedback
    } catch (err) {
      // Optionally handle error
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto" aria-label="Governance vote">
      <h3 className="text-base font-bold">{proposal.title}</h3>
      <p className="text-sm text-gray-700 mb-4">{proposal.rationale}</p>
      <button
        className="w-full bg-green-600 text-white py-2 rounded"
        onClick={() => vote('yes')}
        aria-label="Vote yes"
      >
        Vote Yes
      </button>
      <button
        className="mt-2 w-full bg-red-600 text-white py-2 rounded"
        onClick={() => vote('no')}
        aria-label="Vote no"
      >
        Vote No
      </button>
    </div>
  );
}
