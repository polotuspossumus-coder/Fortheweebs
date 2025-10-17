import { useState } from 'react';

export default function TermsModal({ onAccept }) {
  const [open, setOpen] = useState(true);

  return open ? (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded max-w-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Terms of Use</h2>
        <p className="text-sm mb-4">
          By using Vanguard, you agree to our terms: no illegal content, no copyright violations, and all uploads are subject to moderation and remix lineage logging.
        </p>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded"
          onClick={() => {
            setOpen(false);
            onAccept();
          }}
        >
          I Accept
        </button>
      </div>
    </div>
  ) : null;
}
