import React from 'react';

/**
 * ManualOverrideDashboard component for moderation proposals.
 * @param proposals - Array of proposal objects ({ userId, actionType, ... })
 * @param confirm - Function to confirm proposal (proposal, action)
 */
export default function ManualOverrideDashboard({ proposals, confirm }) {
  return (
    <div>
      {proposals.map(p => (
        <div key={p.userId}>
          <strong>{p.actionType.toUpperCase()}</strong>  {p.userId}
          <button onClick={() => confirm(p, 'approve')}>✅</button>
          <button onClick={() => confirm(p, 'reject')}>❌</button>
        </div>
      ))}
    </div>
  );
}
