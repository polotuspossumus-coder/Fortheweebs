import React, { useEffect, useRef, useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function CGIVideoProcessor({ onStreamReady, enableEffects = true }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [fps, setFps] = useState(0);
  const [error, setError] = useState(null);
  const [activeEffects, setActiveEffects] = useState([]);
  const animationFrameRef = useRef(null);
  const lastFrameTimeRef = useRef(0);

  // Check tier access
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('Please log in to use CGI features');
          return;
        }

        const response = await fetch(`${API_URL}/user/${userId}/tier`);
        const { tier } = await response.json();

        if (tier !== 'super_admin') {
          setError('CGI features require Super Admin ($49.99/month)');
          return;
        }
      } catch (err) {
        console.error('Failed to check tier:', err);
        // Continue anyway for development
      }
    };

    checkAccess();
  }, []);

  // Start video capture and processing
  useEffect(() => {
    let stream = null;

    const startProcessing = async () => {
      try {
        // Get webcam with highest quality
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 60 }
          },
          audio: false
        });

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        video.srcObject = stream;
        await video.play();

        // Set canvas size to match video
        canvas.width = video.videoWidth || 1920;
        canvas.height = video.videoHeight || 1080;

        const ctx = canvas.getContext('2d', {
          willReadFrequently: true,
          alpha: false
        });

        // Render loop
        const render = (timestamp) => {
          // Calculate FPS
          const deltaTime = timestamp - lastFrameTimeRef.current;
          if (deltaTime > 0) {
            setFps(Math.round(1000 / deltaTime));
          }
          lastFrameTimeRef.current = timestamp;

          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Apply CGI effects if enabled
          if (enableEffects && activeEffects.length > 0) {
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Apply each effect in order
            for (const effect of activeEffects) {
              imageData = effect.apply(imageData, ctx);
            }

            ctx.putImageData(imageData, 0, 0);
          }

          animationFrameRef.current = requestAnimationFrame(render);
        };

        // Start rendering
        animationFrameRef.current = requestAnimationFrame(render);

        // Create output stream for WebRTC
        const outputStream = canvas.captureStream(60);
        onStreamReady?.(outputStream);
        setIsActive(true);

      } catch (err) {
        console.error('Failed to start video processing:', err);
        setError(err.message);
      }
    };

    startProcessing();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [enableEffects, activeEffects, onStreamReady]);

  // Add effect to processing pipeline
  const addEffect = useCallback((effect) => {
    setActiveEffects(prev => [...prev, effect]);
  }, []);

  // Remove effect from pipeline
  const removeEffect = useCallback((effectName) => {
    setActiveEffects(prev => prev.filter(e => e.name !== effectName));
  }, []);

  // Clear all effects
  const clearEffects = useCallback(() => {
    setActiveEffects([]);
  }, []);

  if (error) {
    return (
      <div style={{
        padding: '20px',
        background: '#fee',
        border: '2px solid #c33',
        borderRadius: '8px',
        color: '#c33'
      }}>
        <h3>❌ CGI Not Available</h3>
        <p>{error}</p>
        {error.includes('Super Admin') && (
          <button
            onClick={() => window.location.href = '/pricing'}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              background: '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Upgrade to Super Admin
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Hidden video element (source) */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        playsInline
        autoPlay
        muted
      />

      {/* Canvas (output with CGI) */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: '8px',
          background: '#000'
        }}
      />

      {/* Status overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        padding: '8px 12px',
        background: 'rgba(0,0,0,0.7)',
        color: '#fff',
        borderRadius: '6px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <div>
          {isActive ? '🟢 Active' : '🔴 Inactive'} | {fps} FPS
        </div>
        <div style={{ fontSize: '10px', marginTop: '4px' }}>
          Effects: {activeEffects.length}
        </div>
      </div>

      {/* Export functions for external use */}
      <div ref={(el) => {
        if (el) {
          el.addEffect = addEffect;
          el.removeEffect = removeEffect;
          el.clearEffects = clearEffects;
        }
      }} style={{ display: 'none' }} />
    </div>
  );
}
