import React from 'react';
import './FeatureDisabledBanner.css';

/**
 * Banner shown when features are disabled pending API keys
 */
export default function FeatureDisabledBanner({ features }) {
  if (!features || features.loading) {
    return null;
  }

  const hasSocialMedia = features.socialMedia;
  const hasCreatorEconomy = features.creatorEconomy;

  if (hasSocialMedia && hasCreatorEconomy) {
    return null; // All features enabled
  }

  const disabledFeatures = [];
  if (!hasSocialMedia) disabledFeatures.push('Social Media Platform');
  if (!hasCreatorEconomy) disabledFeatures.push('Creator Economy');

  return (
    <div className="feature-disabled-banner">
      <div className="banner-content">
        <div className="banner-icon">🔒</div>
        <div className="banner-text">
          <h3>Some Features Are Currently Disabled</h3>
          <p>
            <strong>{disabledFeatures.join(' and ')}</strong> will be available soon.
          </p>
          {features.disabled && features.disabled.length > 0 && (
            <details className="banner-details">
              <summary>Why are these features disabled?</summary>
              <ul>
                {features.disabled.map((item, i) => (
                  <li key={i}>
                    <strong>{item.feature}:</strong> {item.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
        <div className="banner-actions">
          <div className="available-now">
            <div className="badge success">✅ Available Now</div>
            <ul className="available-list">
              <li>🎨 20+ Creator Tools</li>
              <li>🤖 AI-Powered Tools</li>
              <li>📊 Analytics Dashboard</li>
              <li>🎯 Content Generator</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline feature blocker for specific components
 */
export function FeatureBlocker({ feature, features, children }) {
  if (!features || features.loading) {
    return (
      <div className="feature-loading">
        <div className="spinner">⏳</div>
        <p>Loading features...</p>
      </div>
    );
  }

  const isEnabled = feature === 'socialMedia'
    ? features.socialMedia
    : feature === 'creatorEconomy'
    ? features.creatorEconomy
    : true;

  if (isEnabled) {
    return children;
  }

  const disabledItem = features.disabled?.find(d =>
    d.feature.toLowerCase().includes(feature.toLowerCase())
  );

  return (
    <div className="feature-blocked">
      <div className="blocked-overlay">
        <div className="blocked-icon">🔒</div>
        <h3>This Feature Is Coming Soon</h3>
        <p>{disabledItem?.reason || 'This feature is temporarily disabled'}</p>
        <div className="blocked-hint">
          <strong>For Admins:</strong> Configure the required API keys to enable this feature.
        </div>
      </div>
    </div>
  );
}
