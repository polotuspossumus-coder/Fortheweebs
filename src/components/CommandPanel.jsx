import React, { useState } from 'react';
import './CommandPanel.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export default function CommandPanel() {
  const [command, setCommand] = useState('');
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const executeCommand = async () => {
    if (!command.trim() || value === '') {
      setStatus('⚠️ Enter both command and value');
      return;
    }

    setIsExecuting(true);
    setStatus('⏳ Executing...');

    try {
      const res = await fetch(`${API_BASE}/api/governance/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, value }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(`✅ Success: ${JSON.stringify(data.result)}`);
        setCommand('');
        setValue('');
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setStatus(`❌ Network error: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const quickCommands = [
    { cmd: 'moderation_threshold_violence', val: '0.85', label: 'Violence: 0.85' },
    { cmd: 'moderation_threshold_nsfw', val: '0.75', label: 'NSFW: 0.75' },
    { cmd: 'moderation_threshold_hate', val: '0.90', label: 'Hate: 0.90' },
    { cmd: 'moderation_threshold_csam', val: '0.30', label: 'CSAM: 0.30' },
    { cmd: 'agent_authority_moderation_sentinel', val: 'enforce', label: 'Sentinel: Enforce' },
    { cmd: 'agent_authority_content_companion', val: 'act', label: 'Companion: Act' },
    { cmd: 'pause_lane_csam_detection', val: 'false', label: 'Resume CSAM Lane' },
    { cmd: 'guard_mode', val: 'true', label: '🛡️ Enable Guard Mode' },
  ];

  return (
    <div className="command-panel">
      <div className="command-panel-header">
        <h2>⚡ Mico Command Panel</h2>
        <p className="subtitle">Live governance controls</p>
      </div>

      <div className="command-input-group">
        <div className="input-row">
          <label>Command:</label>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="e.g., moderation_threshold_violence"
            disabled={isExecuting}
          />
        </div>

        <div className="input-row">
          <label>Value:</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g., 0.85"
            disabled={isExecuting}
          />
        </div>

        <button
          className="execute-btn"
          onClick={executeCommand}
          disabled={isExecuting}
        >
          {isExecuting ? 'Executing...' : '▶ Execute'}
        </button>
      </div>

      {status && (
        <div className={`status-bar ${status.startsWith('✅') ? 'success' : status.startsWith('❌') ? 'error' : 'warning'}`}>
          {status}
        </div>
      )}

      <div className="quick-commands">
        <h3>Quick Commands</h3>
        <div className="command-grid">
          {quickCommands.map((qc, idx) => (
            <button
              key={idx}
              className="quick-cmd-btn"
              onClick={() => {
                setCommand(qc.cmd);
                setValue(qc.val);
              }}
              disabled={isExecuting}
            >
              {qc.label}
            </button>
          ))}
        </div>
      </div>

      <div className="command-help">
        <h3>Available Commands</h3>
        <ul>
          <li><code>moderation_threshold_[type]</code> - Set threshold (0-1): violence, nsfw, hate, csam</li>
          <li><code>agent_authority_[agent]</code> - Set authority (read/suggest/act/enforce)</li>
          <li><code>pause_lane_[lane]</code> - Pause/resume lane (true/false)</li>
          <li><code>guard_mode</code> - Enable/disable guard mode (true/false)</li>
        </ul>
      </div>
    </div>
  );
}
