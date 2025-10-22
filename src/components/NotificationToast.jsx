import { useEffect, useState } from 'react';

/**
 * NotificationToast component for displaying multiple toast messages with auto-dismiss and optional icons.
 * @param messages - Array of message objects: { text: string, icon?: string }
 */
export default function NotificationToast({ messages = [] }) {
  const [visibleMessages, setVisibleMessages] = useState(messages);

  useEffect(() => {
    const timers = messages.map((_, i) =>
      setTimeout(() => {
        setVisibleMessages((prev) => prev.filter((_, index) => index !== i));
      }, 3000 + i * 500) // staggered auto-dismiss
    );
    return () => timers.forEach(clearTimeout);
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {visibleMessages.map((msg, i) => (
        <div
          key={i}
          className="bg-purple-700 text-white px-4 py-2 rounded shadow-lg animate-fade-in-out flex items-center gap-2"
        >
          {msg.icon && <span className="text-xl">{msg.icon}</span>}
          <span>{msg.text}</span>
        </div>
      ))}
    </div>
  );
}
