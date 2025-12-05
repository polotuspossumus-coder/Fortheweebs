import React, { useState } from 'react';
import './CommunityModTools.css';

const CommunityModTools = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([
    {
      id: 1,
      type: 'content',
      reportedBy: 'AnimeFan2024',
      reportedUser: 'BadActor123',
      content: 'Inappropriate comment on CGI tutorial',
      reason: 'Harassment',
      timestamp: '2 hours ago',
      status: 'pending',
      severity: 'high'
    },
    {
      id: 2,
      type: 'user',
      reportedBy: 'OtakuKing',
      reportedUser: 'Spammer99',
      content: 'Spam messages in chat',
      reason: 'Spam',
      timestamp: '5 hours ago',
      status: 'pending',
      severity: 'medium'
    },
    {
      id: 3,
      type: 'content',
      reportedBy: 'CosplayQueen',
      reportedUser: 'TrollMaster',
      content: 'Offensive artwork uploaded',
      reason: 'Inappropriate Content',
      timestamp: '1 day ago',
      status: 'reviewing',
      severity: 'high'
    }
  ]);

  const [bannedUsers, setBannedUsers] = useState([
    {
      id: 1,
      username: 'BannedUser1',
      reason: 'Multiple harassment violations',
      bannedBy: 'Admin',
      bannedDate: '2024-11-20',
      expiresDate: '2024-12-20',
      permanent: false
    },
    {
      id: 2,
      username: 'PermanentBan',
      reason: 'Illegal content distribution',
      bannedBy: 'SuperAdmin',
      bannedDate: '2024-11-15',
      permanent: true
    }
  ]);

  const [autoModRules, setAutoModRules] = useState([
    { id: 1, name: 'Block Spam Links', enabled: true, type: 'spam', action: 'delete', triggers: 234 },
    { id: 2, name: 'Filter Profanity', enabled: true, type: 'profanity', action: 'warn', triggers: 567 },
    { id: 3, name: 'Detect Harassment', enabled: true, type: 'harassment', action: 'flag', triggers: 89 },
    { id: 4, name: 'NSFW Content Filter', enabled: true, type: 'nsfw', action: 'blur', triggers: 145 }
  ]);

  const [contentQueue, setContentQueue] = useState([
    {
      id: 1,
      type: 'video',
      title: 'New CGI Animation',
      creator: 'ArtistPro',
      uploadedDate: '1 hour ago',
      flagged: true,
      flagReason: 'Potential copyright issue',
      thumbnail: 'https://via.placeholder.com/120x80/667eea/fff?text=Video'
    },
    {
      id: 2,
      type: 'image',
      title: 'Fan Art Collection',
      creator: 'DrawMaster',
      uploadedDate: '3 hours ago',
      flagged: false,
      thumbnail: 'https://via.placeholder.com/120x80/764ba2/fff?text=Image'
    }
  ]);

  const handleReportAction = (reportId, action) => {
    setReports(reports.map(r => r.id === reportId ? { ...r, status: action } : r));
  };

  const handleContentAction = (contentId, action) => {
    if (action === 'approve' || action === 'remove') {
      setContentQueue(contentQueue.filter(c => c.id !== contentId));
    }
  };

  const toggleAutoModRule = (ruleId) => {
    setAutoModRules(autoModRules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  return (
    <div className="community-mod-tools">
      <div className="mod-header">
        <h1>🛡️ Community Moderation</h1>
        <div className="mod-stats-summary">
          <div className="stat-pill"><span>Pending</span><span className="urgent">{reports.filter(r => r.status === 'pending').length}</span></div>
          <div className="stat-pill"><span>Resolved Today</span><span>45</span></div>
          <div className="stat-pill"><span>Avg Response</span><span>12 min</span></div>
        </div>
      </div>

      <div className="mod-tabs">
        <button className={`mod-tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
          📋 Reports {reports.filter(r => r.status === 'pending').length > 0 && <span className="badge">{reports.filter(r => r.status === 'pending').length}</span>}
        </button>
        <button className={`mod-tab ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>
          🎨 Content Queue
        </button>
        <button className={`mod-tab ${activeTab === 'bans' ? 'active' : ''}`} onClick={() => setActiveTab('bans')}>
          🚫 Bans
        </button>
        <button className={`mod-tab ${activeTab === 'automod' ? 'active' : ''}`} onClick={() => setActiveTab('automod')}>
          🤖 Auto-Mod
        </button>
      </div>

      <div className="mod-content">
        {activeTab === 'reports' && (
          <div className="reports-section">
            <h2>User Reports</h2>
            <div className="reports-list">
              {reports.map(report => (
                <div key={report.id} className={`report-card ${report.severity}`}>
                  <div className="report-header">
                    <span className={`severity-badge ${report.severity}`}>
                      {report.severity === 'high' ? '🔴' : '🟡'} {report.severity}
                    </span>
                    <span className={`status-badge ${report.status}`}>{report.status}</span>
                  </div>
                  <div className="report-body">
                    <p><strong>User:</strong> {report.reportedUser}</p>
                    <p><strong>By:</strong> {report.reportedBy}</p>
                    <p><strong>Reason:</strong> {report.reason}</p>
                    <p><strong>Content:</strong> {report.content}</p>
                    <p className="report-time">{report.timestamp}</p>
                  </div>
                  <div className="report-actions">
                    <button onClick={() => handleReportAction(report.id, 'investigating')} className="btn-secondary">🔍 Investigate</button>
                    <button onClick={() => handleReportAction(report.id, 'dismissed')} className="btn-neutral">Dismiss</button>
                    <button onClick={() => handleReportAction(report.id, 'resolved')} className="btn-success">✓ Resolve</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="content-section">
            <h2>Content Moderation Queue</h2>
            <div className="content-grid">
              {contentQueue.map(content => (
                <div key={content.id} className={`content-card ${content.flagged ? 'flagged' : ''}`}>
                  <div className="content-thumbnail">
                    <img src={content.thumbnail} alt={content.title} />
                    {content.flagged && <div className="flag-indicator">⚠️ FLAGGED</div>}
                  </div>
                  <div className="content-info">
                    <h4>{content.title}</h4>
                    <p>By {content.creator}</p>
                    <p className="content-meta">{content.type} • {content.uploadedDate}</p>
                    {content.flagged && <p className="flag-reason">{content.flagReason}</p>}
                  </div>
                  <div className="content-actions">
                    <button onClick={() => handleContentAction(content.id, 'approve')} className="btn-success">✓</button>
                    <button onClick={() => handleContentAction(content.id, 'review')} className="btn-secondary">👁️</button>
                    <button onClick={() => handleContentAction(content.id, 'remove')} className="btn-danger">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bans' && (
          <div className="bans-section">
            <h2>Banned Users</h2>
            <div className="bans-list">
              {bannedUsers.map(ban => (
                <div key={ban.id} className="ban-card">
                  <div className="ban-header">
                    <h4>{ban.username}</h4>
                    {ban.permanent ? <span className="ban-type permanent">PERMANENT</span> : <span className="ban-type">Expires: {ban.expiresDate}</span>}
                  </div>
                  <p><strong>Reason:</strong> {ban.reason}</p>
                  <p><strong>By:</strong> {ban.bannedBy} on {ban.bannedDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'automod' && (
          <div className="automod-section">
            <h2>Auto-Moderation Rules</h2>
            <div className="rules-list">
              {autoModRules.map(rule => (
                <div key={rule.id} className="rule-card">
                  <div className="rule-header">
                    <h4>{rule.name}</h4>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={rule.enabled} onChange={() => toggleAutoModRule(rule.id)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="rule-details">
                    <span className={`rule-type ${rule.type}`}>{rule.type}</span>
                    <span className="rule-action">{rule.action}</span>
                    <span className="rule-triggers">{rule.triggers} triggers</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityModTools;
