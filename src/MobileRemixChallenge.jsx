import React from 'react';
/**
 * @param {{ challenge: {id: string, title: string, description: string} }} props
 */
export default function MobileRemixChallenge({ challenge }) {
  const submit = async () => {
    try {
      await fetch('/api/remix-challenge/submit', {
        method: 'POST',
        body: JSON.stringify({ challengeId: challenge.id }),
        headers: { 'Content-Type': 'application/json' },
      });
      // Optionally show feedback
    } catch (err) {
      // Optionally handle error
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto" aria-label="Remix challenge">
      <h2 className="text-lg font-bold mb-2">{challenge.title}</h2>
      <p className="text-sm text-gray-700 mb-4">{challenge.description}</p>
      <button
        className="w-full bg-indigo-600 text-white py-2 rounded"
        onClick={submit}
        aria-label="Submit remix"
      >
        Submit Remix
      </button>
    </div>
  );
}
