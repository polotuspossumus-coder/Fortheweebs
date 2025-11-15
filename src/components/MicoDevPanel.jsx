import React, { useState, useEffect } from 'react';
import { isOwner } from '../utils/ownerAuth';

export default function MicoDevPanel() {
    const [isOwnerUser, setIsOwnerUser] = useState(false);
    const [activeTab, setActiveTab] = useState('chat');
    const [messages, setMessages] = useState([
        { role: 'system', content: '🧠 Mico online and ready. What should I build?' }
    ]);
    const [input, setInput] = useState('');
    const [logs, setLogs] = useState([
        { timestamp: new Date().toISOString(), action: 'System initialized', status: 'success' }
    ]);
    const [userIssues, setUserIssues] = useState([]);

    useEffect(() => {
        const checkOwner = async () => {
            const ownerStatus = await isOwner();
            setIsOwnerUser(ownerStatus);

            // Load user-reported issues
            if (ownerStatus) {
                const issues = JSON.parse(localStorage.getItem('mico_issues') || '[]');
                setUserIssues(issues);
            }
        };
        checkOwner();

        // Refresh issues every 5 seconds
        const interval = setInterval(() => {
            const issues = JSON.parse(localStorage.getItem('mico_issues') || '[]');
            setUserIssues(issues);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleSendMessage = () => {
        if (!input.trim()) return;

        setMessages([...messages,
        { role: 'user', content: input },
        { role: 'assistant', content: '🧠 Processing your request...' }
        ]);

        setLogs([...logs, {
            timestamp: new Date().toISOString(),
            action: `User request: ${input.substring(0, 50)}...`,
            status: 'pending'
        }]);

        setInput('');
    };

    if (!isOwnerUser) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>🔒 Owner Access Only</h2>
                <p style={{ color: '#6b7280' }}>Mico Dev Panel is restricted to the platform owner.</p>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a', color: '#fff' }}>
            {/* Header */}
            <div style={{
                padding: '16px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderBottom: '2px solid #667eea'
            }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                    🧠 Mico Dev Panel
                </h1>
                <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '0.875rem' }}>
                    Autonomous AI Development Agent
                </p>
            </div>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: '8px',
                padding: '12px 24px',
                background: '#1a1a1a',
                borderBottom: '1px solid #333'
            }}>
                {['chat', 'issues', 'help', 'logs'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '8px 16px',
                            background: activeTab === tab ? '#667eea' : 'transparent',
                            color: activeTab === tab ? '#fff' : '#999',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: activeTab === tab ? '600' : '400',
                            fontSize: '0.875rem',
                            textTransform: 'uppercase'
                        }}
                    >
                        {tab === 'chat' && '💬 Chat'}
                        {tab === 'issues' && '🐛 User Issues'}
                        {tab === 'help' && '📖 Help'}
                        {tab === 'logs' && '📊 Logs'}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflow: 'auto' }}>
                {activeTab === 'chat' && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Messages */}
                        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        marginBottom: '16px',
                                        padding: '12px 16px',
                                        background: msg.role === 'user' ? '#1e293b' : '#0f172a',
                                        borderLeft: `4px solid ${msg.role === 'user' ? '#667eea' : '#10b981'}`,
                                        borderRadius: '8px'
                                    }}
                                >
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                                        {msg.role === 'user' ? '👤 You' : '🧠 Mico'}
                                    </div>
                                    <div>{msg.content}</div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div style={{
                            padding: '16px 24px',
                            background: '#1a1a1a',
                            borderTop: '1px solid #333',
                            display: 'flex',
                            gap: '12px'
                        }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Tell Mico what to build..."
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    fontSize: '0.875rem'
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                style={{
                                    padding: '12px 24px',
                                    background: '#667eea',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'issues' && (
                    <div style={{ padding: '24px' }}>
                        <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🐛 User-Reported Issues
                            {userIssues.filter(i => i.status === 'pending').length > 0 && (
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    background: '#ef444444',
                                    color: '#ef4444'
                                }}>
                                    {userIssues.filter(i => i.status === 'pending').length} pending
                                </span>
                            )}
                        </h2>
                        {userIssues.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#64748b', padding: '32px' }}>
                                No issues reported yet. Users can report bugs through the Mico Assistant.
                            </div>
                        ) : (
                            userIssues.map((issue, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: '16px',
                                        background: '#1a1a1a',
                                        borderRadius: '8px',
                                        marginBottom: '12px',
                                        borderLeft: `4px solid ${issue.status === 'pending' ? '#ef4444' : '#10b981'}`
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {new Date(issue.timestamp).toLocaleString()}
                                        </span>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            background: issue.status === 'pending' ? '#ef444444' : '#10b98144',
                                            color: issue.status === 'pending' ? '#ef4444' : '#10b981'
                                        }}>
                                            {issue.status}
                                        </span>
                                    </div>
                                    <div style={{ marginBottom: '4px' }}>{issue.issue}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        Reported by: {issue.userId}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'help' && (
                    <div style={{ padding: '24px', maxWidth: '800px' }}>
                        <h2 style={{ marginBottom: '16px' }}>📖 Mico Documentation</h2>
                        <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                            <h3 style={{ marginBottom: '8px' }}>Quick Start</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                Type commands in the CHAT tab. Mico will execute them autonomously.
                            </p>
                        </div>
                        <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                            <h3 style={{ marginBottom: '8px' }}>Example Commands</h3>
                            <ul style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                <li>"Add a search feature to the dashboard"</li>
                                <li>"Fix the payment button bug"</li>
                                <li>"Create a user profile editor"</li>
                                <li>"Update all dependencies"</li>
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div style={{ padding: '24px' }}>
                        <h2 style={{ marginBottom: '16px' }}>📊 Action Logs</h2>
                        {logs.map((log, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '12px',
                                    background: '#1a1a1a',
                                    borderRadius: '6px',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </div>
                                    <div>{log.action}</div>
                                </div>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    background: log.status === 'success' ? '#10b98144' :
                                        log.status === 'pending' ? '#f59e0b44' : '#ef444444',
                                    color: log.status === 'success' ? '#10b981' :
                                        log.status === 'pending' ? '#f59e0b' : '#ef4444'
                                }}>
                                    {log.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {['files', 'editor', 'terminal'].includes(activeTab) && (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                        <p>{activeTab.toUpperCase()} tab - Under construction</p>
                        <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>
                            Use CHAT tab for all operations
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
