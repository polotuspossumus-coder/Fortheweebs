import React, { useState, useEffect } from 'react';
import './UserPresence.css';

/**
 * Real-time user presence indicator
 * Shows active users and their status
 */
const UserPresence = ({ userId, showDetails = true }) => {
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [userStatus, setUserStatus] = useState('online');

    useEffect(() => {
        // Simulate online users (replace with real Supabase realtime)
        const mockUsers = [
            { id: 1, name: 'Sarah K.', avatar: '👩‍🎨', status: 'creating', lastSeen: 'now' },
            { id: 2, name: 'Mike D.', avatar: '🧑‍💻', status: 'editing', lastSeen: '2m ago' },
            { id: 3, name: 'Alex T.', avatar: '👨‍🎤', status: 'online', lastSeen: 'now' },
        ];

        setOnlineUsers(mockUsers);

        // Update user's own status
        const updateStatus = () => {
            const isActive = document.visibilityState === 'visible';
            setUserStatus(isActive ? 'online' : 'away');
        };

        document.addEventListener('visibilitychange', updateStatus);
        return () => document.removeEventListener('visibilitychange', updateStatus);
    }, [userId]);

    if (!showDetails) {
        return (
            <div className="presence-indicator">
                <div className={`presence-dot ${userStatus}`} />
                <span className="presence-count">{onlineUsers.length} online</span>
            </div>
        );
    }

    return (
        <div className="user-presence">
            <div className="presence-header">
                <h3>🌟 Active Creators</h3>
                <span className="online-count">{onlineUsers.length} online</span>
            </div>
            <div className="presence-list">
                {onlineUsers.map(user => (
                    <div key={user.id} className="presence-user">
                        <div className="user-avatar">{user.avatar}</div>
                        <div className="user-info">
                            <div className="user-name">{user.name}</div>
                            <div className="user-activity">
                                <span className={`status-dot ${user.status}`} />
                                {user.status}
                            </div>
                        </div>
                        <div className="user-time">{user.lastSeen}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserPresence;
