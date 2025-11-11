import React, { useState } from 'react';
import './TradingCardDesigner.css';

export function TradingCardDesigner({ userId }) {
  const [cards, setCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const TEMPLATES = {
    'pokemon': {
      name: 'Pokémon Style',
      icon: '⚡',
      description: 'Classic TCG layout with HP, attacks, and weakness',
      elements: ['image', 'name', 'hp', 'type', 'attack1', 'attack2', 'weakness', 'rarity']
    },
    'yugioh': {
      name: 'Yu-Gi-Oh! Style',
      icon: '🃏',
      description: 'Monster/spell/trap cards with ATK/DEF',
      elements: ['image', 'name', 'level', 'attribute', 'type', 'description', 'atk', 'def']
    },
    'magic': {
      name: 'Magic Style',
      icon: '🔮',
      description: 'MTG-inspired with mana cost and abilities',
      elements: ['image', 'name', 'manaCost', 'type', 'abilities', 'power', 'toughness']
    },
    'sports': {
      name: 'Sports Card',
      icon: '⚾',
      description: 'Player stats and info',
      elements: ['photo', 'name', 'team', 'position', 'stats', 'rookie', 'autograph']
    },
    'character': {
      name: 'Character Card',
      icon: '👤',
      description: 'RPG/Anime character cards',
      elements: ['portrait', 'name', 'class', 'level', 'skills', 'backstory', 'stats']
    },
    'collectible': {
      name: 'Art Collectible',
      icon: '🎨',
      description: 'Pure art showcase cards',
      elements: ['artwork', 'title', 'artist', 'edition', 'rarity', 'serialNumber']
    }
  };

  const CARD_SIZES = {
    'standard': { name: 'Standard (2.5" x 3.5")', width: 250, height: 350 },
    'mini': { name: 'Mini (1.75" x 2.5")', width: 175, height: 250 },
    'jumbo': { name: 'Jumbo (5" x 7")', width: 500, height: 700 }
  };

  const FINISHES = [
    { value: 'matte', label: 'Matte', icon: '📄' },
    { value: 'glossy', label: 'Glossy', icon: '✨' },
    { value: 'foil', label: 'Foil', icon: '🌟', premium: true },
    { value: 'holographic', label: 'Holographic', icon: '🌈', premium: true },
    { value: 'textured', label: 'Textured', icon: '🎯', premium: true }
  ];

  const RARITY_TIERS = [
    { value: 'common', label: 'Common', color: '#6b7280' },
    { value: 'uncommon', label: 'Uncommon', color: '#10b981' },
    { value: 'rare', label: 'Rare', color: '#3b82f6' },
    { value: 'epic', label: 'Epic', color: '#8b5cf6' },
    { value: 'legendary', label: 'Legendary', color: '#f59e0b' },
    { value: 'mythic', label: 'Mythic', color: '#ec4899' }
  ];

  const createNewCard = (template) => {
    const newCard = {
      id: `card_${Date.now()}`,
      template,
      size: 'standard',
      finish: 'matte',
      rarity: 'common',
      frontDesign: {
        background: '#1a1a2e',
        image: null,
        elements: {}
      },
      backDesign: {
        background: '#8b5cf6',
        pattern: 'default',
        logo: null
      }
    };
    setCards([...cards, newCard]);
    setCurrentCard(newCard);
  };

  return (
    <div className="trading-card-designer">
      <div className="tcd-header">
        <h1>🎴 Trading Card Designer</h1>
        <p className="tcd-subtitle">
          Design custom trading cards with professional templates
        </p>
      </div>

      {!currentCard ? (
        <div className="template-selector">
          <h2>Choose a Template</h2>
          <div className="templates-grid">
            {Object.entries(TEMPLATES).map(([key, template]) => (
              <div 
                key={key} 
                className="template-card"
                onClick={() => {
                  setSelectedTemplate(key);
                  createNewCard(key);
                }}
              >
                <div className="template-icon">{template.icon}</div>
                <h3>{template.name}</h3>
                <p>{template.description}</p>
                <div className="template-elements">
                  {template.elements.slice(0, 4).map((el, idx) => (
                    <span key={idx} className="element-tag">{el}</span>
                  ))}
                  {template.elements.length > 4 && (
                    <span className="element-tag">+{template.elements.length - 4}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card-editor">
          <div className="editor-sidebar">
            <div className="sidebar-section">
              <h3>📐 Card Size</h3>
              <select 
                value={currentCard.size}
                onChange={(e) => setCurrentCard({...currentCard, size: e.target.value})}
              >
                {Object.entries(CARD_SIZES).map(([key, size]) => (
                  <option key={key} value={key}>{size.name}</option>
                ))}
              </select>
            </div>

            <div className="sidebar-section">
              <h3>✨ Finish</h3>
              <div className="finish-options">
                {FINISHES.map((finish) => (
                  <button
                    key={finish.value}
                    className={`finish-btn ${currentCard.finish === finish.value ? 'active' : ''} ${finish.premium ? 'premium' : ''}`}
                    onClick={() => setCurrentCard({...currentCard, finish: finish.value})}
                  >
                    <span className="finish-icon">{finish.icon}</span>
                    <span>{finish.label}</span>
                    {finish.premium && <span className="premium-badge">PRO</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>💎 Rarity</h3>
              <div className="rarity-options">
                {RARITY_TIERS.map((tier) => (
                  <button
                    key={tier.value}
                    className={`rarity-btn ${currentCard.rarity === tier.value ? 'active' : ''}`}
                    style={{
                      borderColor: currentCard.rarity === tier.value ? tier.color : 'transparent',
                      color: tier.color
                    }}
                    onClick={() => setCurrentCard({...currentCard, rarity: tier.value})}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>🎨 Design Elements</h3>
              <div className="element-controls">
                {TEMPLATES[currentCard.template].elements.map((element) => (
                  <div key={element} className="element-control">
                    <label>{element}</label>
                    <input 
                      type="text" 
                      placeholder={`Enter ${element}...`}
                      onChange={(e) => {
                        const newCard = {...currentCard};
                        newCard.frontDesign.elements[element] = e.target.value;
                        setCurrentCard(newCard);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h3>🖼️ Upload Artwork</h3>
              <div className="upload-area">
                <input type="file" accept="image/*" id="card-image" style={{display: 'none'}} />
                <label htmlFor="card-image" className="upload-btn">
                  ☁️ Upload Image
                </label>
                <p className="upload-hint">300 DPI recommended</p>
              </div>
            </div>

            <div className="sidebar-actions">
              <button className="btn-secondary" onClick={() => setCurrentCard(null)}>
                ← Back to Templates
              </button>
              <button className="btn-primary">
                💾 Save Card
              </button>
            </div>
          </div>

          <div className="card-preview-area">
            <div className="preview-tabs">
              <button className="preview-tab active">Front</button>
              <button className="preview-tab">Back</button>
            </div>
            
            <div 
              className="card-canvas"
              style={{
                width: CARD_SIZES[currentCard.size].width,
                height: CARD_SIZES[currentCard.size].height,
                background: currentCard.frontDesign.background,
                position: 'relative',
                border: `3px solid ${RARITY_TIERS.find(t => t.value === currentCard.rarity)?.color}`,
                boxShadow: currentCard.finish === 'holographic' 
                  ? '0 0 30px rgba(139, 92, 246, 0.6)' 
                  : '0 8px 24px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div className="card-template-overlay">
                <div className="card-name">{currentCard.frontDesign.elements.name || 'Card Name'}</div>
                <div className="card-image-slot">
                  {currentCard.frontDesign.image ? (
                    <img src={currentCard.frontDesign.image} alt="Card art" />
                  ) : (
                    <div className="image-placeholder">
                      <span>🖼️</span>
                      <span>Upload Image</span>
                    </div>
                  )}
                </div>
                <div className="card-details">
                  {Object.entries(currentCard.frontDesign.elements).map(([key, value]) => (
                    key !== 'name' && value && (
                      <div key={key} className="card-detail-item">
                        <strong>{key}:</strong> {value}
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>

            <div className="preview-info">
              <p><strong>Template:</strong> {TEMPLATES[currentCard.template].name}</p>
              <p><strong>Size:</strong> {CARD_SIZES[currentCard.size].name}</p>
              <p><strong>Finish:</strong> {FINISHES.find(f => f.value === currentCard.finish)?.label}</p>
              <p><strong>Rarity:</strong> {RARITY_TIERS.find(t => t.value === currentCard.rarity)?.label}</p>
            </div>
          </div>
        </div>
      )}

      {cards.length > 0 && (
        <div className="saved-cards">
          <h2>Your Cards ({cards.length})</h2>
          <div className="cards-grid">
            {cards.map((card) => (
              <div 
                key={card.id} 
                className="saved-card-thumb"
                onClick={() => setCurrentCard(card)}
              >
                <div className="thumb-preview" style={{borderColor: RARITY_TIERS.find(t => t.value === card.rarity)?.color}}>
                  {card.frontDesign.elements.name || 'Untitled Card'}
                </div>
                <span className="thumb-info">
                  {TEMPLATES[card.template].icon} {TEMPLATES[card.template].name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
