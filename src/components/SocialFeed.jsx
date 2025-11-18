import React, { useState, useEffect } from 'react';
import './SocialFeed.css';
import { isLifetimeVIP } from '../utils/vipAccess';

/**
 * Social Feed - Main content feed for all users
 * Free features: Posts, comments, likes, basic messaging
 * $1000/VIP features: CGI messages, video calls, live streaming with effects
 */
export const SocialFeed = ({ userId, userTier }) => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [activeTab, setActiveTab] = useState('feed'); // feed, messages, calls, streams
  const [showCGITools, setShowCGITools] = useState(false);

  // Check if user has premium features
  const userEmail = localStorage.getItem('ownerEmail') || localStorage.getItem('userEmail');
  const isPremium = userTier === 'PREMIUM_1000' || 
                    userTier === 'LIFETIME_VIP' || 
                    userId === 'owner' ||
                    isLifetimeVIP(userEmail);

  useEffect(() => {
    // Load posts from localStorage or API
    const savedPosts = JSON.parse(localStorage.getItem('socialPosts') || '[]');
    setPosts(savedPosts);
  }, []);

  const createPost = () => {
    if (!newPostContent.trim()) return;

    const newPost = {
      id: Date.now(),
      userId: userId,
      userName: localStorage.getItem('displayName') || localStorage.getItem('currentUserName') || 'Anonymous',
      avatar: localStorage.getItem('userAvatar') || '👤',
      content: newPostContent,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      hasCGI: false
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('socialPosts', JSON.stringify(updatedPosts));
    setNewPostContent('');
  };

  const likePost = (postId) => {
    const updatedPosts = posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    );
    setPosts(updatedPosts);
    localStorage.setItem('socialPosts', JSON.stringify(updatedPosts));
  };

  return (
    <div className="social-feed-container">
      {/* Navigation Tabs */}
      <div className="feed-nav">
        <button 
          className={`feed-nav-btn ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          📰 Feed
        </button>
        <button 
          className={`feed-nav-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          💬 Messages
        </button>
        <button 
          className={`feed-nav-btn ${activeTab === 'calls' ? 'active' : ''}`}
          onClick={() => setActiveTab('calls')}
        >
          📞 Calls
        </button>
        <button 
          className={`feed-nav-btn ${activeTab === 'streams' ? 'active' : ''}`}
          onClick={() => setActiveTab('streams')}
        >
          📡 Live Streams
        </button>
      </div>

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div className="feed-content">
          <div className="owner-badge">
            <h2>👑 Owner Dashboard</h2>
            <p>You have full admin access to all features</p>
          </div>

          {/* Post Creator */}
          <div className="post-creator">
            <textarea
              placeholder="What's on your mind?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={3}
            />
            <div className="post-creator-actions">
              <div className="post-options">
                <button className="post-option">📷 Photo</button>
                <button className="post-option">🎥 Video</button>
                {isPremium && (
                  <button 
                    className="post-option premium"
                    onClick={() => setShowCGITools(!showCGITools)}
                  >
                    ✨ CGI Effects
                  </button>
                )}
              </div>
              <button className="post-btn" onClick={createPost}>
                Post
              </button>
            </div>
            {showCGITools && isPremium && (
              <div className="cgi-tools-panel">
                <h4>🎨 CGI Tools ($1000/VIP Only)</h4>
                <div className="cgi-options">
                  <button>🌈 Background Effects</button>
                  <button>✨ Filters</button>
                  <button>👻 AR Stickers</button>
                  <button>🎭 Face Filters</button>
                </div>
              </div>
            )}
          </div>

          {/* Posts Feed */}
          <div className="posts-feed">
            {posts.length === 0 && (
              <div className="empty-feed">
                <h3>Welcome to ForTheWeebs! 🎌</h3>
                <p>Be the first to post something awesome</p>
              </div>
            )}
            {posts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <span className="post-avatar">{post.avatar}</span>
                  <div className="post-meta">
                    <strong>{post.userName}</strong>
                    <span className="post-time">
                      {new Date(post.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="post-content">{post.content}</div>
                <div className="post-actions">
                  <button onClick={() => likePost(post.id)}>
                    ❤️ {post.likes}
                  </button>
                  <button>💬 Comment</button>
                  <button>🔁 Share</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="messages-content">
          <h2>💬 Messages</h2>
          <p className="feature-status">✅ Free for all users</p>
          <div className="messages-placeholder">
            <h3>Direct Messaging System</h3>
            <p>Text messaging available for all users</p>
            {isPremium && (
              <div className="premium-features">
                <h4>💎 Your Premium Features:</h4>
                <ul>
                  <li>✨ Send CGI-enhanced messages</li>
                  <li>🎨 Custom animated stickers</li>
                  <li>👻 AR filters in messages</li>
                  <li>🎭 Voice modulation</li>
                </ul>
              </div>
            )}
            <button className="coming-soon-btn">Full Messaging Coming Soon</button>
          </div>
        </div>
      )}

      {/* Calls Tab */}
      {activeTab === 'calls' && (
        <div className="calls-content">
          <h2>📞 Voice & Video Calls</h2>
          <p className="feature-status">✅ Free for all users</p>
          <div className="calls-placeholder">
            <h3>Real-Time Communication</h3>
            <p>Voice and video calling for all users</p>
            {isPremium && (
              <div className="premium-features">
                <h4>💎 Your Premium Features:</h4>
                <ul>
                  <li>✨ Live CGI effects during calls</li>
                  <li>🎨 Real-time background replacement</li>
                  <li>👻 AR face filters</li>
                  <li>🎭 Voice effects and modulation</li>
                  <li>🎬 Screen recording with effects</li>
                </ul>
              </div>
            )}
            <button className="coming-soon-btn">WebRTC Integration Coming Soon</button>
          </div>
        </div>
      )}

      {/* Live Streams Tab */}
      {activeTab === 'streams' && (
        <div className="streams-content">
          <h2>📡 Live Streaming</h2>
          <p className="feature-status">✅ Free for all users</p>
          <div className="streams-placeholder">
            <h3>Broadcast Live</h3>
            <p>Stream live content to your audience</p>
            {isPremium && (
              <div className="premium-features">
                <h4>💎 Your Premium Features:</h4>
                <ul>
                  <li>✨ Live CGI effects on stream</li>
                  <li>🎨 Custom overlays and graphics</li>
                  <li>👻 AR elements in real-time</li>
                  <li>🎭 Scene transitions with effects</li>
                  <li>🎬 Multi-camera CGI compositing</li>
                  <li>🌈 Green screen replacement</li>
                </ul>
              </div>
            )}
            <button className="coming-soon-btn">Live Streaming Coming Soon</button>
          </div>
        </div>
      )}

      {/* Premium Upsell for Non-Premium Users */}
      {!isPremium && (
        <div className="premium-upsell">
          <h3>💎 Upgrade to $1,000 Tier</h3>
          <p>Unlock CGI messages, video effects, and live streaming tools!</p>
          <button onClick={() => {
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set('tab', 'premium');
            window.location.search = urlParams.toString();
          }}>
            Unlock Premium Features
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialFeed;
