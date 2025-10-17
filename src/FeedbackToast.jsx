import { useState } from 'react';

export default function FeedbackToast({ message }) {
  const [visible, setVisible] = useState(true);

  return visible ? (
    <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg">
      {message}
      <button onClick={() => setVisible(false)} className="ml-2 text-sm underline">Dismiss</button>
    </div>
  ) : null;
}
