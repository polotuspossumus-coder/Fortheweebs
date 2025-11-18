import React, { useState } from 'react';
import {
  GrayscaleEffect,
  BrightnessEffect,
  ColorFilterEffect,
  NeonGlowEffect,
  VintageEffect,
  PixelateEffect
} from '../effects/CGIEffect';
import {
  BackgroundBlurEffect,
  VignetteEffect
} from '../effects/BackgroundEffects';
import {
  TextOverlayEffect,
  LowerThirdEffect,
  EmojiReactionEffect
} from '../effects/TextOverlayEffect';
import {
  FloatingCubeEffect,
  ParticleExplosionEffect,
  GlowingRingEffect,
  FloatingHeartsEffect,
  SpinningStarsEffect
} from '../effects/ThreeDEffects';

export default function CGIControls({ videoProcessorRef }) {
  const [activeEffects, setActiveEffects] = useState([]);
  const [selectedEffect, setSelectedEffect] = useState(null);

  const availableEffects = [
    // Basic Effects
    {
      id: 'grayscale',
      name: 'Grayscale',
      icon: '⚫',
      description: 'Black and white filter',
      category: 'basic',
      create: () => new GrayscaleEffect({ intensity: 0.8 })
    },
    {
      id: 'brightness',
      name: 'Brightness',
      icon: '☀️',
      description: 'Adjust brightness and contrast',
      category: 'basic',
      create: () => new BrightnessEffect({ params: { brightness: 30, contrast: 0.2 } })
    },
    {
      id: 'colorfilter',
      name: 'Color Tint',
      icon: '🎨',
      description: 'Apply color filters',
      category: 'basic',
      create: () => new ColorFilterEffect({ params: { r: 1.2, g: 0.8, b: 1.0 } })
    },
    {
      id: 'neonglow',
      name: 'Neon Glow',
      icon: '✨',
      description: 'Cyberpunk neon effect',
      category: 'basic',
      create: () => new NeonGlowEffect({ intensity: 0.7 })
    },
    {
      id: 'vintage',
      name: 'Vintage',
      icon: '📷',
      description: 'Retro film look',
      category: 'basic',
      create: () => new VintageEffect({ intensity: 0.8 })
    },
    {
      id: 'pixelate',
      name: 'Pixelate',
      icon: '🎮',
      description: '8-bit retro effect',
      category: 'basic',
      create: () => new PixelateEffect({ params: { pixelSize: 8 }, intensity: 1.0 })
    },
    // Background Effects
    {
      id: 'backgroundblur',
      name: 'Blur Background',
      icon: '🌫️',
      description: 'Professional blur effect',
      category: 'background',
      create: () => new BackgroundBlurEffect({ params: { blurAmount: 15 } })
    },
    {
      id: 'vignette',
      name: 'Vignette',
      icon: '⭕',
      description: 'Darken edges',
      category: 'background',
      create: () => new VignetteEffect({ params: { strength: 0.5 } })
    },
    // Text Effects
    {
      id: 'textoverlay',
      name: 'Text Overlay',
      icon: '💬',
      description: 'Animated text',
      category: 'text',
      create: () => new TextOverlayEffect({ params: { text: 'ForTheWeebs', animation: 'fade' } })
    },
    {
      id: 'lowerthird',
      name: 'Lower Third',
      icon: '📛',
      description: 'Name badge for streams',
      category: 'text',
      create: () => new LowerThirdEffect({ params: { name: 'Super Admin', title: 'Premium User' } })
    },
    {
      id: 'emojireaction',
      name: 'Emoji Rain',
      icon: '❤️',
      description: 'Floating emoji effects',
      category: 'text',
      create: () => {
        const effect = new EmojiReactionEffect();
        // Trigger initial emoji
        setTimeout(() => effect.trigger('❤️'), 100);
        return effect;
      }
    },
    // 3D Effects
    {
      id: 'floatingcube',
      name: 'Floating Cube',
      icon: '🎲',
      description: '3D rotating cube',
      category: '3d',
      create: () => new FloatingCubeEffect()
    },
    {
      id: 'glowingring',
      name: 'Glowing Ring',
      icon: '💫',
      description: 'Pulsing energy ring',
      category: '3d',
      create: () => new GlowingRingEffect()
    },
    {
      id: 'floatinghearts',
      name: 'Floating Hearts',
      icon: '💕',
      description: 'Rising heart particles',
      category: '3d',
      create: () => new FloatingHeartsEffect()
    },
    {
      id: 'spinningstars',
      name: 'Spinning Stars',
      icon: '⭐',
      description: 'Orbiting stars',
      category: '3d',
      create: () => new SpinningStarsEffect()
    }
  ];

  const addEffect = (effectDef) => {
    const effect = effectDef.create();

    if (videoProcessorRef?.current?.addEffect) {
      videoProcessorRef.current.addEffect(effect);
      setActiveEffects([...activeEffects, { id: effectDef.id, name: effectDef.name, effect }]);
    }
  };

  const removeEffect = (effectId) => {
    if (videoProcessorRef?.current?.removeEffect) {
      videoProcessorRef.current.removeEffect(effectId);
      setActiveEffects(activeEffects.filter(e => e.id !== effectId));
    }
  };

  const clearAll = () => {
    if (videoProcessorRef?.current?.clearEffects) {
      videoProcessorRef.current.clearEffects();
      setActiveEffects([]);
    }
  };

  return (
    <div style={{
      padding: '20px',
      background: '#f8f9fa',
      borderRadius: '12px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🎬 CGI Effects</h2>
        {activeEffects.length > 0 && (
          <button
            onClick={clearAll}
            style={{
              padding: '8px 16px',
              background: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active Effects */}
      {activeEffects.length > 0 && (
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          background: '#fff',
          borderRadius: '8px',
          border: '2px solid #667eea'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#667eea' }}>
            Active Effects ({activeEffects.length})
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {activeEffects.map(({ id, name }) => (
              <div
                key={id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  background: '#667eea',
                  color: '#fff',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                {name}
                <button
                  onClick={() => removeEffect(id)}
                  style={{
                    background: 'rgba(255,255,255,0.3)',
                    border: 'none',
                    color: '#fff',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Effects Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '12px'
      }}>
        {availableEffects.map((effect) => {
          const isActive = activeEffects.some(e => e.id === effect.id);

          return (
            <button
              key={effect.id}
              onClick={() => addEffect(effect)}
              disabled={isActive}
              style={{
                padding: '16px',
                background: isActive ? '#e9ecef' : '#fff',
                border: isActive ? '2px solid #6c757d' : '2px solid #dee2e6',
                borderRadius: '12px',
                cursor: isActive ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isActive ? 0.6 : 1,
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102,126,234,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#dee2e6';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{effect.icon}</div>
              <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px', color: '#212529' }}>
                {effect.name}
              </div>
              <div style={{ fontSize: '11px', color: '#6c757d', lineHeight: '1.3' }}>
                {effect.description}
              </div>
              {isActive && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#667eea', fontWeight: '600' }}>
                  ✓ Active
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Info */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: '#e7f3ff',
        borderRadius: '8px',
        border: '1px solid #b3d9ff',
        fontSize: '13px',
        color: '#004085'
      }}>
        💡 <strong>Tip:</strong> Click effects to add them. Multiple effects can be stacked.
        Effects are applied in the order they're added.
      </div>
    </div>
  );
}
