import React, { useState } from 'react';

export function AIContentGenerator({ userId }) {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('image');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const generateContent = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          prompt,
          contentType,
          userId
        })
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      borderRadius: '20px',
      padding: '40px',
      color: 'white'
    }}>
      <h2 style={{
        fontSize: '32px',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <span style={{ fontSize: '48px' }}>🤖</span>
        AI Content Generator
      </h2>
      <p style={{ marginBottom: '30px', opacity: 0.9 }}>
        Super Admin exclusive - Generate images, 3D models, and more with AI
      </p>

      {/* Content Type Selector */}
      <div style={{ marginBottom: '25px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Content Type
        </label>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {[
            { value: 'image', label: '🖼️ Image', desc: 'Generate AI artwork' },
            { value: '3d', label: '🎭 3D Model', desc: 'Create 3D models' },
            { value: 'video', label: '🎬 Video', desc: 'Generate videos' },
            { value: 'text', label: '📝 Text', desc: 'Write content' }
          ].map(type => (
            <button
              key={type.value}
              onClick={() => setContentType(type.value)}
              style={{
                background: contentType === type.value ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                border: contentType === type.value ? '2px solid white' : '2px solid transparent',
                color: 'white',
                padding: '15px 20px',
                borderRadius: '12px',
                cursor: 'pointer',
                flex: '1',
                minWidth: '150px',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                {type.label}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                {type.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div style={{ marginBottom: '25px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Describe what you want to create
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., 'A futuristic anime character with purple hair and cybernetic enhancements'"
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '15px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '16px',
            background: 'rgba(255,255,255,0.9)',
            color: '#333',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={generateContent}
        disabled={generating || !prompt.trim()}
        style={{
          width: '100%',
          background: generating ? 'rgba(255,255,255,0.3)' : 'white',
          color: generating ? 'white' : '#f5576c',
          border: 'none',
          padding: '18px',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: generating ? 'not-allowed' : 'pointer',
          marginBottom: '25px',
          transition: 'all 0.2s'
        }}
      >
        {generating ? '⏳ Generating...' : '✨ Generate Content'}
      </button>

      {/* Error Display */}
      {error && (
        <div style={{
          background: 'rgba(255, 0, 0, 0.2)',
          border: '2px solid rgba(255, 0, 0, 0.5)',
          borderRadius: '12px',
          padding: '15px',
          marginBottom: '25px'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '12px',
          padding: '25px'
        }}>
          <h3 style={{ marginBottom: '15px', fontSize: '20px' }}>✅ Generated Content</h3>

          {contentType === 'image' && result.url && (
            <img
              src={result.url}
              alt="Generated"
              style={{
                width: '100%',
                borderRadius: '12px',
                marginBottom: '15px'
              }}
            />
          )}

          {contentType === 'video' && result.url && (
            <video
              src={result.url}
              controls
              style={{
                width: '100%',
                borderRadius: '12px',
                marginBottom: '15px'
              }}
            />
          )}

          {contentType === 'text' && result.text && (
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '15px',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace'
            }}>
              {result.text}
            </div>
          )}

          {result.url && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => window.open(result.url, '_blank')}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                📥 Download
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.url);
                  alert('URL copied!');
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                📋 Copy URL
              </button>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div style={{
        marginTop: '25px',
        padding: '20px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '12px',
        fontSize: '14px',
        lineHeight: '1.6'
      }}>
        <strong>💡 Tips:</strong>
        <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
          <li>Be specific and detailed in your prompts</li>
          <li>Mention style, colors, mood, and composition</li>
          <li>For 3D models, describe shape, texture, and purpose</li>
          <li>Generated content is automatically saved to your cloud storage</li>
        </ul>
      </div>
    </div>
  );
}
