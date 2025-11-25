/**
 * Command Panel: Live governance controls for Mico
 * Allows real-time threshold adjustments, lane controls, and emergency actions
 */

import React, { useState, useEffect } from 'react';
import './CommandPanel.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function CommandPanel({ onCommandExecuted }) {
  const [activeCommand, setActiveCommand] = useState(null); // 'threshold', 'lane', 'guard', 'override'
  const [lanes, setLanes] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  // Form states
  const [thresholdForm, setThresholdForm] = useState({
    contentType: 'post',
    flagType: 'violence',
    threshold: 0.75,
    reason: '',
  });

  const [overrideForm, setOverrideForm] = useState({
    overrideKey: '',
    overrideType: 'moderation_threshold',
    overrideValue: {},
    reason: '',
    expiresIn: 3600, // seconds
  });

  useEffect(() => {
    loadLanes();
    loadOverrides();
  }, []);

  const loadLanes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/governance/lanes`);
      const data = await res.json();
      if (data.lanes) {
        setLanes(data.lanes);
      }
    } catch (error) {
      console.error('Failed to load lanes:', error);
    }
  };

  const loadOverrides = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/governance/overrides`);
      const data = await res.json();
      if (data.overrides) {
        setOverrides(data.overrides);
      }
    } catch (error) {
      console.error('Failed to load overrides:', error);
    }
  };

  const executeCommand = async (commandType, payload) => {
    setIsExecuting(true);
    setLastResult(null);

    try {
      let response;

      switch (commandType) {
        case 'set_threshold':
          response = await fetch(`${API_BASE}/api/governance/threshold`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...payload,
              setBy: 'mico',
            }),
          });
          break;

        case 'pause_lane':
          response = await fetch(`${API_BASE}/api/governance/lanes/${payload.laneName}/pause`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: payload.reason }),
          });
          break;

        case 'resume_lane':
          response = await fetch(`${API_BASE}/api/governance/lanes/${payload.laneName}/resume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          break;

        case 'set_override':
          const expiresAt = payload.expiresIn > 0
            ? new Date(Date.now() + payload.expiresIn * 1000).toISOString()
            : undefined;

          response = await fetch(`${API_BASE}/api/governance/overrides`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              overrideKey: payload.overrideKey,
              overrideType: payload.overrideType,
              overrideValue: payload.overrideValue,
              reason: payload.reason,
              expiresAt,
              setBy: 'mico',
            }),
          });
          break;

        case 'deactivate_override':
          response = await fetch(`${API_BASE}/api/governance/overrides/${payload.overrideKey}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: payload.reason || 'Manual deactivation' }),
          });
          break;

        default:
          throw new Error(`Unknown command type: ${commandType}`);
      }

      const result = await response.json();

      if (response.ok) {
        setLastResult({ success: true, message: 'Command executed successfully', data: result });

        // Refresh data
        await loadLanes();
        await loadOverrides();

        // Notify parent
        if (onCommandExecuted) {
          onCommandExecuted({ commandType, payload, result });
        }
      } else {
        setLastResult({ success: false, message: result.error || 'Command failed' });
      }
    } catch (error) {
      console.error('Command execution failed:', error);
      setLastResult({ success: false, message: error.message });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSetThreshold = () => {
    if (!thresholdForm.reason.trim()) {
      setLastResult({ success: false, message: 'Justification required' });
      return;
    }

    executeCommand('set_threshold', thresholdForm);
  };

  const handlePauseLane = (laneName) => {
    const reason = prompt(`Reason for pausing ${laneName}:`);
    if (reason) {
      executeCommand('pause_lane', { laneName, reason });
    }
  };

  const handleResumeLane = (laneName) => {
    executeCommand('resume_lane', { laneName });
  };

  const handleSetOverride = () => {
    if (!overrideForm.overrideKey.trim() || !overrideForm.reason.trim()) {
      setLastResult({ success: false, message: 'Override key and reason required' });
      return;
    }

    try {
      const overrideValue = typeof overrideForm.overrideValue === 'string'
        ? JSON.parse(overrideForm.overrideValue)
        : overrideForm.overrideValue;

      executeCommand('set_override', {
        ...overrideForm,
        overrideValue,
      });
    } catch (error) {
      setLastResult({ success: false, message: 'Invalid JSON in override value' });
    }
  };

  const handleDeactivateOverride = (overrideKey) => {
    if (confirm(`Deactivate override: ${overrideKey}?`)) {
      executeCommand('deactivate_override', { overrideKey });
    }
  };

  return (
    <div className="command-panel">
      <div className="command-header">
        <h3>⚡ Governance Controls</h3>
        <div className="command-status">
          {isExecuting && <span className="executing">⏳ Executing...</span>}
          {lastResult && (
            <span className={`result ${lastResult.success ? 'success' : 'error'}`}>
              {lastResult.success ? '✅' : '❌'} {lastResult.message}
            </span>
          )}
        </div>
      </div>

      <div className="command-tabs">
        <button
          className={`command-tab ${activeCommand === 'threshold' ? 'active' : ''}`}
          onClick={() => setActiveCommand('threshold')}
        >
          🎚️ Thresholds
        </button>
        <button
          className={`command-tab ${activeCommand === 'lane' ? 'active' : ''}`}
          onClick={() => setActiveCommand('lane')}
        >
          🚦 Lanes
        </button>
        <button
          className={`command-tab ${activeCommand === 'override' ? 'active' : ''}`}
          onClick={() => setActiveCommand('override')}
        >
          ⚙️ Overrides
        </button>
        <button
          className={`command-tab ${activeCommand === 'guard' ? 'active' : ''}`}
          onClick={() => setActiveCommand('guard')}
        >
          🛡️ Guard Mode
        </button>
      </div>

      <div className="command-content">
        {activeCommand === 'threshold' && (
          <div className="threshold-controls">
            <h4>Set Moderation Threshold</h4>

            <div className="form-group">
              <label>Content Type:</label>
              <select
                value={thresholdForm.contentType}
                onChange={(e) => setThresholdForm({ ...thresholdForm, contentType: e.target.value })}
              >
                <option value="post">Post</option>
                <option value="comment">Comment</option>
                <option value="media">Media</option>
                <option value="profile">Profile</option>
                <option value="message">Message</option>
              </select>
            </div>

            <div className="form-group">
              <label>Flag Type:</label>
              <select
                value={thresholdForm.flagType}
                onChange={(e) => setThresholdForm({ ...thresholdForm, flagType: e.target.value })}
              >
                <option value="violence">Violence</option>
                <option value="hate_speech">Hate Speech</option>
                <option value="harassment">Harassment</option>
                <option value="spam">Spam</option>
                <option value="adult_without_flag">Adult Content (Unflagged)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Threshold (0.0 - 1.0):</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={thresholdForm.threshold}
                onChange={(e) => setThresholdForm({ ...thresholdForm, threshold: parseFloat(e.target.value) })}
              />
              <span className="threshold-value">{thresholdForm.threshold.toFixed(2)}</span>
            </div>

            <div className="form-group">
              <label>Justification:</label>
              <textarea
                value={thresholdForm.reason}
                onChange={(e) => setThresholdForm({ ...thresholdForm, reason: e.target.value })}
                placeholder="Reason for threshold change..."
                rows={3}
              />
            </div>

            <button
              className="execute-button"
              onClick={handleSetThreshold}
              disabled={isExecuting}
            >
              ⚡ Execute Override
            </button>
          </div>
        )}

        {activeCommand === 'lane' && (
          <div className="lane-controls">
            <h4>Priority Lane Management</h4>

            <div className="lane-list">
              {lanes.map((lane) => (
                <div key={lane.laneName} className="lane-item">
                  <div className="lane-info">
                    <span className="lane-name">{lane.laneName}</span>
                    <span className="lane-priority">Priority: {lane.priorityLevel}</span>
                    <span className={`lane-status ${lane.active ? 'active' : 'paused'}`}>
                      {lane.active ? '🟢 Active' : '🔴 Paused'}
                    </span>
                  </div>
                  <div className="lane-actions">
                    {lane.active ? (
                      <button
                        className="pause-button"
                        onClick={() => handlePauseLane(lane.laneName)}
                        disabled={isExecuting}
                      >
                        ⏸️ Pause
                      </button>
                    ) : (
                      <button
                        className="resume-button"
                        onClick={() => handleResumeLane(lane.laneName)}
                        disabled={isExecuting}
                      >
                        ▶️ Resume
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeCommand === 'override' && (
          <div className="override-controls">
            <h4>Policy Overrides</h4>

            <div className="active-overrides">
              <h5>Active Overrides:</h5>
              {overrides.length === 0 ? (
                <p className="no-overrides">No active overrides</p>
              ) : (
                overrides.map((override) => (
                  <div key={override.overrideKey} className="override-item">
                    <div className="override-info">
                      <span className="override-key">{override.overrideKey}</span>
                      <span className="override-type">{override.overrideType}</span>
                      {override.expiresAt && (
                        <span className="override-expires">
                          Expires: {new Date(override.expiresAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <button
                      className="deactivate-button"
                      onClick={() => handleDeactivateOverride(override.overrideKey)}
                      disabled={isExecuting}
                    >
                      ❌ Deactivate
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="new-override">
              <h5>Create New Override:</h5>

              <div className="form-group">
                <label>Override Key:</label>
                <input
                  type="text"
                  value={overrideForm.overrideKey}
                  onChange={(e) => setOverrideForm({ ...overrideForm, overrideKey: e.target.value })}
                  placeholder="e.g., emergency_stricter_moderation"
                />
              </div>

              <div className="form-group">
                <label>Override Type:</label>
                <select
                  value={overrideForm.overrideType}
                  onChange={(e) => setOverrideForm({ ...overrideForm, overrideType: e.target.value })}
                >
                  <option value="moderation_threshold">Moderation Threshold</option>
                  <option value="rate_limit">Rate Limit</option>
                  <option value="authority_level">Authority Level</option>
                  <option value="feature_toggle">Feature Toggle</option>
                  <option value="priority_lane">Priority Lane</option>
                </select>
              </div>

              <div className="form-group">
                <label>Override Value (JSON):</label>
                <textarea
                  value={typeof overrideForm.overrideValue === 'string'
                    ? overrideForm.overrideValue
                    : JSON.stringify(overrideForm.overrideValue, null, 2)}
                  onChange={(e) => setOverrideForm({ ...overrideForm, overrideValue: e.target.value })}
                  placeholder='{"enabled": true}'
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Expires In (seconds):</label>
                <input
                  type="number"
                  value={overrideForm.expiresIn}
                  onChange={(e) => setOverrideForm({ ...overrideForm, expiresIn: parseInt(e.target.value) })}
                  placeholder="3600"
                />
                <span className="expires-hint">0 = never expires</span>
              </div>

              <div className="form-group">
                <label>Justification:</label>
                <textarea
                  value={overrideForm.reason}
                  onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                  placeholder="Reason for this override..."
                  rows={2}
                />
              </div>

              <button
                className="execute-button"
                onClick={handleSetOverride}
                disabled={isExecuting}
              >
                ⚡ Create Override
              </button>
            </div>
          </div>
        )}

        {activeCommand === 'guard' && (
          <div className="guard-controls">
            <h4>🛡️ Guard Mode</h4>
            <p className="guard-description">
              Guard Mode temporarily increases moderation strictness and enables auto-rollback for deployments.
            </p>

            <div className="guard-actions">
              <button
                className="guard-enable"
                onClick={() => {
                  const duration = prompt('Guard Mode duration (seconds):', '3600');
                  if (duration) {
                    executeCommand('set_override', {
                      overrideKey: 'guard_mode_active',
                      overrideType: 'feature_toggle',
                      overrideValue: { enabled: true, stricter_thresholds: true },
                      reason: 'Manual guard mode activation',
                      expiresIn: parseInt(duration),
                    });
                  }
                }}
                disabled={isExecuting}
              >
                🛡️ Enable Guard Mode
              </button>

              <button
                className="guard-disable"
                onClick={() => {
                  executeCommand('deactivate_override', {
                    overrideKey: 'guard_mode_active',
                    reason: 'Manual guard mode deactivation',
                  });
                }}
                disabled={isExecuting}
              >
                🔓 Disable Guard Mode
              </button>
            </div>

            <div className="guard-info">
              <h5>Guard Mode Effects:</h5>
              <ul>
                <li>⚡ All moderation thresholds reduced by 20%</li>
                <li>🚨 Auto-rollback enabled for deployments</li>
                <li>🛡️ Enhanced monitoring and logging</li>
                <li>⏱️ Configurable duration (auto-disables)</li>
              </ul>
            </div>
          </div>
        )}

        {!activeCommand && (
          <div className="no-command-selected">
            <p>⚡ Select a command type from the tabs above</p>
          </div>
        )}
      </div>
    </div>
  );
}
