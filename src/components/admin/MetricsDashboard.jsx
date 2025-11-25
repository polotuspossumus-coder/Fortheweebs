import React, { useState, useEffect } from 'react';
import './MetricsDashboard.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const MetricsDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/metrics/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setDashboard(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  };

  if (loading || !dashboard) {
    return <div className="metrics-dashboard loading">Loading metrics...</div>;
  }

  const { snapshot, security, impact, ledger } = dashboard;

  return (
    <div className="metrics-dashboard">
      <div className="dashboard-header">
        <h2>📊 Governance Metrics Dashboard</h2>
        <span className="last-updated">
          Last updated: {new Date(dashboard.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Security Summary */}
      <div className="metrics-section">
        <h3>🛡️ Security Summary</h3>
        <div className="metrics-grid">
          <div className="metric-card threat-level">
            <div className="metric-label">Threat Level</div>
            <div className={`metric-value level-${security.threatLevel.toLowerCase()}`}>
              {security.threatLevel}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Total Threats</div>
            <div className="metric-value">{security.totalThreats}</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Unauthorized Attempts</div>
            <div className="metric-value">{security.unauthorizedAttempts}</div>
            <div className="metric-subtitle">
              Last 24h: {security.last24hUnauthorized}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Blocked Actions</div>
            <div className="metric-value">{security.blockedActions}</div>
            <div className="metric-subtitle">
              Last 24h: {security.last24hBlocked}
            </div>
          </div>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="metrics-section">
        <h3>⚡ Governance Impact</h3>
        <div className="metrics-grid">
          <div className="metric-card system-health">
            <div className="metric-label">System Health</div>
            <div className="metric-value">{impact.systemHealth}%</div>
            <div className="health-bar">
              <div
                className="health-fill"
                style={{
                  width: `${impact.systemHealth}%`,
                  backgroundColor:
                    impact.systemHealth > 80
                      ? '#10b981'
                      : impact.systemHealth > 50
                      ? '#f59e0b'
                      : '#ef4444',
                }}
              />
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Total Actions</div>
            <div className="metric-value">{impact.totalActions}</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Overrides Issued</div>
            <div className="metric-value">{impact.overridesIssued}</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Policy Changes</div>
            <div className="metric-value">{impact.policyChanges}</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Queue Operations</div>
            <div className="metric-value">{impact.queueOperations}</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Avg Latency</div>
            <div className="metric-value">{impact.avgLatencyMs}ms</div>
          </div>
        </div>
      </div>

      {/* Ledger Stats */}
      {ledger && (
        <div className="metrics-section">
          <h3>📋 External Ledger</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Total Records</div>
              <div className="metric-value">{ledger.totalRecords}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Ledger Size</div>
              <div className="metric-value">{ledger.fileSizeKB} KB</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Oldest Record</div>
              <div className="metric-value metric-timestamp">
                {ledger.oldestRecord
                  ? new Date(ledger.oldestRecord).toLocaleString()
                  : 'N/A'}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Newest Record</div>
              <div className="metric-value metric-timestamp">
                {ledger.newestRecord
                  ? new Date(ledger.newestRecord).toLocaleString()
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Snapshot */}
      <div className="metrics-section">
        <h3>📈 Current Snapshot</h3>
        <div className="snapshot-table">
          <div className="snapshot-row">
            <span className="snapshot-label">Overrides Issued:</span>
            <span className="snapshot-value">{snapshot.overridesIssued}</span>
          </div>
          <div className="snapshot-row">
            <span className="snapshot-label">Unauthorized Attempts:</span>
            <span className="snapshot-value">{snapshot.unauthorizedAttempts}</span>
          </div>
          <div className="snapshot-row">
            <span className="snapshot-label">Blocked Actions:</span>
            <span className="snapshot-value">{snapshot.blockedActions}</span>
          </div>
          <div className="snapshot-row">
            <span className="snapshot-label">Policy Changes:</span>
            <span className="snapshot-value">{snapshot.policyChanges}</span>
          </div>
          <div className="snapshot-row">
            <span className="snapshot-label">Queue Operations:</span>
            <span className="snapshot-value">{snapshot.queueOperations}</span>
          </div>
          <div className="snapshot-row">
            <span className="snapshot-label">Avg Latency:</span>
            <span className="snapshot-value">{snapshot.avgLatencyMs}ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
