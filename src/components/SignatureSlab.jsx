import React from "react";

export default function SignatureSlab({ onConfirm }) {
  return (
    <div className="bg-purple-700 text-white p-6 rounded shadow-lg max-w-xl mx-auto">
      <p className="mb-4">
        I acknowledge and accept the Fortheweebs Terms of Service v1.1, including its sovereign governance,
        autonomous moderation, and full liability disclaimer. I understand that all creative activity is at my own risk
        and that no disputes will be mediated by the platform or its founder.
      </p>
      <button
        onClick={onConfirm}
        className="bg-white text-purple-700 px-4 py-2 rounded font-bold hover:bg-gray-100"
      >
        Confirm & Sign
      </button>
    </div>
  );
}
