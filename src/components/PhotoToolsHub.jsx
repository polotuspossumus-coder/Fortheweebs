import React, { useState } from 'react';
import { PhotoEnhancementSuite } from './PhotoEnhancementSuite';
import { DuplicatePhotoDetector } from './DuplicatePhotoDetector';
import { ProPhotoFilters } from './ProPhotoFilters';
import { BatchPhotoProcessor } from './BatchPhotoProcessor';
import { AdvancedPhotoEditor } from './AdvancedPhotoEditor';
import { MassPhotoProcessor } from './MassPhotoProcessor';
import { ProPhotoEditor } from './ProPhotoEditor';

/**
 * PhotoToolsHub - Central hub for all photo editing tools
 * Includes enhancement, filters, duplicates, batch processing, and mass folder processing
 */
export function PhotoToolsHub({ userId }) {
  const [activeTool, setActiveTool] = useState('enhance');

  const TOOLS = [
    { id: 'enhance', name: 'Photo Enhancement', icon: '✨', component: PhotoEnhancementSuite },
    { id: 'pro', name: 'Pro Editor', icon: '🎨', component: ProPhotoEditor },
    { id: 'advanced', name: 'Advanced Editor', icon: '🔧', component: AdvancedPhotoEditor },
    { id: 'mass', name: 'Mass Processor', icon: '📁', component: MassPhotoProcessor },
    { id: 'filters', name: 'Pro Filters', icon: '�', component: ProPhotoFilters },
    { id: 'duplicates', name: 'Find Duplicates', icon: '🔍', component: DuplicatePhotoDetector },
    { id: 'batch', name: 'Batch Process', icon: '📦', component: BatchPhotoProcessor }
  ];

  const ActiveComponent = TOOLS.find(t => t.id === activeTool)?.component || PhotoEnhancementSuite;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      {/* Tool Selector */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 40px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '56px',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '20px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          📸 Professional Photo Tools
        </h1>
        <p style={{
          fontSize: '20px',
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '40px'
        }}>
          Auto-crop • Pixel restoration • Filters • Batch processing • Duplicate detection
        </p>

        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              style={{
                background: activeTool === tool.id ? 'white' : 'rgba(255,255,255,0.2)',
                color: activeTool === tool.id ? '#667eea' : 'white',
                border: 'none',
                padding: '20px 40px',
                borderRadius: '30px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: activeTool === tool.id ? '0 8px 24px rgba(0,0,0,0.2)' : 'none',
                transform: activeTool === tool.id ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <span style={{ fontSize: '24px' }}>{tool.icon}</span>
              <span>{tool.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Tool */}
      <ActiveComponent userId={userId} />

      {/* Feature Summary */}
      <div style={{
        maxWidth: '1200px',
        margin: '40px auto 0',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '40px',
        color: 'white'
      }}>
        <h2 style={{ fontSize: '32px', marginBottom: '30px', textAlign: 'center' }}>
          🎯 Complete Photo Toolkit
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {[
            { icon: '✨', title: 'Auto Enhancement', desc: 'Brightness, contrast, saturation, sharpness' },
            { icon: '✂️', title: 'Smart Crop', desc: 'Intelligent content detection and cropping' },
            { icon: '🔧', title: 'Pixel Restoration', desc: 'Fix missing or damaged pixels automatically' },
            { icon: '🎨', title: '18+ Pro Filters', desc: 'Radiance, Golden, Frost, Electric & more' },
            { icon: '🔍', title: 'Duplicate Detection', desc: 'Find duplicates even if resized/compressed' },
            { icon: '📦', title: 'Batch Processing', desc: 'Process hundreds of photos at once' },
            { icon: '💾', title: 'Works Offline', desc: 'No internet required for all tools' },
            { icon: '🚫', title: 'No Censorship', desc: 'Your content, your rules, no restrictions' }
          ].map((feature, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '15px',
                padding: '20px',
                textAlign: 'center',
                transition: 'transform 0.3s',
                cursor: 'default'
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '20px', marginBottom: '10px', fontWeight: 'bold' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.5' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '40px',
          padding: '30px',
          background: 'rgba(76, 175, 80, 0.2)',
          border: '2px solid #4CAF50',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>
            💰 No Monthly Fees • No Subscriptions
          </h3>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>
            Unlike subscription-based editing software ($60/month), social media filters, or other paid tools,
            all our photo features are included with your one-time purchase.
            No censorship, no restrictions, just professional quality tools that work offline.
          </p>
        </div>
      </div>
    </div>
  );
}
