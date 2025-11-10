import React, { useState } from 'react';
import './WatermarkSystem.css';

const WatermarkSystem = () => {
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [watermarkPosition, setWatermarkPosition] = useState('bottom-right');
  const [watermarkOpacity, setWatermarkOpacity] = useState(70);
  const [watermarkSize, setWatermarkSize] = useState('medium');
  const [activeTab, setActiveTab] = useState('preview');

  const positions = [
    { value: 'top-left', label: 'Top Left', icon: '↖️' },
    { value: 'top-right', label: 'Top Right', icon: '↗️' },
    { value: 'bottom-left', label: 'Bottom Left', icon: '↙️' },
    { value: 'bottom-right', label: 'Bottom Right', icon: '↘️' },
    { value: 'center', label: 'Center', icon: '🎯' },
  ];

  const sizes = [
    { value: 'small', label: 'Small', width: '120px' },
    { value: 'medium', label: 'Medium', width: '180px' },
    { value: 'large', label: 'Large', width: '240px' },
  ];

  const stats = {
    totalExports: 12847,
    withWatermark: 11563,
    viralReach: 4.2,
    clickThroughs: 892,
    signups: 267,
  };

  return (
    <div className="watermark-system">
      <div className="watermark-header">
        <div className="header-content">
          <h1>🎨 Watermark System</h1>
          <p className="header-subtitle">
            Free tier: "Made with ForTheWeebs" on exports · Pro tier: Remove watermark
          </p>
        </div>
        
        <div className="viral-stats-card">
          <div className="stats-icon">📈</div>
          <div className="stats-content">
            <div className="stat-big">{stats.viralReach}M</div>
            <div className="stat-label">Viral Impressions This Month</div>
            <div className="stat-breakdown">
              {stats.signups.toLocaleString()} signups from watermarks (+{Math.round((stats.signups / stats.withWatermark) * 100)}% conversion)
            </div>
          </div>
        </div>
      </div>

      <div className="watermark-tabs">
        <button 
          className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          👁️ Preview
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button 
          className={`tab ${activeTab === 'upgrade' ? 'active' : ''}`}
          onClick={() => setActiveTab('upgrade')}
        >
          ✨ Remove Watermark
        </button>
      </div>

      {activeTab === 'preview' && (
        <div className="preview-section">
          <div className="preview-container">
            <div className="preview-canvas">
              <div className="preview-content">
                <div className="preview-placeholder">
                  <div className="placeholder-icon">🎬</div>
                  <div className="placeholder-text">Your exported content preview</div>
                  <div className="placeholder-subtext">Video • Photo • Design • Audio waveform</div>
                </div>
                
                {watermarkEnabled && (
                  <div 
                    className={`watermark-preview position-${watermarkPosition} size-${watermarkSize}`}
                    style={{ opacity: watermarkOpacity / 100 }}
                  >
                    <div className="watermark-logo">🎨</div>
                    <div className="watermark-text">
                      <div className="watermark-brand">ForTheWeebs</div>
                      <div className="watermark-tagline">Made with</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="preview-controls">
              <div className="control-group">
                <label className="control-label">
                  <input 
                    type="checkbox" 
                    checked={watermarkEnabled} 
                    onChange={(e) => setWatermarkEnabled(e.target.checked)}
                  />
                  <span>Show Watermark (Free tier default)</span>
                </label>
              </div>

              <div className="control-group">
                <label className="control-label">Position</label>
                <div className="position-grid">
                  {positions.map((pos) => (
                    <button
                      key={pos.value}
                      className={`position-btn ${watermarkPosition === pos.value ? 'selected' : ''}`}
                      onClick={() => setWatermarkPosition(pos.value)}
                      disabled={!watermarkEnabled}
                    >
                      <div className="position-icon">{pos.icon}</div>
                      <div className="position-label">{pos.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-group">
                <label className="control-label">Size</label>
                <div className="size-options">
                  {sizes.map((size) => (
                    <button
                      key={size.value}
                      className={`size-btn ${watermarkSize === size.value ? 'selected' : ''}`}
                      onClick={() => setWatermarkSize(size.value)}
                      disabled={!watermarkEnabled}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-group">
                <label className="control-label">
                  Opacity: {watermarkOpacity}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(parseInt(e.target.value))}
                  className="opacity-slider"
                  disabled={!watermarkEnabled}
                />
              </div>
            </div>
          </div>

          <div className="preview-info">
            <div className="info-card viral-benefits">
              <h3>🚀 Why Watermarks Work</h3>
              <ul>
                <li><strong>Free Advertising:</strong> Every export promotes your platform</li>
                <li><strong>Viral Loop:</strong> Viewer sees watermark → clicks → signs up → creates → shares with watermark → repeat</li>
                <li><strong>Social Proof:</strong> "Made with ForTheWeebs" builds brand authority</li>
                <li><strong>Pro Upsell:</strong> Creators upgrade to Pro ($29/mo) to remove watermark</li>
                <li><strong>Zero Cost:</strong> No ad spend, pure organic growth</li>
              </ul>
            </div>

            <div className="info-card">
              <h3>💡 Best Practices</h3>
              <ul>
                <li>Keep watermark subtle (50-70% opacity)</li>
                <li>Bottom-right is industry standard</li>
                <li>Medium size balances visibility & UX</li>
                <li>Always include clickable link in description</li>
                <li>Track clicks to measure ROI</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="settings-section">
          <div className="settings-grid">
            <div className="settings-card">
              <h3>⚙️ Watermark Configuration</h3>
              <div className="settings-options">
                <div className="setting-row">
                  <div className="setting-info">
                    <strong>Auto-Apply on Free Tier</strong>
                    <p>Automatically add watermark to all free user exports</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={true} readOnly />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <strong>Allow Position Customization</strong>
                    <p>Let free users choose watermark position</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <strong>Allow Opacity Adjustment</strong>
                    <p>Let free users adjust watermark transparency</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <strong>Clickable Watermark</strong>
                    <p>Watermark links to signup page (video platforms only)</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={true} readOnly />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-row">
                  <div className="setting-info">
                    <strong>Track Analytics</strong>
                    <p>Monitor clicks, impressions, and conversions</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={true} readOnly />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="settings-card">
              <h3>🎨 Custom Branding (Pro Only)</h3>
              <div className="pro-features">
                <div className="pro-feature">
                  <div className="pro-icon">✨</div>
                  <div>
                    <strong>Remove Watermark</strong>
                    <p>Clean exports with no branding</p>
                  </div>
                </div>
                <div className="pro-feature">
                  <div className="pro-icon">🏷️</div>
                  <div>
                    <strong>Custom Watermark</strong>
                    <p>Add your own logo/brand</p>
                  </div>
                </div>
                <div className="pro-feature">
                  <div className="pro-icon">🎯</div>
                  <div>
                    <strong>White-Label Mode</strong>
                    <p>Remove all ForTheWeebs branding</p>
                  </div>
                </div>
              </div>
              <button className="btn-upgrade">
                ✨ Upgrade to Pro - $29/month
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="card-icon">📤</div>
              <div className="card-content">
                <div className="card-value">{stats.totalExports.toLocaleString()}</div>
                <div className="card-label">Total Exports</div>
                <div className="card-subtext">All time</div>
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-icon">🎨</div>
              <div className="card-content">
                <div className="card-value">{stats.withWatermark.toLocaleString()}</div>
                <div className="card-label">With Watermark</div>
                <div className="card-subtext">{Math.round((stats.withWatermark / stats.totalExports) * 100)}% of exports</div>
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-icon">👀</div>
              <div className="card-content">
                <div className="card-value">{stats.viralReach}M</div>
                <div className="card-label">Viral Reach</div>
                <div className="card-subtext">Estimated impressions</div>
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-icon">🖱️</div>
              <div className="card-content">
                <div className="card-value">{stats.clickThroughs.toLocaleString()}</div>
                <div className="card-label">Click-Throughs</div>
                <div className="card-subtext">{((stats.clickThroughs / stats.withWatermark) * 100).toFixed(2)}% CTR</div>
              </div>
            </div>

            <div className="analytics-card success-card">
              <div className="card-icon">✅</div>
              <div className="card-content">
                <div className="card-value">{stats.signups.toLocaleString()}</div>
                <div className="card-label">New Signups</div>
                <div className="card-subtext">From watermark clicks</div>
              </div>
            </div>

            <div className="analytics-card revenue-card">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <div className="card-value">$0</div>
                <div className="card-label">Ad Cost</div>
                <div className="card-subtext">100% organic growth</div>
              </div>
            </div>
          </div>

          <div className="analytics-details">
            <div className="details-card">
              <h3>📈 Growth Funnel</h3>
              <div className="funnel-visual">
                <div className="funnel-stage">
                  <div className="funnel-bar" style={{ width: '100%', background: '#8b5cf6' }}>
                    <span>Exports with Watermark</span>
                    <strong>{stats.withWatermark.toLocaleString()}</strong>
                  </div>
                </div>
                <div className="funnel-stage">
                  <div className="funnel-bar" style={{ width: '70%', background: '#ec4899' }}>
                    <span>Watermark Impressions</span>
                    <strong>{stats.viralReach}M</strong>
                  </div>
                </div>
                <div className="funnel-stage">
                  <div className="funnel-bar" style={{ width: '40%', background: '#f59e0b' }}>
                    <span>Clicked Watermark</span>
                    <strong>{stats.clickThroughs.toLocaleString()}</strong>
                  </div>
                </div>
                <div className="funnel-stage">
                  <div className="funnel-bar" style={{ width: '20%', background: '#10b981' }}>
                    <span>Signed Up</span>
                    <strong>{stats.signups.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="details-card">
              <h3>🎯 Optimization Tips</h3>
              <ul>
                <li><strong>Position matters:</strong> Bottom-right gets 2.3x more clicks than top-left</li>
                <li><strong>Size sweet spot:</strong> Medium size (180px) has best CTR</li>
                <li><strong>Opacity balance:</strong> 60-70% is visible but not annoying</li>
                <li><strong>Call-to-action:</strong> "Made with" converts better than just logo</li>
                <li><strong>Timing:</strong> Watermarks on viral content drive 10x more signups</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'upgrade' && (
        <div className="upgrade-section">
          <div className="upgrade-hero">
            <div className="upgrade-icon">✨</div>
            <h2>Remove Watermarks with Pro</h2>
            <p>Get clean, professional exports without "Made with ForTheWeebs" branding</p>
          </div>

          <div className="pricing-comparison">
            <div className="pricing-card free-tier">
              <div className="pricing-badge">Current Plan</div>
              <h3>Free</h3>
              <div className="pricing-amount">$0<span>/month</span></div>
              <ul className="pricing-features">
                <li className="feature-disabled">❌ Watermark on all exports</li>
                <li className="feature-disabled">❌ "Made with ForTheWeebs" branding</li>
                <li className="feature-disabled">❌ Limited customization</li>
                <li>✅ All core tools</li>
                <li>✅ 1GB storage</li>
              </ul>
              <button className="btn-current-plan" disabled>Current Plan</button>
            </div>

            <div className="pricing-card pro-tier">
              <div className="pricing-badge recommended">Most Popular</div>
              <h3>Pro</h3>
              <div className="pricing-amount">$29<span>/month</span></div>
              <ul className="pricing-features">
                <li className="feature-enabled">✅ No watermarks</li>
                <li className="feature-enabled">✅ Clean, professional exports</li>
                <li className="feature-enabled">✅ Custom watermarks (your logo)</li>
                <li className="feature-enabled">✅ All core tools</li>
                <li className="feature-enabled">✅ 100GB storage</li>
                <li className="feature-enabled">✅ Priority support</li>
                <li className="feature-enabled">✅ Advanced features</li>
              </ul>
              <button className="btn-upgrade-now">
                ✨ Upgrade to Pro Now
              </button>
            </div>
          </div>

          <div className="upgrade-benefits">
            <h3>Why Creators Upgrade</h3>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">🎯</div>
                <strong>Professional Branding</strong>
                <p>Your work, your brand. No third-party logos.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">💼</div>
                <strong>Client Work</strong>
                <p>Clients don't want watermarks on deliverables.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">📈</div>
                <strong>Portfolio Quality</strong>
                <p>Showcase work without distractions.</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">🏆</div>
                <strong>Competitive Edge</strong>
                <p>Stand out with clean, polished content.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatermarkSystem;
