import React, { useState, useEffect } from 'react';
import './CreatorDashboard.css';
import './components/TipsAndDonations.css';
import './components/CommissionMarketplace.css';
import './components/PremiumSubscription.css';
import { TermsOfService } from "./components/TermsOfService";
import { CreatorAgreementGate } from "./components/CreatorAgreementGate";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import { Switch } from '@radix-ui/react-switch';
import { LegalDocumentsList } from "./components/LegalDocumentsList";
import TierInfo from "./components/TierInfo";
import UpgradePrompt from "./components/UpgradePrompt";
import VaultEntryList from "./components/VaultEntryList";
import { ARVRStudioPro } from "./components/ARVRStudioPro";
import { PhotoToolsHub } from "./components/PhotoToolsHub";
import { ContentPlannerPro } from "./components/ContentPlannerPro";
import { InfluencerVerification } from "./components/InfluencerVerification";
import { FamilyAccessSystem } from "./components/FamilyAccessSystem";
import { AudioProductionStudioPro } from "./components/AudioProductionStudioPro";
import GraphicDesignSuitePro from "./components/GraphicDesignSuitePro";
import { PrintOnDemand } from "./components/PrintOnDemand";
import { TradingCardDesigner } from "./components/TradingCardDesigner";
import { TipsAndDonations } from "./components/TipsAndDonations";
import CommissionMarketplace from "./components/CommissionMarketplace";
import { PremiumSubscription } from "./components/PremiumSubscription";
import NotificationBadge from "./notifications/NotificationBadge";
import MessageBadge from "./messaging/MessageBadge";
import MessagingSystem from "./messaging/MessagingSystem";
import AdvancedSearch from "./components/AdvancedSearch";
import ModerationDashboard from "./components/ModerationDashboard";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import MicoDevPanel from "./components/MicoDevPanel";

import { ToolLockGate } from "./components/ToolLockGate";
import { DevBalanceManager } from "./components/DevBalanceManager";
import { getUserBalance } from "./utils/toolUnlockSystem";
import { ProfileCreator } from "./components/ProfileCreator";
import { AIVideoGenerator } from "./components/AIVideoGenerator";
import { ProPhotoEditor } from "./components/ProPhotoEditor";
import { AIBugFixer } from "./components/AIBugFixer";
import { LanguageSelector } from "./components/LanguageSelector";
import { t } from "./utils/i18n";
import DeviceManager from "./components/DeviceManager";
import { isOwner } from "./utils/ownerAuth";

