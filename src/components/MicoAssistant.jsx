import React, { useState } from 'react';

export default function MicoAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm Mico 🧠, powered by Microsoft Copilot. I can help you with features, answer questions, or log bugs!" }
    ]);
    const [input, setInput] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const [isThinking, setIsThinking] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || isThinking) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setIsThinking(true);

        // Check if it's a bug report
        const isBugReport = userMessage.toLowerCase().includes('bug') ||
            userMessage.toLowerCase().includes('issue') ||
            userMessage.toLowerCase().includes('broken') ||
            userMessage.toLowerCase().includes('not working');

        if (isBugReport) {
            // Log bug to database instead of localStorage
            try {
                await fetch('http://localhost:3001/api/issues', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: localStorage.getItem('userId') || 'anonymous',
                        issueType: 'bug',
                        description: userMessage,
                        context: {
                            url: window.location.href,
                            timestamp: new Date().toISOString(),
                            userAgent: navigator.userAgent
                        }
                    })
                });
            } catch (err) {
                console.error('Failed to log issue:', err);
                // Fallback to localStorage
                try {
                    const existingIssues = JSON.parse(localStorage.getItem('mico_issues') || '[]');
                    existingIssues.push({
                        timestamp: new Date().toISOString(),
                        userId: localStorage.getItem('userId') || 'anonymous',
                        issue: userMessage,
                        status: 'pending'
                    });
                    localStorage.setItem('mico_issues', JSON.stringify(existingIssues));
                } catch (localErr) {
                    console.error('Fallback failed:', localErr);
                }
            }
        }

        try {
            // Call GitHub Models API (Microsoft Copilot backend)
            const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content: `You are Mico, Microsoft Copilot assistant for ForTheWeebs platform. Be helpful, friendly, and concise. Help users with:
- Platform features (content upload, tiers, tools)
- Answering questions about functionality
- Logging bugs (acknowledge and reassure)
Keep responses under 3 sentences unless explaining complex topics.`
                        },
                        ...messages.slice(0, -1), // Previous conversation
                        { role: 'user', content: userMessage }
                    ],
                    model: 'gpt-4o',
                    temperature: 0.7,
                    max_tokens: 200
                })
            });

            const data = await response.json();
            let aiResponse = data.choices?.[0]?.message?.content || "I'm having trouble connecting right now. Please try again!";

            if (isBugReport) {
                aiResponse += "\n\n🔧 I've logged this issue to my dev panel for investigation!";
            }

            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        } catch (error) {
            console.error('AI Error:', error);
            
            // Fallback response
            let fallback = "I'm having connection issues. ";
            if (isBugReport) {
                fallback = "🔧 I've logged your issue! I'm having trouble with my AI connection right now, but your bug report is saved.";
            } else if (userMessage.toLowerCase().includes('help')) {
                fallback += "Try asking about platform features, tiers, or tools!";
            } else {
                fallback += "I'm still here to help - try asking about ForTheWeebs features!";
            }
            
            setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
        } finally {
            setIsThinking(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                    cursor: 'pointer',
                    fontSize: '1.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                aria-label="Open Mico Assistant"
            >
                🧠
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: isMinimized ? '300px' : '380px',
            height: isMinimized ? '60px' : '500px',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
            transition: 'all 0.3s ease'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '16px',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>🧠</span>
                    <div>
                        <div style={{ fontWeight: '700' }}>Mico Assistant</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Free AI Help</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: '#fff',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        {isMinimized ? '□' : '_'}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: '#fff',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        ×
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    background: msg.role === 'user' ? '#667eea' : '#f3f4f6',
                                    color: msg.role === 'user' ? '#fff' : '#1f2937',
                                    fontSize: '0.875rem',
                                    lineHeight: '1.5'
                                }}
                            >
                                {msg.content}
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: '12px',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        gap: '8px'
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask anything or report a bug..."
                            style={{
                                flex: 1,
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={handleSend}
                            style={{
                                padding: '10px 16px',
                                background: '#667eea',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.875rem'
                            }}
                        >
                            Send
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
