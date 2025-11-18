import React, { useRef, useState } from 'react';
import CGIVideoProcessor from '../components/CGIVideoProcessor';
import CGIControls from '../components/CGIControls';

export default function CGIDemo() {
  const videoProcessorRef = useRef(null);
  const [outputStream, setOutputStream] = useState(null);

  const handleStreamReady = (stream) => {
    setOutputStream(stream);
    console.log('CGI output stream ready:', stream);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          color: '#fff'
        }}>
          <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>
            🎬 CGI Video Effects
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Super Admin Feature - Real-time video effects for calls and streams
          </p>
        </div>

        {/* Video Processor */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <CGIVideoProcessor
            ref={videoProcessorRef}
            onStreamReady={handleStreamReady}
            enableEffects={true}
          />
        </div>

        {/* Controls */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          overflow: 'hidden'
        }}>
          <CGIControls videoProcessorRef={videoProcessorRef} />
        </div>

        {/* Info Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginTop: '40px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎥</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>Real-time Processing</h3>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '14px', lineHeight: '1.5' }}>
              60 FPS video processing with zero latency. All effects run locally in your browser.
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔒</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>Super Admin Only</h3>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '14px', lineHeight: '1.5' }}>
              Exclusive feature for $49.99/month tier. Upgrade to unlock professional CGI effects.
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📞</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>WebRTC Ready</h3>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '14px', lineHeight: '1.5' }}>
              Use CGI effects in video calls, live streams, and screen recordings.
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚡</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>GPU Accelerated</h3>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '14px', lineHeight: '1.5' }}>
              Hardware acceleration for smooth performance even with multiple effects.
            </p>
          </div>
        </div>

        {/* Coming Soon */}
        <div style={{
          marginTop: '40px',
          background: 'rgba(255,255,255,0.95)',
          padding: '32px',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.5rem' }}>🚀 Coming Soon</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            textAlign: 'left'
          }}>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>🎭 Face Filters</div>
              <div style={{ fontSize: '13px', color: '#6c757d' }}>AR masks, glasses, hats</div>
            </div>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>🏞️ Background Replacement</div>
              <div style={{ fontSize: '13px', color: '#6c757d' }}>Custom backgrounds & green screen</div>
            </div>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>🎪 3D Objects</div>
              <div style={{ fontSize: '13px', color: '#6c757d' }}>Floating 3D overlays with Three.js</div>
            </div>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>💬 Text Overlays</div>
              <div style={{ fontSize: '13px', color: '#6c757d' }}>Animated text & subtitles</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