export const CreatorDashboard = ({ userId = "demo_user", ipAddress = "127.0.0.1", tier = "free" }) => {
  const [isAdmin, setIsAdmin] = useState(userId === "owner" || userId === "admin");
  const [tosAccepted, setTosAccepted] = useState(isAdmin ? true : false);
  const [creatorAgreementAccepted, setCreatorAgreementAccepted] = useState(isAdmin ? true : false);
  const [currentTier] = useState(tier || 'General Access');
  const [userBalance, setUserBalance] = useState(0);
  const [showMessages, setShowMessages] = useState(false);
  const version = "2025.11"; // Cache bust

  // Check if user is verified owner
  useEffect(() => {
    const checkOwner = async () => {
      const ownerStatus = await isOwner();
      setIsAdmin(ownerStatus || userId === "owner" || userId === "admin");
      if (ownerStatus) {
        setTosAccepted(true);
        setCreatorAgreementAccepted(true);
        console.log('👑 Owner dashboard access granted');
      }
    };
    checkOwner();
  }, [userId]);

  // Load user balance on mount
  useEffect(() => {
    const balance = getUserBalance(userId);
    setUserBalance(balance);
  }, [userId]);

  // Check for pending family access code (client-side only)
  useEffect(() => {
    const pendingCode = localStorage.getItem('pending_family_code');
    if (pendingCode) {
      console.log('🎁 Redeeming family access code:', pendingCode);

      // Grant family access immediately (client-side)
      localStorage.setItem(`family_access_${userId}`, pendingCode);
      localStorage.setItem('family_access_type', 'free');
      localStorage.removeItem('pending_family_code');

      // Show success message
      setTimeout(() => {
        alert(`🎉 Welcome to ForTheWeebs!\n\nYour family access has been activated!\n\n✅ You now have FULL FREE ACCESS to all features!\n\n🚀 Start exploring your dashboard!`);
      }, 500);

      console.log('✅ Family access granted!');
    }
  }, [userId]);

  if (!tosAccepted) {
    return <TermsOfService onAccept={() => setTosAccepted(true)} />;
  }
  if (!creatorAgreementAccepted) {
    return (
      <CreatorAgreementGate
        userId={userId}
        ipAddress={ipAddress}
        version={version}
        onAccepted={() => setCreatorAgreementAccepted(true)}
      />
    );
  }
  return (
    <Tabs defaultValue="overview" className="dashboard-tabs">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        {!isAdmin && <TabsTrigger value="bug-fixer">🐛 Report Bug</TabsTrigger>}
        <TabsTrigger value="profile">👤 My Profile</TabsTrigger>
        <TabsTrigger value="cgi-video">🎬 CGI Video</TabsTrigger>
        <TabsTrigger value="photos">📸 Photo Tools</TabsTrigger>
        <TabsTrigger value="music">🎵 Audio Production</TabsTrigger>
        <TabsTrigger value="design">🎨 Graphic Design</TabsTrigger>
        <TabsTrigger value="planner">📅 Content Planner</TabsTrigger>
        <TabsTrigger value="arvr">🎭 AR/VR Studio</TabsTrigger>
        {!isAdmin && <TabsTrigger value="influencer">👑 Influencer</TabsTrigger>}
        <TabsTrigger value="overlays">Overlays</TabsTrigger>
        <TabsTrigger value="shop">📦 Print Shop</TabsTrigger>
        {!isAdmin && <TabsTrigger value="tips">☕ Tips</TabsTrigger>}
        {!isAdmin && <TabsTrigger value="commissions">💼 Commissions</TabsTrigger>}
        {!isAdmin && <TabsTrigger value="premium">💎 Premium</TabsTrigger>}
        {userBalance > 0 && <TabsTrigger value="payments">Payments</TabsTrigger>}
        {!isAdmin && <TabsTrigger value="legal">Legal</TabsTrigger>}
        {userId === "owner" && (
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        )}
        {userId === "owner" && (
          <TabsTrigger value="devices">🔐 Devices</TabsTrigger>
        )}
        {userId === "owner" && (
          <TabsTrigger value="moderation">🛡️ Moderation</TabsTrigger>
        )}
        {userId === "owner" && (
          <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
        )}
        {userId === "owner" && (
          <TabsTrigger value="mico">🧠 Mico</TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="overview">
        <div style={{ marginBottom: '24px' }}>
          <AdvancedSearch />
        </div>
        <OverviewPanel userId={userId} />
      </TabsContent>
      <TabsContent value="bug-fixer">
        <AIBugFixer userId={userId} />
      </TabsContent>
      <TabsContent value="profile">
        <ProfileCreator userId={userId} tier={tier} />
      </TabsContent>
      <TabsContent value="cgi-video">
        <ToolLockGate userId={userId} toolId="cgi">
          <AIVideoGenerator userId={userId} tier={tier} />
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="photos">
        <ToolLockGate userId={userId} toolId="photo">
          <PhotoToolsHub userId={userId} />
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="music">
        <ToolLockGate userId={userId} toolId="audio">
          <AudioProductionStudioPro userId={userId} />
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="design">
        <ToolLockGate userId={userId} toolId="design">
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>🎨 Design Tools</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <button
                style={{
                  padding: '1.5rem',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '2px solid #8b5cf6',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => document.querySelector('[value="design-studio"]')?.click()}
              >
                🎨 Graphic Design Studio
              </button>
              <button
                style={{
                  padding: '1.5rem',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '2px solid #8b5cf6',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => document.querySelector('[value="cards"]')?.click()}
              >
                🎴 Trading Card Designer
              </button>
            </div>
          </div>
          <Tabs defaultValue="design-studio">
            <TabsList style={{ marginBottom: '2rem' }}>
              <TabsTrigger value="design-studio">Graphic Design</TabsTrigger>
              <TabsTrigger value="cards">Trading Cards</TabsTrigger>
            </TabsList>
            <TabsContent value="design-studio">
              <GraphicDesignSuitePro />
            </TabsContent>
            <TabsContent value="cards">
              <TradingCardDesigner userId={userId} />
            </TabsContent>
          </Tabs>
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="planner">
        <ContentPlannerPro userId={userId} />
      </TabsContent>
      <TabsContent value="arvr">
        <ToolLockGate userId={userId} toolId="arvr">
          <ARVRStudioPro userId={userId} />
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="influencer">
        <InfluencerVerification userId={userId} onVerified={(data) => {
          console.log('Verified as influencer:', data);
        }} />
      </TabsContent>
      <TabsContent value="overlays">
        <OverlayPanel />
        <div style={{ marginTop: 32 }}>
          <h3>Your Vault Entries</h3>
          <VaultEntryList userId={userId} />
        </div>
      </TabsContent>
      <TabsContent value="shop">
        <PrintOnDemand />
      </TabsContent>
      <TabsContent value="tips">
        <TipsAndDonations creatorId={userId} creatorName={userId} />
      </TabsContent>
      <TabsContent value="commissions">
        <CommissionMarketplace userId={userId} isCreator={true} />
      </TabsContent>
      <TabsContent value="premium">
        <PremiumSubscription userId={userId} currentTier={currentTier} />
      </TabsContent>
      <TabsContent value="payments">
        <PaymentPanel />
      </TabsContent>
      <TabsContent value="legal">
        <LegalDocumentsList userId={userId} />
      </TabsContent>
      {isAdmin && (
        <TabsContent value="family-access">
          <FamilyAccessSystem userId={userId} isAdmin={isAdmin} />
        </TabsContent>
      )}
      {userId === "owner" && (
        <TabsContent value="earnings">
          <OwnerEarningsPanel />
        </TabsContent>
      )}
      {userId === "owner" && (
        <TabsContent value="devices">
          <DeviceManager isOwner={true} />
        </TabsContent>
      )}
      {userId === "owner" && (
        <TabsContent value="moderation">
          <ModerationDashboard />
        </TabsContent>
      )}
      {userId === "owner" && (
        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>
      )}
      {userId === "owner" && (
        <TabsContent value="mico">
          <MicoDevPanel />
        </TabsContent>
      )}
    </Tabs>
  );
};

export const OwnerEarningsPanel = () => {
  const [topEarners] = useState([
    { username: "creator1", profit: 1200 },
    { username: "creator2", profit: 950 },
    { username: "creator3", profit: 800 },
  ]);
  return (
    <div style={{ padding: 24 }}>
      <h2>Top Earning Creators</h2>
      <ul>
        {topEarners.map((c) => (
          <li key={c.username}>
            <strong>{c.username}</strong>: ${c.profit.toLocaleString()}
          </li>
        ))}
      </ul>
      <p style={{ marginTop: 24, color: '#888' }}>
        Only visible to platform owner. Replace with real data for live tracking.
      </p>
    </div>
  );
};

export const OverlayPanel = () => {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="overlay-panel">
      <label className="overlay-label">
        Anime Overlay Enabled
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </label>
    </div>
  );
};

export const OverviewPanel = ({ userId }) => {
  const [showTutorial, setShowTutorial] = useState(() => {
    // Check if user has dismissed tutorial
    return localStorage.getItem(`tutorial_dismissed_${userId}`) !== 'true';
  });

  const dismissTutorial = () => {
    localStorage.setItem(`tutorial_dismissed_${userId}`, 'true');
    setShowTutorial(false);
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Messages Modal */}
      {showMessages && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '1200px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowMessages(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                fontSize: '2rem',
                cursor: 'pointer',
                color: '#666',
                zIndex: 10000
              }}
            >
              ×
            </button>
            <MessagingSystem />
          </div>
        </div>
      )}

      {/* Clean Welcome Header */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: '#fff',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>
            Welcome Back! 👋
          </h2>
          <p style={{ opacity: 0.9, fontSize: '14px' }}>
            All your creative tools are ready to use
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <MessageBadge onClick={() => setShowMessages(true)} />
          <NotificationBadge />
        </div>
      </div>

      {/* Optional Tutorial (dismissable) */}
      {showTutorial && (
        <div style={{
          background: 'rgba(0, 255, 255, 0.05)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(0, 255, 255, 0.2)',
          marginBottom: '20px',
          position: 'relative',
        }}>
          <button
            onClick={dismissTutorial}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '5px 10px',
            }}
          >
            ✕
          </button>

          <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', color: '#0ff' }}>
            🎓 Quick Start Guide
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginTop: '15px',
          }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
              <strong style={{ color: '#0ff' }}>📸 Photo Editor</strong>
              <p style={{ fontSize: '13px', opacity: 0.8, marginTop: '5px' }}>
                Layers, masks, blend modes - professional editing power
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
              <strong style={{ color: '#0ff' }}>🎬 CGI Video</strong>
              <p style={{ fontSize: '13px', opacity: 0.8, marginTop: '5px' }}>
                Turn photos into AI-generated videos
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
              <strong style={{ color: '#0ff' }}>🎵 Audio Studio</strong>
              <p style={{ fontSize: '13px', opacity: 0.8, marginTop: '5px' }}>
                Multi-track recording with pro effects
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
              <strong style={{ color: '#0ff' }}>👤 Profile</strong>
              <p style={{ fontSize: '13px', opacity: 0.8, marginTop: '5px' }}>
                MySpace-style with music libraries
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Cards - No Marketing Fluff */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          padding: '20px',
          borderRadius: '12px',
          color: '#fff',
          cursor: 'pointer',
        }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>📸 Photo Tools</h3>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            Pro Editor • Mass Processor • Filters
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb, #f5576c)',
          padding: '20px',
          borderRadius: '12px',
          color: '#fff',
          cursor: 'pointer',
        }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>🎵 Audio</h3>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            Multi-track • Effects • Export
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
          padding: '20px',
          borderRadius: '12px',
          color: '#fff',
          cursor: 'pointer',
        }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>🎬 CGI Video</h3>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            Photo → Style → Video
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
          padding: '20px',
          borderRadius: '12px',
          color: '#fff',
          cursor: 'pointer',
        }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>👤 Profile</h3>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            Showcase • Music • Content
          </p>
        </div>
      </div>

      {/* Dev balance manager - OWNER ONLY */}
      {userId === "owner" && (
        <div style={{ marginTop: '20px' }}>
          <DevBalanceManager userId={userId} />
        </div>
      )}
    </div>
  );
};

export const PaymentPanel = () => (
  <div style={{ padding: 24 }}>
    <h2>Payments</h2>
    <p>Payment history and actions will appear here.</p>
  </div>
);
