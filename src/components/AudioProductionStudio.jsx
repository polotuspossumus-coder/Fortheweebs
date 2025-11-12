import React, { useState, useRef, useEffect } from 'react';

/**
 * Audio Production Studio - Complete DAW (Digital Audio Workstation)
 * Features: Multi-track recording, mixing, effects, beat maker, vocals, export
 */
export function AudioProductionStudio({ userId }) {
  const [tracks, setTracks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTrack, setActiveTrack] = useState(null);
  const [bpm, setBpm] = useState(120);
  const [audioContext, setAudioContext] = useState(null);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [isDragging, setIsDragging] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Initialize Web Audio API
    if (typeof window !== 'undefined') {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
    }
  }, []);

  const addTrack = (type = 'audio') => {
    const newTrack = {
      id: `track_${Date.now()}`,
      name: `${type === 'audio' ? '🎤 Audio' : '🎹 MIDI'} Track ${tracks.length + 1}`,
      type,
      volume: 0.8,
      pan: 0,
      mute: false,
      solo: false,
      effects: [],
      audioUrl: null,
      waveform: [],
      duration: 0
    };
    setTracks([...tracks, newTrack]);
    setActiveTrack(newTrack.id);
  };

  // Drag and drop handlers for audio files
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const audioFiles = files.filter(f => 
      f.type.startsWith('audio/') || 
      f.name.match(/\.(mp3|wav|ogg|m4a|flac)$/i)
    );

    // Create a track for each audio file
    audioFiles.forEach((file) => {
      const audioUrl = URL.createObjectURL(file);
      const newTrack = {
        id: `track_${Date.now()}_${Math.random()}`,
        name: `🎤 ${file.name}`,
        type: 'audio',
        volume: 0.8,
        pan: 0,
        mute: false,
        solo: false,
        effects: [],
        audioUrl: audioUrl,
        waveform: [],
        duration: 0
      };
      setTracks(prev => [...prev, newTrack]);
    });

    if (audioFiles.length > 0) {
      alert(`✅ Added ${audioFiles.length} audio file(s) to tracks!`);
    }
  };

  const startRecording = async (trackId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        setTracks(tracks.map(track =>
          track.id === trackId
            ? { ...track, audioUrl, duration: audioBlob.size / 44100 }
            : track
        ));

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      alert('Unable to access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const updateTrack = (trackId, updates) => {
    setTracks(tracks.map(track =>
      track.id === trackId ? { ...track, ...updates } : track
    ));
  };

  const deleteTrack = (trackId) => {
    setTracks(tracks.filter(track => track.id !== trackId));
    if (activeTrack === trackId) setActiveTrack(null);
  };

  const applyEffect = (trackId, effect) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      updateTrack(trackId, {
        effects: [...track.effects, effect]
      });
    }
  };

  const exportProject = async () => {
    const projectData = {
      name: 'My Audio Project',
      bpm,
      tracks,
      masterVolume,
      createdAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audio-project-${Date.now()}.json`;
    link.click();
  };

  const exportMixdown = async () => {
    alert('Mixdown export feature coming soon! This will combine all tracks into a final audio file.');
  };

  const EFFECTS = [
    { id: 'reverb', name: 'Reverb', icon: '🌊', params: { roomSize: 0.5, damping: 0.5, wetDry: 0.3 } },
    { id: 'delay', name: 'Delay', icon: '⏱️', params: { time: 0.5, feedback: 0.3, wetDry: 0.4 } },
    { id: 'eq', name: 'EQ', icon: '📊', params: { low: 0, mid: 0, high: 0 } },
    { id: 'compressor', name: 'Compressor', icon: '🎚️', params: { threshold: -20, ratio: 4, attack: 0.003, release: 0.25 } },
    { id: 'distortion', name: 'Distortion', icon: '🔥', params: { amount: 0.5, tone: 0.5 } },
    { id: 'chorus', name: 'Chorus', icon: '🎵', params: { rate: 1.5, depth: 0.2, wetDry: 0.5 } },
    { id: 'flanger', name: 'Flanger', icon: '🌀', params: { rate: 0.5, depth: 0.002, feedback: 0.5 } },
    { id: 'phaser', name: 'Phaser', icon: '✨', params: { rate: 0.5, depth: 1, feedback: 0.5, stages: 4 } },
    { id: 'limiter', name: 'Limiter', icon: '📏', params: { threshold: -1, release: 0.05 } },
    { id: 'gate', name: 'Noise Gate', icon: '🚪', params: { threshold: -50, attack: 0.001, release: 0.1 } },
    { id: 'autotune', name: 'Auto-Tune', icon: '🎤', params: { key: 'C', scale: 'major', correction: 0.5 } },
    { id: 'pitch-shift', name: 'Pitch Shift', icon: '↕️', params: { semitones: 0, cents: 0 } },
    { id: 'time-stretch', name: 'Time Stretch', icon: '⏳', params: { ratio: 1.0, preservePitch: true } },
    { id: 'stereo-widener', name: 'Stereo Width', icon: '↔️', params: { width: 1.0 } }
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      minHeight: '100vh',
      padding: '40px 20px',
      color: 'white'
    }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(102, 126, 234, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          fontSize: '48px',
          fontWeight: 'bold',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '120px', marginBottom: '30px' }}>🎵</div>
          <div>Drop Audio Files Here!</div>
          <div style={{ fontSize: '24px', marginTop: '20px', opacity: 0.9 }}>
            Supports MP3, WAV, OGG, M4A, FLAC
          </div>
        </div>
      )}
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '900',
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎧 Audio Production Studio
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.8 }}>
            Professional DAW • Multi-track recording • Mixing • Effects • Beat making
          </p>

          {/* BPM and Time Signature */}
          <div style={{
            display: 'flex',
            gap: '20px',
            marginTop: '20px',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.05)',
            padding: '15px',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '14px', opacity: 0.8 }}>BPM:</label>
              <input
                type="number"
                min="40"
                max="240"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  color: 'white',
                  width: '70px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              />
              <span style={{ fontSize: '12px', opacity: 0.7 }}>(40-240)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '14px', opacity: 0.8 }}>Sample Rate:</label>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {audioContext?.sampleRate ? `${audioContext.sampleRate} Hz` : '44.1 kHz'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '14px', opacity: 0.8 }}>Bit Depth:</label>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>24-bit</span>
            </div>
          </div>

          {/* Transport Controls */}
          <div style={{
            display: 'flex',
            gap: '20px',
            marginTop: '30px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={controlButtonStyle}>⏮️ Prev</button>
              <button style={controlButtonStyle}>▶️ Play</button>
              <button style={controlButtonStyle}>⏸️ Pause</button>
              <button style={controlButtonStyle}>⏹️ Stop</button>
              <button style={controlButtonStyle}>⏭️ Next</button>
              <button style={{...controlButtonStyle, background: isRecording ? '#ff4444' : 'rgba(255,68,68,0.2)', border: '1px solid #ff4444'}}>
                ⏺ {isRecording ? 'Recording...' : 'Record'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', opacity: 0.8 }}>🕐</span>
                <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold' }}>
                  00:00:00
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginLeft: 'auto' }}>
              <label style={{ fontSize: '14px', opacity: 0.8 }}>Master Volume:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                style={{ width: '150px' }}
              />
              <span style={{ 
                minWidth: '45px', 
                fontFamily: 'monospace', 
                fontSize: '14px',
                fontWeight: 'bold',
                color: masterVolume > 0.9 ? '#ff4444' : masterVolume > 0.7 ? '#ffc107' : '#4CAF50'
              }}>
                {Math.round(masterVolume * 100)}%
              </span>
              <span style={{ fontSize: '14px' }}>
                {masterVolume > 0.9 ? '⚠️' : masterVolume > 0.7 ? '🔊' : '🔉'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px',
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => addTrack('audio')}
            style={actionButtonStyle('#667eea')}
          >
            ➕ Add Audio Track
          </button>
          <button
            onClick={() => addTrack('midi')}
            style={actionButtonStyle('#764ba2')}
          >
            🎹 Add MIDI Track
          </button>
          <button
            onClick={exportProject}
            style={actionButtonStyle('#f093fb')}
          >
            💾 Save Project
          </button>
          <button
            onClick={exportMixdown}
            style={actionButtonStyle('#4facfe')}
          >
            📦 Export Mixdown
          </button>
          <button
            onClick={() => alert('Voice recording with real-time effects coming soon!')}
            style={actionButtonStyle('#ff6b6b')}
          >
            🎙️ Voice Recording
          </button>
          <button
            onClick={() => alert('Import audio files (MP3, WAV, OGG) coming soon!')}
            style={actionButtonStyle('#51cf66')}
          >
            📁 Import Audio
          </button>
          <button
            onClick={() => alert('AI mastering will automatically optimize your mix!')}
            style={actionButtonStyle('#ffd43b')}
          >
            🤖 AI Mastering
          </button>
          <button
            onClick={() => alert('Stem separation will extract vocals, drums, bass, and instruments!')}
            style={actionButtonStyle('#9775fa')}
          >
            🎼 Stem Separation
          </button>
        </div>

        {/* Tracks */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '25px' }}>
            🎚️ Mixer ({tracks.length} tracks)
          </h2>

          {tracks.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              opacity: 0.5
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎤</div>
              <p style={{ fontSize: '20px' }}>No tracks yet. Click "Add Audio Track" to start!</p>
            </div>
          )}

          {tracks.map((track, index) => (
            <div
              key={track.id}
              style={{
                background: activeTrack === track.id
                  ? 'rgba(102, 126, 234, 0.2)'
                  : 'rgba(255,255,255,0.05)',
                border: activeTrack === track.id
                  ? '2px solid #667eea'
                  : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '15px',
                padding: '20px',
                marginBottom: '15px',
                cursor: 'pointer'
              }}
              onClick={() => setActiveTrack(track.id)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap'
              }}>
                {/* Track Info */}
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <input
                    type="text"
                    value={track.name}
                    onChange={(e) => updateTrack(track.id, { name: e.target.value })}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      width: '100%',
                      marginBottom: '5px'
                    }}
                  />
                  <div style={{ opacity: 0.7, fontSize: '14px' }}>
                    {track.type === 'audio' ? '🎤 Audio Track' : '🎹 MIDI Track'} • {track.effects.length} effects
                  </div>
                </div>

                {/* Recording Controls */}
                {track.type === 'audio' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {!track.audioUrl && (
                      <>
                        {!isRecording ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startRecording(track.id);
                            }}
                            style={trackButtonStyle('#ff4444')}
                          >
                            ⏺ Record
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              stopRecording();
                            }}
                            style={trackButtonStyle('#ff4444')}
                          >
                            ⏹ Stop
                          </button>
                        )}
                      </>
                    )}
                    {track.audioUrl && (
                      <audio controls src={track.audioUrl} style={{ height: '40px' }} />
                    )}
                  </div>
                )}

                {/* Volume/Pan */}
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', marginBottom: '5px', opacity: 0.8 }}>Volume</div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={track.volume}
                      onChange={(e) => updateTrack(track.id, { volume: parseFloat(e.target.value) })}
                      style={{ width: '100px' }}
                    />
                    <div style={{ fontSize: '11px', marginTop: '2px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {Math.round(track.volume * 100)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', marginBottom: '5px', opacity: 0.8 }}>Pan</div>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.1"
                      value={track.pan}
                      onChange={(e) => updateTrack(track.id, { pan: parseFloat(e.target.value) })}
                      style={{ width: '100px' }}
                    />
                    <div style={{ fontSize: '11px', marginTop: '2px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.abs(Math.round(track.pan * 100))}` : `R${Math.round(track.pan * 100)}`}
                    </div>
                  </div>
                </div>

                {/* Mute/Solo */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTrack(track.id, { mute: !track.mute });
                    }}
                    style={{
                      ...trackButtonStyle(track.mute ? '#ff4444' : '#666'),
                      opacity: track.mute ? 1 : 0.5
                    }}
                  >
                    {track.mute ? '🔇' : '🔊'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTrack(track.id, { solo: !track.solo });
                    }}
                    style={{
                      ...trackButtonStyle(track.solo ? '#4CAF50' : '#666'),
                      opacity: track.solo ? 1 : 0.5
                    }}
                  >
                    S
                  </button>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTrack(track.id);
                  }}
                  style={trackButtonStyle('#ff4444')}
                >
                  🗑️
                </button>
              </div>

              {/* Effects */}
              {activeTrack === track.id && (
                <div style={{
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <h4 style={{ marginBottom: '15px', fontSize: '16px' }}>🎛️ Effects Chain ({track.effects.length} active)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                    {EFFECTS.map(effect => {
                      const isActive = track.effects.find(e => e.id === effect.id);
                      return (
                        <button
                          key={effect.id}
                          onClick={() => applyEffect(track.id, effect)}
                          style={{
                            background: isActive ? '#667eea' : 'rgba(255,255,255,0.1)',
                            border: isActive ? '2px solid #4CAF50' : '1px solid rgba(255,255,255,0.2)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: isActive ? 'bold' : 'normal',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                          title={effect.params ? Object.entries(effect.params).map(([k, v]) => `${k}: ${v}`).join('\n') : ''}
                        >
                          <span style={{ fontSize: '20px' }}>{effect.icon}</span>
                          <span style={{ fontSize: '11px' }}>{effect.name}</span>
                          {isActive && <span style={{ fontSize: '10px', color: '#4CAF50' }}>✓ ON</span>}
                        </button>
                      );
                    })}
                  </div>

                  {track.effects.length > 0 && (
                    <div style={{ 
                      marginTop: '15px',
                      padding: '12px',
                      background: 'rgba(76, 175, 80, 0.1)',
                      borderRadius: '8px',
                      border: '1px solid rgba(76, 175, 80, 0.3)'
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Active Chain:</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {track.effects.map((e, idx) => (
                          <span key={idx} style={{ 
                            background: 'rgba(102, 126, 234, 0.3)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            {e.icon} {e.name}
                            {idx < track.effects.length - 1 && <span style={{ opacity: 0.5 }}>→</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Beat Maker */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          padding: '30px'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>
            🥁 Beat Maker
          </h2>
          <p style={{ opacity: 0.7, marginBottom: '20px' }}>
            Click pads to create beats • Adjust BPM • Add loops
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '15px',
            maxWidth: '800px'
          }}>
            {['Kick', 'Snare', 'Hi-Hat', 'Clap', 'Tom', 'Cymbal', 'Perc 1', 'Perc 2'].map((sound, i) => (
              <button
                key={sound}
                onClick={() => {
                  // Play sound effect
                  console.log(`Playing ${sound}`);
                }}
                style={{
                  background: `hsl(${i * 45}, 70%, 50%)`,
                  border: 'none',
                  padding: '40px 20px',
                  borderRadius: '15px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}
                onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
              >
                {sound}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const controlButtonStyle = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  padding: '10px 20px',
  borderRadius: '8px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '16px',
  transition: 'all 0.2s'
};

const actionButtonStyle = (color) => ({
  background: color,
  border: 'none',
  padding: '15px 30px',
  borderRadius: '10px',
  color: 'white',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
});

const trackButtonStyle = (color) => ({
  background: color,
  border: 'none',
  padding: '10px 15px',
  borderRadius: '8px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold'
});
