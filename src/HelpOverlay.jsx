import { useState } from 'react';

export default function HelpOverlay() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Help</button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg">
            <h2 className="text-xl font-bold mb-2">How to Use Vanguard</h2>
            <p>Upload media, remix with tools, publish with tiered access.</p>
            <button onClick={() => setOpen(false)} className="mt-4">Close</button>
          </div>
        </div>
      )}
    </>
  );
}
