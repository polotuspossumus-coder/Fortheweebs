import React, { useState } from 'react';

export default function MessagingSystem() {
  const [messages] = useState([
    { id: 1, from: 'System', subject: 'Welcome to ForTheWeebs!', body: 'Thanks for joining our platform.', timestamp: new Date().toISOString(), read: false },
    { id: 2, from: 'Admin', subject: 'Platform Update', body: 'New features have been added.', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true },
    { id: 3, from: 'Support', subject: 'How can we help?', body: 'Let us know if you have any questions.', timestamp: new Date(Date.now() - 172800000).toISOString(), read: true }
  ]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Messages</h1>
        {unreadCount > 0 && (
          <span style={{
            background: '#ff4444',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            {unreadCount} unread
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedMessage ? '1fr 2fr' : '1fr', gap: '20px' }}>
        {/* Message List */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          {messages.map(msg => (
            <div
              key={msg.id}
              onClick={() => setSelectedMessage(msg)}
              style={{
                padding: '16px',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'pointer',
                background: selectedMessage?.id === msg.id ? '#f9fafb' : msg.read ? 'white' : '#eff6ff',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.background = selectedMessage?.id === msg.id ? '#f9fafb' : msg.read ? 'white' : '#eff6ff'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: msg.read ? '400' : '700', fontSize: '0.875rem' }}>
                  {msg.from}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {new Date(msg.timestamp).toLocaleDateString()}
                </span>
              </div>
              <div style={{ fontWeight: msg.read ? '400' : '600', marginBottom: '4px' }}>
                {msg.subject}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {msg.body}
              </div>
            </div>
          ))}
        </div>

        {/* Message Detail */}
        {selectedMessage && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '24px'
          }}>
            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>
                {selectedMessage.subject}
              </h2>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.875rem', color: '#6b7280' }}>
                <span><strong>From:</strong> {selectedMessage.from}</span>
                <span><strong>Date:</strong> {new Date(selectedMessage.timestamp).toLocaleString()}</span>
              </div>
            </div>
            <div style={{ lineHeight: '1.6' }}>
              {selectedMessage.body}
            </div>
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button style={{
                padding: '8px 16px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}>
                Reply
              </button>
              <button style={{
                padding: '8px 16px',
                background: 'transparent',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}>
                Archive
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
