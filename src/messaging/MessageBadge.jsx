import React from 'react';

export default function MessageBadge({ onClick }) {
  const unreadCount = 3; // TODO: Connect to actual message state

  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.5rem',
        padding: '0.5rem'
      }}
      aria-label={`Messages (${unreadCount} unread)`}
    >
      💬
      {unreadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            background: '#ff4444',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}
        >
          {unreadCount}
        </span>
      )}
    </button>
  );
}
