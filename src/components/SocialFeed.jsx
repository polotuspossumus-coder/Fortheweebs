import React, { useState, useEffect } from 'react';
import './SocialFeed.css';
import { isLifetimeVIP } from '../utils/vipAccess';
import { checkTierAccess } from '../utils/tierAccess';
import api from '../utils/backendApi';
import featureDetector from '../utils/featureDetection';
import { FeatureBlocker } from './FeatureDisabledBanner';

/**
 * Social Feed - Main content feed for all users
 * 
 * Tier Structure:
 * - Owner + VIPs: FREE everything, admin powers, all features
 * - $1000: Admin powers, all features, pay creator fees
 * - $500: All features except admin, pay creator fees
 * - $250: No VR/AR, pay creator fees
 * - $100: Basic features
 * - $50: Minimal features
 * - $15+$5: Adult content only
 * - FREE: Family friendly only
 */
export const SocialFeed = ({ userId, userTier }) => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [activeTab, setActiveTab] = useState('feed'); // feed, messages, calls, streams
  const [showCGITools, setShowCGITools] = useState(false);
  const [showMonetizeDialog, setShowMonetizeDialog] = useState(false);
  const [friends, setFriends] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [contentVisibility, setContentVisibility] = useState('PUBLIC'); // PUBLIC, FRIENDS, SUBSCRIBERS, CUSTOM
  const [isPaidContent, setIsPaidContent] = useState(false);
  const [priceCents, setPriceCents] = useState(500); // Default $5.00
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCommentsForPost, setShowCommentsForPost] = useState(null);
  const [commentsMap, setCommentsMap] = useState({});
  const [newCommentText, setNewCommentText] = useState('');
  const [features, setFeatures] = useState(featureDetector.getFeatures());

  // Get user's tier access
  const userEmail = localStorage.getItem('ownerEmail') || localStorage.getItem('userEmail');
  const access = checkTierAccess(userId, userTier, userEmail);

  // Subscribe to feature changes
  useEffect(() => {
    const unsubscribe = featureDetector.subscribe(setFeatures);
    featureDetector.checkFeatures();
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        setLoading(true);
        // Load posts from API
        const feedData = await api.posts.getFeed(50, 0);
        setPosts(feedData.posts || []);

        // Load relationships from API
        const [friendsData, followersData, subscriptionsData] = await Promise.all([
          api.relationships.getFriends().catch(() => ({ friends: [] })),
          api.relationships.getFollowers().catch(() => ({ followers: [] })),
          api.subscriptions.getMySubscriptions().catch(() => ({ subscriptions: [] }))
        ]);

        setFriends(friendsData.friends || []);
        setFollowers(followersData.followers || []);
        setSubscriptions(subscriptionsData.subscriptions || []);
        setError(null);
      } catch (err) {
        console.error('Failed to load feed:', err);
        setError('Failed to load feed. Please refresh.');

        // Fallback to localStorage
        const savedPosts = JSON.parse(localStorage.getItem('socialPosts') || '[]');
        setPosts(savedPosts);
        setFriends(JSON.parse(localStorage.getItem('userFriends') || '[]'));
        setFollowers(JSON.parse(localStorage.getItem('userFollowers') || '[]'));
        setSubscriptions(JSON.parse(localStorage.getItem('userSubscriptions') || '[]'));
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, []);

  const createPost = async () => {
    if (!newPostContent.trim()) return;

    try {
      setLoading(true);
      const newPost = await api.posts.create({
        body: newPostContent,
        visibility: contentVisibility,
        isPaid: isPaidContent,
        priceCents: isPaidContent ? priceCents : undefined,
        hasCGI: access.hasCGI.full && showCGITools,
      });

      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setError(null);
    } catch (err) {
      console.error('Failed to create post:', err);
      setError('Failed to create post. Please try again.');
      
      // Fallback to localStorage
      const newPost = {
        id: Date.now(),
        authorId: userId,
        author: {
          username: localStorage.getItem('currentUserName') || 'Anonymous',
          displayName: localStorage.getItem('displayName') || 'Anonymous',
          avatar: localStorage.getItem('userAvatar') || '👤',
        },
        body: newPostContent,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0,
        visibility: contentVisibility,
        isPaid: isPaidContent,
        hasCGI: false,
      };

      const updatedPosts = [newPost, ...posts];
      setPosts(updatedPosts);
      localStorage.setItem('socialPosts', JSON.stringify(updatedPosts));
      setNewPostContent('');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId) => {
    try {
      await api.relationships.follow(targetUserId);
      await loadStats(); // Refresh counters
    } catch (err) {
      console.error('Follow failed:', err);
    }
  };

  const handleAddFriend = async (targetUserId) => {
    try {
      await api.relationships.sendFriendRequest(targetUserId);
      alert('Friend request sent!');
    } catch (err) {
      console.error('Friend request failed:', err);
      alert(err.message || 'Failed to send friend request');
    }
  };

  const handleSubscribe = async (creatorId) => {
    try {
      setLoading(true);
      const { sessionUrl } = await api.subscriptions.createCheckout(creatorId, 'PREMIUM_1000', 100000);
      window.location.href = sessionUrl; // Redirect to Stripe
    } catch (err) {
      console.error('Subscription failed:', err);
      alert('Failed to start subscription. Please try again.');
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const result = await api.posts.like(postId);

      // Refetch the post to get accurate counts
      const updatedPost = await api.posts.getPost(postId);

      // Update local state with fresh data
      setPosts(posts.map(p =>
        p.id === postId ? { ...updatedPost, liked: result.liked } : p
      ));
    } catch (err) {
      console.error('Like failed:', err);
      setError('Failed to like post');
    }
  };

  const toggleComments = async (postId) => {
    if (showCommentsForPost === postId) {
      // Close comments
      setShowCommentsForPost(null);
    } else {
      // Open comments and load them
      setShowCommentsForPost(postId);
      if (!commentsMap[postId]) {
        try {
          const commentsData = await api.comments.getComments(postId, 50, 0);
          setCommentsMap({ ...commentsMap, [postId]: commentsData.comments || [] });
        } catch (err) {
          console.error('Failed to load comments:', err);
          setCommentsMap({ ...commentsMap, [postId]: [] });
        }
      }
    }
  };

  const handleAddComment = async (postId) => {
    if (!newCommentText.trim()) return;

    try {
      const comment = await api.comments.create(postId, newCommentText);

      // Add to comments map
      const currentComments = commentsMap[postId] || [];
      setCommentsMap({ ...commentsMap, [postId]: [comment, ...currentComments] });

      // Update post comments count
      setPosts(posts.map(p =>
        p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
      ));

      setNewCommentText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError('Failed to add comment');
    }
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
        <FeatureBlocker feature="socialMedia" features={features}>
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
              disabled={loading}
            />
            
            {/* Content Visibility Selector */}
            <div className="visibility-selector">
              <label>👁️ Who can see this:</label>
              <select value={contentVisibility} onChange={(e) => setContentVisibility(e.target.value)}>
                <option value="PUBLIC">🌍 Public (Everyone)</option>
                <option value="FRIENDS">👥 Friends Only</option>
                <option value="SUBSCRIBERS">💎 Subscribers Only</option>
                <option value="CUSTOM">⚙️ Custom List</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="post-creator-actions">
              <div className="post-options">
                <button className="post-option">📷 Photo</button>
                <button className="post-option">🎥 Video</button>
                {access.hasCGI.basic && (
                  <button 
                    className="post-option premium"
                    onClick={() => setShowCGITools(!showCGITools)}
                  >
                    ✨ CGI Effects
                  </button>
                )}
              </div>
              <button 
                className="post-btn" 
                onClick={() => {
                  // Show monetization dialog before posting
                  if (newPostContent.trim()) {
                    setShowMonetizeDialog(true);
                  } else {
                    createPost();
                  }
                }}
              >
                Post
              </button>
            </div>

            {/* Monetization Dialog - shown BEFORE posting */}
            {showMonetizeDialog && (
              <div className="monetize-dialog">
                <div className="monetize-dialog-content">
                  <h3>Ready to share?</h3>
                  <p>Choose how you want to share this post:</p>
                  
                  <label className="monetize-option">
                    <input
                      type="radio"
                      name="monetize"
                      checked={!isPaidContent}
                      onChange={() => setIsPaidContent(false)}
                    />
                    <div>
                      <strong>🌟 Post to Feed</strong>
                      <small>Share with your audience for free</small>
                    </div>
                  </label>

                  <label className="monetize-option">
                    <input
                      type="radio"
                      name="monetize"
                      checked={isPaidContent}
                      onChange={() => setIsPaidContent(true)}
                    />
                    <div>
                      <strong>💰 Monetized Content</strong>
                      <small>Charge subscribers to view (VIPs see for free)</small>
                    </div>
                  </label>

                  {isPaidContent && (
                    <div className="price-input">
                      <label>Set Price:</label>
                      <input
                        type="number"
                        value={priceCents / 100}
                        onChange={(e) => setPriceCents(Math.round(parseFloat(e.target.value) * 100))}
                        min="1"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  <div className="monetize-actions">
                    <button onClick={() => setShowMonetizeDialog(false)}>Cancel</button>
                    <button className="primary" onClick={() => { setShowMonetizeDialog(false); createPost(); }}>
                      {isPaidContent ? `Post for $${(priceCents / 100).toFixed(2)}` : 'Post Now'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showCGITools && access.hasCGI.basic && (
              <div className="cgi-tools-panel">
                <h4>🎨 CGI Tools</h4>
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
            {posts.map(post => {
              // Check if user can view this paid content
              const canViewPaidContent = !post.isPaidContent || 
                                        access.hasFreeContentAccess || 
                                        post.userId === userId ||
                                        subscriptions.some(sub => sub.creatorId === post.userId);
              
              return (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <span className="post-avatar">{post.avatar}</span>
                  <div className="post-meta">
                    <strong>{post.userName}</strong>
                    <span className="post-time">
                      {new Date(post.timestamp).toLocaleString()}
                    </span>
                    {post.visibility !== 'public' && (
                      <span className="visibility-badge">
                        {post.visibility === 'friends' && '👥 Friends'}
                        {post.visibility === 'subscribers' && '💎 Subscribers'}
                        {post.visibility === 'custom' && '⚙️ Custom'}
                      </span>
                    )}
                    {post.isPaidContent && (
                      <span className="paid-badge">
                        💰 ${(post.priceCents / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="post-actions-menu">
                    <button className="follow-btn" onClick={() => followUser(post.userId, post.userName)}>
                      ➕ Follow
                    </button>
                    <button className="friend-btn" onClick={() => addFriend(post.userId, post.userName)}>
                      👥 Add Friend
                    </button>
                    {post.isPaidContent && !canViewPaidContent && (
                      <button className="subscribe-btn" onClick={() => subscribeToUser(post.userId, post.userName)}>
                        💎 Subscribe for ${(post.priceCents / 100).toFixed(2)}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Show content if user has access, otherwise show lock */}
                {canViewPaidContent ? (
                  <div className="post-content">{post.content}</div>
                ) : (
                  <div className="post-content locked">
                    <div className="locked-overlay">
                      🔒 
                      <p>Subscribe to view this content</p>
                      <button onClick={() => subscribeToUser(post.userId, post.userName)}>
                        Subscribe for ${(post.priceCents / 100).toFixed(2)}
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="post-actions">
                  <button onClick={() => handleLike(post.id)}>
                    ❤️ {post.likesCount || 0}
                  </button>
                  <button onClick={() => toggleComments(post.id)}>
                    💬 {post.commentsCount || 0}
                  </button>
                  <button>🔁 Share</button>
                </div>

                {/* Comments Section */}
                {showCommentsForPost === post.id && (
                  <div className="comments-section">
                    <div className="add-comment">
                      <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button onClick={() => handleAddComment(post.id)}>Post</button>
                    </div>
                    <div className="comments-list">
                      {(commentsMap[post.id] || []).map(comment => (
                        <div key={comment.id} className="comment">
                          <strong>{comment.author?.username || 'Anonymous'}</strong>
                          <p>{comment.body}</p>
                          <span className="comment-time">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
        </FeatureBlocker>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <FeatureBlocker feature="socialMedia" features={features}>
        <div className="messages-content">
          <h2>💬 Messages</h2>
          <p className="feature-status">✅ Free for all users</p>
          
          {/* Friends & Followers Stats */}
          <div className="social-stats">
            <div className="stat-card">
              <h3>👥 Friends</h3>
              <p className="stat-number">{friends.length}</p>
            </div>
            <div className="stat-card">
              <h3>👁️ Followers</h3>
              <p className="stat-number">{followers.length}</p>
            </div>
            <div className="stat-card">
              <h3>💎 Subscriptions</h3>
              <p className="stat-number">{subscriptions.length}</p>
            </div>
          </div>

          <div className="messages-placeholder">
            <h3>Direct Messaging System</h3>
            <p>Text messaging available for all users</p>
            {access.hasCGI.full && (
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
        </FeatureBlocker>
      )}

      {/* Calls Tab */}
      {activeTab === 'calls' && (
        <div className="calls-content">
          <h2>📞 Voice & Video Calls</h2>
          <p className="feature-status">✅ Free for all users</p>
          <div className="calls-placeholder">
            <h3>Real-Time Communication</h3>
            <p>Voice and video calling for all users</p>
            {access.hasCGI.full && (
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
            {access.features.liveStreaming && (
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
      {!access.hasCGI.full && (
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
