import React, { useState, useEffect } from 'react';
import './ReferralDashboard.css';

/**
 * Enhanced Referral Dashboard
 * 
 * - Track referral earnings (10% of referred user's first unlock)
 * - Leaderboard showing top referrers
 * - Bonus incentives for bringing in paying customers
 * - Shareable referral links and QR codes
 */

export const ReferralDashboard = ({ userId }) => {
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    pendingReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    referralCode: `FTW_${userId}`.toUpperCase(),
    rank: null
  });

  const [referralHistory, setReferralHistory] = useState([
    { id: 1, username: 'user123', status: 'active', joined: '2025-11-01', earned: 25, tier: 'Full Platform' },
    { id: 2, username: 'creator456', status: 'active', joined: '2025-11-05', earned: 50, tier: 'Super Admin' },
    { id: 3, username: 'artist789', status: 'pending', joined: '2025-11-10', earned: 0, tier: 'Not unlocked yet' }
  ]);

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, username: 'TopReferrer2025', referrals: 145, earnings: 7250, badge: '👑' },
    { rank: 2, username: 'AnimeFan99', referrals: 98, earnings: 4900, badge: '🥈' },
    { rank: 3, username: 'CreatorKing', referrals: 76, earnings: 3800, badge: '🥉' },
    { rank: 4, username: 'WaifuLover', referrals: 52, earnings: 2600, badge: '' },
    { rank: 5, username: userId, referrals: 2, earnings: 75, badge: '' }  // Current user
  ]);

  const [bonusTiers, setBonusTiers] = useState([
    { threshold: 5, bonus: 50, unlocked: false, description: 'Refer 5 paying users' },
    { threshold: 10, bonus: 150, unlocked: false, description: 'Refer 10 paying users' },
    { threshold: 25, bonus: 500, unlocked: false, description: 'Refer 25 paying users' },
    { threshold: 50, bonus: 1500, unlocked: false, description: 'Refer 50 paying users' },
    { threshold: 100, bonus: 5000, unlocked: false, description: 'Refer 100 paying users' }
  ]);

  useEffect(() => {
    // Calculate total earnings
    const totalEarned = referralHistory
      .filter(r => r.status === 'active')
      .reduce((sum, r) => sum + r.earned, 0);
    
    setReferralStats(prev => ({
      ...prev,
      totalReferrals: referralHistory.length,
      activeReferrals: referralHistory.filter(r => r.status === 'active').length,
      pendingReferrals: referralHistory.filter(r => r.status === 'pending').length,
      totalEarnings: totalEarned
    }));
  }, [referralHistory]);

  const copyReferralLink = () => {
    const link = `${window.location.origin}/?ref=${referralStats.referralCode}`;
    navigator.clipboard.writeText(link);
    alert('✅ Referral link copied to clipboard!\n\n' + link);
  };

  const shareOnSocial = (platform) => {
    const link = `${window.location.origin}/?ref=${referralStats.referralCode}`;
    const text = `Join me on ForTheWeebs! Earn money creating anime content with professional tools. 🎨✨`;
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(link)}&title=${encodeURIComponent(text)}`,
      discord: link  // Copy for Discord
    };

    if (platform === 'discord') {
      copyReferralLink();
    } else {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const downloadQRCode = () => {
    alert('🚧 QR Code generation coming soon!\n\nFor now, share your referral link.');
  };

  return (
    <div className="referral-dashboard-container">
      {/* Header */}
      <div className="referral-header">
        <h1>💰 Referral Program</h1>
        <p className="header-subtitle">
          Earn 10% of every referral's first unlock. Plus bonus rewards for milestones!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <div className="stat-details">
            <span className="stat-value">{referralStats.totalReferrals}</span>
            <span className="stat-label">Total Referrals</span>
          </div>
        </div>
        
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div className="stat-details">
            <span className="stat-value">{referralStats.activeReferrals}</span>
            <span className="stat-label">Active (Paid)</span>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⏳</span>
          <div className="stat-details">
            <span className="stat-value">{referralStats.pendingReferrals}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>

        <div className="stat-card earnings">
          <span className="stat-icon">💵</span>
          <div className="stat-details">
            <span className="stat-value">${referralStats.totalEarnings}</span>
            <span className="stat-label">Total Earned</span>
          </div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="referral-link-section">
        <h2>📎 Your Referral Link</h2>
        <div className="referral-link-box">
          <div className="referral-code-display">
            <span className="code-label">Your Code:</span>
            <span className="code-value">{referralStats.referralCode}</span>
          </div>
          <div className="referral-url-display">
            <input 
              type="text" 
              value={`${window.location.origin}/?ref=${referralStats.referralCode}`}
              readOnly
              onClick={(e) => e.target.select()}
            />
            <button className="copy-button" onClick={copyReferralLink}>
              📋 Copy Link
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="share-buttons">
          <h3>Share on:</h3>
          <div className="share-buttons-grid">
            <button className="share-btn twitter" onClick={() => shareOnSocial('twitter')}>
              🐦 Twitter
            </button>
            <button className="share-btn facebook" onClick={() => shareOnSocial('facebook')}>
              👍 Facebook
            </button>
            <button className="share-btn discord" onClick={() => shareOnSocial('discord')}>
              💬 Discord
            </button>
            <button className="share-btn reddit" onClick={() => shareOnSocial('reddit')}>
              🤖 Reddit
            </button>
            <button className="share-btn qr" onClick={downloadQRCode}>
              📱 QR Code
            </button>
          </div>
        </div>
      </div>

      {/* Bonus Milestones */}
      <div className="bonus-milestones-section">
        <h2>🎁 Bonus Milestones</h2>
        <p className="section-subtitle">
          Unlock bonus rewards by referring more paying users!
        </p>
        <div className="milestone-grid">
          {bonusTiers.map((tier, index) => {
            const isUnlocked = referralStats.activeReferrals >= tier.threshold;
            const isNext = !isUnlocked && (index === 0 || bonusTiers[index - 1].unlocked);
            
            return (
              <div key={index} className={`milestone-card ${isUnlocked ? 'unlocked' : ''} ${isNext ? 'next' : ''}`}>
                <div className="milestone-icon">
                  {isUnlocked ? '✅' : '🎁'}
                </div>
                <div className="milestone-details">
                  <h4>{tier.description}</h4>
                  <p className="milestone-reward">Bonus: <strong>${tier.bonus}</strong></p>
                  <div className="milestone-progress">
                    <div 
                      className="progress-fill"
                      style={{ width: `${Math.min((referralStats.activeReferrals / tier.threshold) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="milestone-count">
                    {referralStats.activeReferrals} / {tier.threshold} referrals
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="leaderboard-section">
        <h2>🏆 Top Referrers Leaderboard</h2>
        <p className="section-subtitle">Compete for the top spot and earn bragging rights!</p>
        
        <div className="leaderboard-table">
          <div className="table-header">
            <span>Rank</span>
            <span>User</span>
            <span>Referrals</span>
            <span>Earnings</span>
          </div>
          {leaderboard.map(entry => (
            <div 
              key={entry.rank} 
              className={`table-row ${entry.username === userId ? 'current-user' : ''}`}
            >
              <span className="rank-cell">
                {entry.badge || `#${entry.rank}`}
              </span>
              <span className="user-cell">{entry.username}</span>
              <span className="referrals-cell">{entry.referrals}</span>
              <span className="earnings-cell">${entry.earnings}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Referral History */}
      <div className="referral-history-section">
        <h2>📊 Your Referral History</h2>
        <div className="history-table">
          <div className="table-header">
            <span>User</span>
            <span>Joined</span>
            <span>Tier</span>
            <span>Status</span>
            <span>Earned</span>
          </div>
          {referralHistory.map(referral => (
            <div key={referral.id} className="table-row">
              <span className="user-cell">{referral.username}</span>
              <span className="date-cell">{referral.joined}</span>
              <span className="tier-cell">{referral.tier}</span>
              <span className={`status-cell ${referral.status}`}>
                {referral.status === 'active' ? '✅ Active' : '⏳ Pending'}
              </span>
              <span className="earned-cell">
                {referral.earned > 0 ? `$${referral.earned}` : '-'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="how-it-works-section">
        <h2>💡 How Referrals Work</h2>
        <div className="how-it-works-grid">
          <div className="step-card">
            <span className="step-number">1</span>
            <h3>Share Your Link</h3>
            <p>Copy your unique referral link and share it with friends, fans, or followers.</p>
          </div>
          <div className="step-card">
            <span className="step-number">2</span>
            <h3>They Sign Up</h3>
            <p>When someone creates an account using your link, they're tracked as your referral.</p>
          </div>
          <div className="step-card">
            <span className="step-number">3</span>
            <h3>They Unlock Tools</h3>
            <p>When your referral unlocks their first tool (any price), you earn 10% commission.</p>
          </div>
          <div className="step-card">
            <span className="step-number">4</span>
            <h3>You Get Paid</h3>
            <p>Earnings are added to your balance instantly. Use them to unlock your own tools!</p>
          </div>
        </div>

        <div className="earnings-examples">
          <h3>Earnings Examples:</h3>
          <ul>
            <li>Referral unlocks <strong>Photo Tools ($25)</strong> → You earn <strong>$2.50</strong></li>
            <li>Referral unlocks <strong>Design Studio ($50)</strong> → You earn <strong>$5</strong></li>
            <li>Referral unlocks <strong>Full Platform ($500)</strong> → You earn <strong>$50</strong></li>
            <li>Referral unlocks <strong>Super Admin ($1000)</strong> → You earn <strong>$100</strong></li>
          </ul>
          <p className="earnings-note">
            💡 <strong>Pro Tip:</strong> Refer serious creators who'll unlock expensive tiers for maximum earnings!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;
