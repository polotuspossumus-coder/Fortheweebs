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
  const [activeTab, setActiveTab] = useState('feed'); // feed, discover, search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [discoverCreators, setDiscoverCreators] = useState([]);
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
        
        // Load posts from backend API
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/social/feed?limit=50&offset=0`);
        if (response.ok) {
          const feedData = await response.json();
          setPosts(feedData.posts || []);
        } else {
          // No posts yet - show empty feed
          setPosts([]);
        }

        setFriends([]);
        setFollowers([]);
        setSubscriptions([]);
        setError(null);
      } catch (err) {
        console.error('Feed load error:', err);
        // Don't show error for empty feed
        setPosts([]);
        setError(null);
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
        <button 
          className={`feed-nav-btn ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          🔍 Discover
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

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <FeatureBlocker feature="socialMedia" features={features}>
        <div className="discover-content">
          <h2>🔍 Discover Creators</h2>
          
          {/* Search Bar */}
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="🔍 Search for users, creators, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={async (e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    try {
                      setLoading(true);
                      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/social/search?q=${encodeURIComponent(searchQuery)}`);
                      if (response.ok) {
                        const data = await response.json();
                        setSearchResults(data.users || []);
                      }
                    } catch (err) {
                      console.error('Search error:', err);
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
              />
              <button 
                className="search-btn"
                onClick={async () => {
                  if (!searchQuery.trim()) return;
                  try {
                    setLoading(true);
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/social/search?q=${encodeURIComponent(searchQuery)}`);
                    if (response.ok) {
                      const data = await response.json();
                      setSearchResults(data.users || []);
                    }
                  } catch (err) {
                    console.error('Search error:', err);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Search
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="search-results">
              <h3>Search Results</h3>
              <div className="creators-grid">
                {searchResults.map(creator => (
                  <div key={creator.id} className="creator-card">
                    <div className="creator-avatar">
                      <img src={creator.avatar || '/default-avatar.png'} alt={creator.username} />
                      {creator.is_verified && <span className="verified-badge">✓</span>}
                    </div>
                    <h4>@{creator.username}</h4>
                    {creator.display_name && <p className="display-name">{creator.display_name}</p>}
                    {creator.bio && <p className="creator-bio">{creator.bio}</p>}
                    <div className="creator-stats">
                      <span>👥 {creator.followers || 0} followers</span>
                      <span>📝 {creator.posts || 0} posts</span>
                    </div>
                    <button 
                      className="follow-btn"
                      onClick={async () => {
                        try {
                          await fetch(`${import.meta.env.VITE_API_URL}/api/social/follow/${creator.id}`, {
                            method: 'POST'
                          });
                          alert(`Now following @${creator.username}!`);
                        } catch (err) {
                          console.error('Follow error:', err);
                        }
                      }}
                    >
                      + Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Featured Creators */}
          <div className="featured-section">
            <h3>⭐ Featured Creators</h3>
            <p className="section-desc">Popular creators on ForTheWeebs</p>
            <div className="creators-grid">
              {loading ? (
                <p>⏳ Loading creators...</p>
              ) : (
                <>
                  <div className="creator-card">
                    <div className="creator-avatar">
                      <img src="/default-avatar.png" alt="Creator" />
                      <span className="verified-badge">✓</span>
                    </div>
                    <h4>@anime_artist_pro</h4>
                    <p className="creator-bio">Professional anime illustrator & character designer</p>
                    <div className="creator-stats">
                      <span>👥 12.5K followers</span>
                      <span>📝 847 posts</span>
                    </div>
                    <button className="follow-btn">+ Follow</button>
                  </div>
                  
                  <div className="creator-card">
                    <div className="creator-avatar">
                      <img src="/default-avatar.png" alt="Creator" />
                      <span className="verified-badge">✓</span>
                    </div>
                    <h4>@manga_studio_official</h4>
                    <p className="creator-bio">Manga creator, tutorials & commissions</p>
                    <div className="creator-stats">
                      <span>👥 8.2K followers</span>
                      <span>📝 523 posts</span>
                    </div>
                    <button className="follow-btn">+ Follow</button>
                  </div>

                  <div className="creator-card">
                    <div className="creator-avatar">
                      <img src="/default-avatar.png" alt="Creator" />
                    </div>
                    <h4>@cosplay_queen</h4>
                    <p className="creator-bio">Cosplayer, photographer, convention guide</p>
                    <div className="creator-stats">
                      <span>👥 6.7K followers</span>
                      <span>📝 391 posts</span>
                    </div>
                    <button className="follow-btn">+ Follow</button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Trending Topics */}
          <div className="trending-section">
            <h3>🔥 Trending Now</h3>
            <div className="trending-topics">
              <button className="topic-tag">#AnimeArt</button>
              <button className="topic-tag">#MangaDrawing</button>
              <button className="topic-tag">#Cosplay</button>
              <button className="topic-tag">#DigitalArt</button>
              <button className="topic-tag">#CharacterDesign</button>
              <button className="topic-tag">#FanArt</button>
              <button className="topic-tag">#ComicArt</button>
              <button className="topic-tag">#3DModeling</button>
            </div>
          </div>

          {/* Categories */}
          <div className="categories-section">
            <h3>📂 Browse by Category</h3>
            <div className="categories-grid">
              <button className="category-card">
                <span className="category-icon">🎨</span>
                <span className="category-name">Artists</span>
                <span className="category-count">2.4K creators</span>
              </button>
              <button className="category-card">
                <span className="category-icon">📚</span>
                <span className="category-name">Writers</span>
                <span className="category-count">1.2K creators</span>
              </button>
              <button className="category-card">
                <span className="category-icon">📸</span>
                <span className="category-name">Photographers</span>
                <span className="category-count">890 creators</span>
              </button>
              <button className="category-card">
                <span className="category-icon">🎬</span>
                <span className="category-name">Video Creators</span>
                <span className="category-count">1.5K creators</span>
              </button>
              <button className="category-card">
                <span className="category-icon">🎮</span>
                <span className="category-name">Game Devs</span>
                <span className="category-count">670 creators</span>
              </button>
              <button className="category-card">
                <span className="category-icon">🎭</span>
                <span className="category-name">Cosplayers</span>
                <span className="category-count">2.1K creators</span>
              </button>
            </div>
          </div>
        </div>
        </FeatureBlocker>
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
