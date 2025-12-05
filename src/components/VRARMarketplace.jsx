import React, { useState, useEffect } from 'react';

// STATE-OF-THE-ART VR/AR MARKETPLACE
export function VRARMarketplace({ userId }) {
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [items, setItems] = useState([]);

  const categories = [
    { id: 'all', name: 'All Content', icon: '🌐' },
    { id: 'vr-experiences', name: 'VR Experiences', icon: '🥽' },
    { id: 'ar-filters', name: 'AR Filters', icon: '👓' },
    { id: '3d-models', name: '3D Models', icon: '🎭' },
    { id: 'environments', name: 'Environments', icon: '🏞️' },
    { id: 'games', name: 'VR Games', icon: '🎮' },
    { id: 'education', name: 'Educational', icon: '📚' },
    { id: 'social', name: 'Social Spaces', icon: '👥' },
  ];

  return (
    <div style={{ padding: '40px', background: '#0a0a0a', minHeight: '100vh', color: 'white' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '60px 40px',
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '48px', margin: '0 0 20px 0' }}>
          🌟 VR/AR Marketplace
        </h1>
        <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '30px' }}>
          Discover amazing experiences created by the community
        </p>

        {/* Search Bar */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="Search for VR/AR content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '18px 50px 18px 20px',
              borderRadius: '30px',
              border: 'none',
              fontSize: '16px',
              background: 'rgba(255,255,255,0.9)'
            }}
          />
          <span style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '24px'
          }}>
            🔍
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        marginBottom: '30px',
        paddingBottom: '10px'
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            style={{
              background: category === cat.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '20px' }}>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort & Filter */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div style={{ fontSize: '18px', opacity: 0.8' }}>
          Showing <strong>1,247</strong> items
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="popular">Most Popular</option>
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Marketplace Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '25px',
        marginBottom: '40px'
      }}>
        {SAMPLE_ITEMS.map(item => (
          <MarketplaceItem key={item.id} item={item} />
        ))}
      </div>

      {/* Featured Creators */}
      <FeaturedCreators />

      {/* Trending Collections */}
      <TrendingCollections />
    </div>
  );
}

