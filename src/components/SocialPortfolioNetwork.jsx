import React, { useState, useEffect } from 'react';
import './SocialPortfolioNetwork.css';

const SocialPortfolioNetwork = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [followingCount, setFollowingCount] = useState(234);
  const [followersCount, setFollowersCount] = useState(1847);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Mock trending projects
  const trendingProjects = [
    {
      id: 1,
      title: 'Cyberpunk City - VR Experience',
      creator: 'NeonDreamer',
      creatorAvatar: '👨‍🎨',
      thumbnail: '🌃',
      category: 'VR',
      likes: 12500,
      views: 45230,
      comments: 342,
      tool: 'VR/AR Studio',
      description: 'Immersive cyberpunk cityscape with neon lights and flying cars',
      tags: ['cyberpunk', 'vr', 'sci-fi', 'neon'],
      createdAt: '2 days ago',
      featured: true
    },
    {
      id: 2,
      title: 'Cinematic Color Grade Pack',
      creator: 'ColorMaster',
      creatorAvatar: '🎨',
      thumbnail: '🎬',
      category: 'Video',
      likes: 8920,
      views: 32104,
      comments: 156,
      tool: 'Video Editor Pro',
      description: '20 professional Hollywood-style color grades',
      tags: ['color-grading', 'cinematic', 'luts'],
      createdAt: '1 week ago',
      featured: true
    },
    {
      id: 3,
      title: 'Lo-Fi Beats Collection',
      creator: 'ChillVibes',
      creatorAvatar: '🎧',
      thumbnail: '🎵',
      category: 'Audio',
      likes: 15430,
      views: 67890,
      comments: 523,
      tool: 'Pro Audio Studio',
      description: '30 chill lo-fi beats perfect for studying and relaxing',
      tags: ['lo-fi', 'beats', 'chill', 'study-music'],
      createdAt: '3 days ago',
      featured: true
    },
    {
      id: 4,
      title: 'Modern Logo Design System',
      creator: 'BrandGenius',
      creatorAvatar: '💼',
      thumbnail: '🏷️',
      category: 'Design',
      likes: 6750,
      views: 23456,
      comments: 189,
      tool: 'Graphic Design Suite',
      description: 'Complete branding system with 50+ logo variations',
      tags: ['logo', 'branding', 'modern', 'minimal'],
      createdAt: '5 days ago',
      featured: false
    },
    {
      id: 5,
      title: 'Golden Hour Portrait Pack',
      creator: 'PhotoPro',
      creatorAvatar: '📸',
      thumbnail: '🌅',
      category: 'Photo',
      likes: 9870,
      views: 38765,
      comments: 287,
      tool: 'Photo Editor Pro',
      description: 'Stunning sunset portrait preset collection',
      tags: ['portrait', 'golden-hour', 'sunset', 'warm'],
      createdAt: '4 days ago',
      featured: false
    },
    {
      id: 6,
      title: 'Animated UI Components',
      creator: 'UIAnimator',
      creatorAvatar: '✨',
      thumbnail: '🎯',
      category: 'Design',
      likes: 11200,
      views: 42103,
      comments: 398,
      tool: 'Graphic Design Suite',
      description: '100+ smooth micro-interactions for web and mobile',
      tags: ['ui', 'animation', 'web-design', 'mobile'],
      createdAt: '1 week ago',
      featured: true
    }
  ];

  // Mock trending creators
  const trendingCreators = [
    {
      id: 1,
      username: 'NeonDreamer',
      avatar: '👨‍🎨',
      followers: 45230,
      projects: 127,
      speciality: 'VR Environments',
      verified: true,
      bio: 'Creating immersive VR experiences • Featured on Meta Quest Store',
      totalLikes: 234500,
      following: false
    },
    {
      id: 2,
      username: 'ColorMaster',
      avatar: '🎨',
      followers: 32104,
      projects: 89,
      speciality: 'Color Grading',
      verified: true,
      bio: 'Hollywood colorist • Work featured in Netflix originals',
      totalLikes: 189230,
      following: true
    },
    {
      id: 3,
      username: 'ChillVibes',
      avatar: '🎧',
      followers: 67890,
      projects: 203,
      speciality: 'Lo-Fi Music',
      verified: true,
      bio: '10M+ streams on Spotify • Creating chill beats daily',
      totalLikes: 456780,
      following: false
    },
    {
      id: 4,
      username: 'BrandGenius',
      avatar: '💼',
      followers: 23456,
      projects: 156,
      speciality: 'Brand Design',
      verified: false,
      bio: 'Helping startups build memorable brands • 500+ logos designed',
      totalLikes: 123450,
      following: false
    },
    {
      id: 5,
      username: 'PhotoPro',
      avatar: '📸',
      followers: 38765,
      projects: 342,
      speciality: 'Portrait Photography',
      verified: true,
      bio: 'Award-winning photographer • Published in Vogue & GQ',
      totalLikes: 287650,
      following: true
    }
  ];

  // User's portfolio stats
  const portfolioStats = {
    projects: 42,
    totalViews: 234567,
    totalLikes: 18945,
    followers: 1847,
    following: 234,
    featuredProjects: 5,
    totalComments: 3456
  };

  const handleLike = (projectId) => {
    alert(`❤️ Liked project #${projectId}!`);
  };

  const handleFollow = (creatorId) => {
    alert(`✅ Following creator #${creatorId}!`);
    setFollowingCount(followingCount + 1);
  };

  const handleShare = (project) => {
    const shareUrl = `https://fortheweebs.com/p/${project.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert(`🔗 Share link copied!\n\n${shareUrl}\n\nShare this project with your audience!`);
  };

  const handleEmbed = (project) => {
    const embedCode = `<iframe src="https://fortheweebs.com/embed/${project.id}" width="800" height="600" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    alert('✅ Embed code copied to clipboard!\n\nPaste this on your website.');
  };

  const openProjectDetails = (project) => {
    setSelectedProject(project);
  };

  const closeProjectDetails = () => {
    setSelectedProject(null);
  };

  const openProfileDetails = (creator) => {
    setSelectedProfile(creator);
  };

  const closeProfileDetails = () => {
    setSelectedProfile(null);
  };

  return (
    <div className="social-portfolio-network">
      <div className="social-header">
        <div className="header-content">
          <h1>🌐 Social Portfolio Network</h1>
          <p className="header-subtitle">Share your work, follow creators, get discovered</p>
          <div className="header-stats">
            <div className="header-stat">
              <span className="stat-value">{portfolioStats.followers.toLocaleString()}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="header-stat">
              <span className="stat-value">{portfolioStats.following.toLocaleString()}</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="header-stat">
              <span className="stat-value">{portfolioStats.totalLikes.toLocaleString()}</span>
              <span className="stat-label">Total Likes</span>
            </div>
          </div>
        </div>
        
        <div className="profile-preview">
          <div className="profile-avatar-large">👤</div>
          <span className="profile-username">You</span>
          <button className="btn-view-portfolio">View My Portfolio</button>
        </div>
      </div>

      <div className="social-tabs">
        <button 
          className={`tab ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          Discover
        </button>
        <button 
          className={`tab ${activeTab === 'trending' ? 'active' : ''}`}
          onClick={() => setActiveTab('trending')}
        >
          Trending
        </button>
        <button 
          className={`tab ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          Following
        </button>
        <button 
          className={`tab ${activeTab === 'creators' ? 'active' : ''}`}
          onClick={() => setActiveTab('creators')}
        >
          Top Creators
        </button>
        <button 
          className={`tab ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          My Portfolio
        </button>
      </div>

      {(activeTab === 'discover' || activeTab === 'trending') && (
        <div className="projects-view">
          <div className="projects-header">
            <h2>🔥 {activeTab === 'discover' ? 'Discover Projects' : 'Trending This Week'}</h2>
            <div className="filter-controls">
              <select className="filter-select">
                <option>All Categories</option>
                <option>Video</option>
                <option>Photo</option>
                <option>Audio</option>
                <option>Design</option>
                <option>VR</option>
              </select>
              <select className="filter-select">
                <option>This Week</option>
                <option>This Month</option>
                <option>All Time</option>
              </select>
            </div>
          </div>

          <div className="projects-grid">
            {trendingProjects.map(project => (
              <div 
                key={project.id} 
                className={`project-card ${project.featured ? 'featured' : ''}`}
                onClick={() => openProjectDetails(project)}
              >
                {project.featured && <div className="featured-badge">⭐ Featured</div>}
                <div className="project-thumbnail">{project.thumbnail}</div>
                <div className="project-info">
                  <h3 className="project-title">{project.title}</h3>
                  <div className="project-creator">
                    <span className="creator-avatar">{project.creatorAvatar}</span>
                    <span className="creator-name">{project.creator}</span>
                  </div>
                  <p className="project-description">{project.description}</p>
                  <div className="project-tags">
                    {project.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="project-stats">
                    <span className="stat-item">❤️ {project.likes.toLocaleString()}</span>
                    <span className="stat-item">👁️ {project.views.toLocaleString()}</span>
                    <span className="stat-item">💬 {project.comments}</span>
                  </div>
                  <div className="project-meta">
                    <span className="tool-badge">{project.tool}</span>
                    <span className="time-badge">{project.createdAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'following' && (
        <div className="following-view">
          <div className="following-header">
            <h2>📡 Following Feed</h2>
            <span className="following-count">Following {followingCount} creators</span>
          </div>

          <div className="feed-container">
            <div className="feed-item">
              <div className="feed-avatar">🎧</div>
              <div className="feed-content">
                <div className="feed-meta">
                  <strong>ChillVibes</strong> posted a new project
                  <span className="feed-time">2 hours ago</span>
                </div>
                <div className="feed-project-preview">
                  <div className="feed-thumbnail">🎵</div>
                  <div className="feed-project-info">
                    <h4>Midnight Dreams - Lo-Fi Mix</h4>
                    <p>45-minute chill mix perfect for late night coding sessions</p>
                    <div className="feed-stats">
                      <span>❤️ 2.4K</span>
                      <span>👁️ 8.7K</span>
                      <span>💬 67</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="feed-item">
              <div className="feed-avatar">🎨</div>
              <div className="feed-content">
                <div className="feed-meta">
                  <strong>ColorMaster</strong> liked a project
                  <span className="feed-time">5 hours ago</span>
                </div>
                <p className="feed-text">Incredible color work on this cinematic piece! 🎬</p>
              </div>
            </div>

            <div className="feed-item">
              <div className="feed-avatar">📸</div>
              <div className="feed-content">
                <div className="feed-meta">
                  <strong>PhotoPro</strong> started following you
                  <span className="feed-time">1 day ago</span>
                </div>
                <button className="btn-follow-back">Follow Back</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'creators' && (
        <div className="creators-view">
          <div className="creators-header">
            <h2>👑 Top Creators</h2>
            <span className="creators-count">{trendingCreators.length} featured creators</span>
          </div>

          <div className="creators-grid">
            {trendingCreators.map(creator => (
              <div 
                key={creator.id} 
                className="creator-card"
                onClick={() => openProfileDetails(creator)}
              >
                <div className="creator-card-header">
                  <div className="creator-avatar-large">{creator.avatar}</div>
                  {creator.verified && <div className="verified-badge">✓</div>}
                </div>
                <h3 className="creator-username">{creator.username}</h3>
                <p className="creator-speciality">{creator.speciality}</p>
                <p className="creator-bio">{creator.bio}</p>
                <div className="creator-stats-grid">
                  <div className="creator-stat">
                    <span className="stat-value">{creator.followers.toLocaleString()}</span>
                    <span className="stat-label">Followers</span>
                  </div>
                  <div className="creator-stat">
                    <span className="stat-value">{creator.projects}</span>
                    <span className="stat-label">Projects</span>
                  </div>
                  <div className="creator-stat">
                    <span className="stat-value">{(creator.totalLikes / 1000).toFixed(0)}K</span>
                    <span className="stat-label">Likes</span>
                  </div>
                </div>
                <button 
                  className={`btn-follow ${creator.following ? 'following' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollow(creator.id);
                  }}
                >
                  {creator.following ? '✓ Following' : '+ Follow'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="portfolio-view">
          <div className="portfolio-banner">
            <h2>🎨 My Portfolio</h2>
            <p>Share your work with the world • Get discovered • Build your audience</p>
          </div>

          <div className="portfolio-stats-grid">
            <div className="portfolio-stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <span className="stat-value-large">{portfolioStats.projects}</span>
                <span className="stat-label-large">Projects</span>
              </div>
            </div>
            <div className="portfolio-stat-card">
              <div className="stat-icon">👁️</div>
              <div className="stat-content">
                <span className="stat-value-large">{(portfolioStats.totalViews / 1000).toFixed(0)}K</span>
                <span className="stat-label-large">Total Views</span>
              </div>
            </div>
            <div className="portfolio-stat-card">
              <div className="stat-icon">❤️</div>
              <div className="stat-content">
                <span className="stat-value-large">{(portfolioStats.totalLikes / 1000).toFixed(1)}K</span>
                <span className="stat-label-large">Total Likes</span>
              </div>
            </div>
            <div className="portfolio-stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-content">
                <span className="stat-value-large">{(portfolioStats.totalComments / 1000).toFixed(1)}K</span>
                <span className="stat-label-large">Comments</span>
              </div>
            </div>
          </div>

          <div className="portfolio-actions">
            <h3>🚀 Share Your Portfolio</h3>
            <div className="share-options">
              <div className="share-option">
                <span className="share-icon">🔗</span>
                <div className="share-info">
                  <h4>Portfolio Link</h4>
                  <code>fortheweebs.com/@yourusername</code>
                  <button className="btn-copy-share">Copy Link</button>
                </div>
              </div>
              <div className="share-option">
                <span className="share-icon">📱</span>
                <div className="share-info">
                  <h4>Social Media</h4>
                  <p>Share on Twitter, Instagram, LinkedIn</p>
                  <button className="btn-share-social">Share Now</button>
                </div>
              </div>
              <div className="share-option">
                <span className="share-icon">💼</span>
                <div className="share-info">
                  <h4>Embed Portfolio</h4>
                  <p>Add your portfolio to your website</p>
                  <button className="btn-get-embed">Get Embed Code</button>
                </div>
              </div>
            </div>
          </div>

          <div className="portfolio-settings">
            <h3>⚙️ Portfolio Settings</h3>
            <div className="settings-options">
              <label className="setting-option">
                <input type="checkbox" defaultChecked />
                <span>Show portfolio on profile</span>
              </label>
              <label className="setting-option">
                <input type="checkbox" defaultChecked />
                <span>Allow project downloads</span>
              </label>
              <label className="setting-option">
                <input type="checkbox" defaultChecked />
                <span>Enable comments on projects</span>
              </label>
              <label className="setting-option">
                <input type="checkbox" />
                <span>Require approval for comments</span>
              </label>
              <label className="setting-option">
                <input type="checkbox" defaultChecked />
                <span>Show "Made with ForTheWeebs" watermark</span>
              </label>
              <label className="setting-option">
                <input type="checkbox" defaultChecked />
                <span>Allow project embeds on external sites</span>
              </label>
            </div>
          </div>

          <div className="viral-growth">
            <h3>📈 Viral Growth Features</h3>
            <div className="growth-features-grid">
              <div className="growth-feature">
                <span className="growth-icon">🔗</span>
                <h4>Shareable Links</h4>
                <p>Every project gets a beautiful share link that previews on social media</p>
              </div>
              <div className="growth-feature">
                <span className="growth-icon">🏆</span>
                <h4>Featured Section</h4>
                <p>Best projects get featured on ForTheWeebs homepage (10M+ visitors/month)</p>
              </div>
              <div className="growth-feature">
                <span className="growth-icon">💎</span>
                <h4>Made with Badge</h4>
                <p>"Made with ForTheWeebs" badge drives traffic back to your portfolio</p>
              </div>
              <div className="growth-feature">
                <span className="growth-icon">🎯</span>
                <h4>Discover Algorithm</h4>
                <p>AI recommends your work to people interested in your style</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedProject && (
        <div className="project-modal" onClick={closeProjectDetails}>
          <div className="project-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeProjectDetails}>×</button>
            
            <div className="modal-project-header">
              <div className="modal-thumbnail-large">{selectedProject.thumbnail}</div>
              <div className="modal-project-info">
                <h2>{selectedProject.title}</h2>
                <div className="modal-creator-info">
                  <span className="modal-creator-avatar">{selectedProject.creatorAvatar}</span>
                  <span className="modal-creator-name">{selectedProject.creator}</span>
                  <button className="btn-follow-small">+ Follow</button>
                </div>
                <p className="modal-description">{selectedProject.description}</p>
                <div className="modal-tags">
                  {selectedProject.tags.map(tag => (
                    <span key={tag} className="tag-large">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-stats-bar">
              <div className="modal-stat">
                <span className="modal-stat-icon">❤️</span>
                <span className="modal-stat-value">{selectedProject.likes.toLocaleString()}</span>
                <span className="modal-stat-label">Likes</span>
              </div>
              <div className="modal-stat">
                <span className="modal-stat-icon">👁️</span>
                <span className="modal-stat-value">{selectedProject.views.toLocaleString()}</span>
                <span className="modal-stat-label">Views</span>
              </div>
              <div className="modal-stat">
                <span className="modal-stat-icon">💬</span>
                <span className="modal-stat-value">{selectedProject.comments}</span>
                <span className="modal-stat-label">Comments</span>
              </div>
            </div>

            <div className="modal-actions-bar">
              <button 
                className="btn-action-large"
                onClick={() => handleLike(selectedProject.id)}
              >
                ❤️ Like
              </button>
              <button 
                className="btn-action-large"
                onClick={() => handleShare(selectedProject)}
              >
                🔗 Share
              </button>
              <button 
                className="btn-action-large"
                onClick={() => handleEmbed(selectedProject)}
              >
                📎 Embed
              </button>
              <button className="btn-action-large">
                💾 Save
              </button>
            </div>

            <div className="modal-details">
              <h3>Project Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Tool</span>
                  <span className="detail-value">{selectedProject.tool}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Category</span>
                  <span className="detail-value">{selectedProject.category}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created</span>
                  <span className="detail-value">{selectedProject.createdAt}</span>
                </div>
              </div>
            </div>

            <div className="modal-comments">
              <h3>💬 Comments ({selectedProject.comments})</h3>
              <div className="comment-input-section">
                <input 
                  type="text" 
                  className="comment-input" 
                  placeholder="Add a comment..."
                />
                <button className="btn-post-comment">Post</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedProfile && (
        <div className="profile-modal" onClick={closeProfileDetails}>
          <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeProfileDetails}>×</button>
            
            <div className="profile-modal-header">
              <div className="profile-modal-avatar">{selectedProfile.avatar}</div>
              <div className="profile-modal-info">
                <div className="profile-username-section">
                  <h2>{selectedProfile.username}</h2>
                  {selectedProfile.verified && <span className="verified-badge-large">✓ Verified</span>}
                </div>
                <p className="profile-speciality-large">{selectedProfile.speciality}</p>
                <p className="profile-bio-large">{selectedProfile.bio}</p>
                <button 
                  className={`btn-follow-large ${selectedProfile.following ? 'following' : ''}`}
                  onClick={() => handleFollow(selectedProfile.id)}
                >
                  {selectedProfile.following ? '✓ Following' : '+ Follow'}
                </button>
              </div>
            </div>

            <div className="profile-stats-bar">
              <div className="profile-stat">
                <span className="profile-stat-value">{selectedProfile.followers.toLocaleString()}</span>
                <span className="profile-stat-label">Followers</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{selectedProfile.projects}</span>
                <span className="profile-stat-label">Projects</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{(selectedProfile.totalLikes / 1000).toFixed(0)}K</span>
                <span className="profile-stat-label">Total Likes</span>
              </div>
            </div>

            <div className="profile-projects-section">
              <h3>📂 Projects</h3>
              <div className="profile-projects-grid">
                {trendingProjects.slice(0, 3).map(project => (
                  <div key={project.id} className="mini-project-card">
                    <div className="mini-thumbnail">{project.thumbnail}</div>
                    <h4>{project.title}</h4>
                    <div className="mini-stats">
                      <span>❤️ {(project.likes / 1000).toFixed(1)}K</span>
                      <span>👁️ {(project.views / 1000).toFixed(1)}K</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialPortfolioNetwork;