function MarketplaceItem({ item }) {
  const [liked, setLiked] = useState(false);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '15px',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      {/* Thumbnail */}
      <div style={{
        width: '100%',
        height: '200px',
        background: `linear-gradient(135deg, ${item.color1}, ${item.color2})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '64px',
        position: 'relative'
      }}>
        {item.icon}

        {/* Badge */}
        {item.badge && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: item.badgeColor || 'white',
            padding: '5px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {item.badge}
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(0,0,0,0.8)',
            border: 'none',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '20px'
          }}
        >
          {liked ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{item.title}</h3>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          fontSize: '14px',
          opacity: 0.8
        }}>
          <img
            src={item.creatorAvatar || '/default-avatar.png'}
            alt={item.creator}
            style={{ width: '24px', height: '24px', borderRadius: '50%' }}
          />
          <span>by {item.creator}</span>
        </div>

        <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '15px', lineHeight: '1.5' }}>
          {item.description}
        </p>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '15px',
          fontSize: '13px',
          opacity: 0.8
        }}>
          <span>⭐ {item.rating}</span>
          <span>👁️ {item.views}</span>
          <span>💬 {item.reviews}</span>
        </div>

        {/* Price & Action */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
            {item.price === 0 ? 'FREE' : `$${item.price}`}
          </div>

          <button style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {item.price === 0 ? 'Try Now' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FeaturedCreators() {
  const creators = [
    { name: 'VRMaster', avatar: '👨‍🎨', followers: '125K', verified: true },
    { name: 'ARQueen', avatar: '👩‍💻', followers: '98K', verified: true },
    { name: '3DWizard', avatar: '🧙', followers: '87K', verified: true },
    { name: 'MetaCreator', avatar: '🎭', followers: '76K', verified: false },
  ];

  return (
    <div style={{ marginTop: '60px', marginBottom: '40px' }}>
      <h2 style={{ fontSize: '32px', marginBottom: '30px' }}>✨ Featured Creators</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        {creators.map(creator => (
          <div key={creator.name} style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '15px',
            padding: '25px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '15px' }}>
              {creator.avatar}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>{creator.name}</h3>
              {creator.verified && <span style={{ fontSize: '16px' }}>✓</span>}
            </div>

            <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '20px' }}>
              {creator.followers} followers
            </div>

            <button style={{
              width: '100%',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '10px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendingCollections() {
  return (
    <div style={{ marginTop: '60px' }}>
      <h2 style={{ fontSize: '32px', marginBottom: '30px' }}>🔥 Trending Collections</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '25px'
      }}>
        {SAMPLE_COLLECTIONS.map(collection => (
          <div key={collection.id} style={{
            background: `linear-gradient(135deg, ${collection.color1}, ${collection.color2})`,
            borderRadius: '20px',
            padding: '30px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>
              {collection.icon}
            </div>

            <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>
              {collection.title}
            </h3>

            <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '20px' }}>
              {collection.description}
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{collection.itemCount} items</span>
              <button style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '15px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                Explore →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sample Data
const SAMPLE_ITEMS = [
  {
    id: 1,
    title: 'Cyberpunk City VR',
    creator: 'VRMaster',
    description: 'Explore a futuristic neon-lit cityscape in stunning detail',
    price: 29.99,
    rating: 4.8,
    views: '125K',
    reviews: '2.3K',
    icon: '🏙️',
    color1: '#667eea',
    color2: '#764ba2',
    badge: 'TRENDING',
    badgeColor: '#ff6b6b'
  },
  {
    id: 2,
    title: 'AR Face Filters Pack',
    creator: 'ARQueen',
    description: '50+ professional AR filters for social media',
    price: 0,
    rating: 4.9,
    views: '89K',
    reviews: '1.8K',
    icon: '😎',
    color1: '#f093fb',
    color2: '#f5576c',
    badge: 'FREE',
    badgeColor: '#4CAF50'
  },
  {
    id: 3,
    title: 'Medieval Castle 3D',
    creator: '3DWizard',
    description: 'Highly detailed medieval castle environment',
    price: 49.99,
    rating: 5.0,
    views: '67K',
    reviews: '987',
    icon: '🏰',
    color1: '#4facfe',
    color2: '#00f2fe',
    badge: 'NEW',
    badgeColor: '#2196F3'
  },
  {
    id: 4,
    title: 'VR Meditation Space',
    creator: 'ZenCreator',
    description: 'Peaceful VR environments for meditation',
    price: 14.99,
    rating: 4.7,
    views: '54K',
    reviews: '765',
    icon: '🧘',
    color1: '#a18cd1',
    color2: '#fbc2eb'
  },
  {
    id: 5,
    title: 'Space Station Tour',
    creator: 'AstroVR',
    description: 'Educational VR tour of the ISS',
    price: 0,
    rating: 4.6,
    views: '43K',
    reviews: '654',
    icon: '🚀',
    color1: '#fa709a',
    color2: '#fee140',
    badge: 'FEATURED',
    badgeColor: '#FF9800'
  },
  {
    id: 6,
    title: 'Horror Escape Room',
    creator: 'ScareVR',
    description: 'Terrifying VR escape room experience',
    price: 19.99,
    rating: 4.9,
    views: '98K',
    reviews: '2.1K',
    icon: '👻',
    color1: '#434343',
    color2: '#000000',
    badge: 'HOT',
    badgeColor: '#f44336'
  }
];

const SAMPLE_COLLECTIONS = [
  {
    id: 1,
    title: 'Best of VR Gaming',
    description: 'Top VR games from indie developers',
    itemCount: 45,
    icon: '🎮',
    color1: '#667eea',
    color2: '#764ba2'
  },
  {
    id: 2,
    title: 'AR Education Pack',
    description: 'Learn through augmented reality',
    itemCount: 32,
    icon: '📚',
    color1: '#f093fb',
    color2: '#f5576c'
  },
  {
    id: 3,
    title: 'Social VR Worlds',
    description: 'Meet and hang out with friends',
    itemCount: 28,
    icon: '👥',
    color1: '#4facfe',
    color2: '#00f2fe'
  }
];
