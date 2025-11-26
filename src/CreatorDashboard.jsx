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
import WebXRExperience from "./components/WebXRExperience";
import VRARCreatorStudio from "./components/VRARCreatorStudio";
import Model3DViewer from "./components/Model3DViewer";
import VRRecordingStudio from "./components/VRRecordingStudio";
import ModelAssetLibrary from "./components/ModelAssetLibrary";
import ContentExportBackup from "./components/ContentExportBackup";
import CreatorCollaboration from "./components/CreatorCollaboration";
import { AIContentGenerator } from "./components/AIContentGenerator";
import AdvancedFileEditor from "./components/AdvancedFileEditor";
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
import UserProfileManager from "./components/UserProfileManager";
import SocialFeed from "./components/SocialFeed";
import CGIVideoCall from "./components/CGIVideoCall";

// New feature imports
import ThreeDModelViewer from "./components/ThreeDModelViewer";
import CollaborationRoom from "./components/CollaborationRoom";
import CloudRenderManager from "./components/CloudRenderManager";
import TimelineVideoEditor from "./components/TimelineVideoEditor";
import AssetLibrary from "./components/AssetLibrary";
import VoiceChatRoom from "./components/VoiceChatRoom";
import CreatorRevenueAnalytics from "./components/CreatorRevenueAnalytics";
import LiveStreamingStudio from "./components/LiveStreamingStudio";
import CommunityModTools from "./components/CommunityModTools";
import MerchStore from "./components/MerchStore";
import FanRewardsSystem from "./components/FanRewardsSystem";

export const CreatorDashboard = ({ userId = "demo_user", ipAddress = "127.0.0.1", tier = "free" }) => {
  // STRICT ADMIN CHECK - Only polotuspossumus@gmail.com
  const ownerEmail = localStorage.getItem('ownerEmail');
  const storedUserId = localStorage.getItem('userId');
  const isAdminUser = (ownerEmail === 'polotuspossumus@gmail.com') || (storedUserId === 'owner');
  
  const [isAdmin, setIsAdmin] = useState(isAdminUser);
  const [tosAccepted, setTosAccepted] = useState(isAdminUser ? true : false);
  const [creatorAgreementAccepted, setCreatorAgreementAccepted] = useState(isAdminUser ? true : false);
  const [currentTier] = useState(tier || 'General Access');
  const [userBalance, setUserBalance] = useState(0);
  const version = "1.8.0"; // Production version with VR/AR

  // Check if user is verified owner - STRICT CHECK
  useEffect(() => {
    const checkOwner = async () => {
      const ownerStatus = await isOwner();
      // ONLY grant admin if verified owner
      setIsAdmin(ownerStatus);
      if (ownerStatus) {
        setTosAccepted(true);
        setCreatorAgreementAccepted(true);
        console.log('👑 Owner dashboard access granted');
      } else {
        console.log('🚫 Admin access denied - not owner');
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
        <TabsTrigger value="vr-recording">🎥 VR Recording</TabsTrigger>
        <TabsTrigger value="3d-library">🧊 3D Library</TabsTrigger>
        <TabsTrigger value="backup">💾 Export/Backup</TabsTrigger>
        <TabsTrigger value="collaborate">🤝 Collaborate</TabsTrigger>
        <TabsTrigger value="ai-gen">🤖 AI Generator</TabsTrigger>
        <TabsTrigger value="file-editor">📁 File Editor</TabsTrigger>
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
        {isAdmin && (
          <TabsTrigger value="profiles">👥 User Profiles</TabsTrigger>
        )}
        <TabsTrigger value="3d-model">🧊 3D Viewer</TabsTrigger>
        <TabsTrigger value="collab-room">🤝 Collab Room</TabsTrigger>
        <TabsTrigger value="cloud-render">☁️ Cloud Render</TabsTrigger>
        <TabsTrigger value="video-editor">🎬 Video Editor</TabsTrigger>
        <TabsTrigger value="asset-lib">📦 Assets</TabsTrigger>
        <TabsTrigger value="voice-chat">🎤 Voice Chat</TabsTrigger>
        <TabsTrigger value="revenue">💰 Revenue</TabsTrigger>
        <TabsTrigger value="livestream">📡 Stream</TabsTrigger>
        <TabsTrigger value="modtools">🛡️ Community Mod</TabsTrigger>
        <TabsTrigger value="merch">👕 Merch Store</TabsTrigger>
        <TabsTrigger value="rewards">🏆 Rewards</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <SocialFeed userId={userId} userTier={currentTier} />
      </TabsContent>
      <TabsContent value="bug-fixer">
        <AIBugFixer userId={userId} />
      </TabsContent>
      <TabsContent value="profile">
        <ProfileCreator userId={userId} tier={tier} />
      </TabsContent>
      <TabsContent value="cgi-video">
        <ToolLockGate userId={userId} toolId="cgi">
          <div>
            <CGIVideoCall />
          </div>
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
          <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
            <div style={{
              maxWidth: '1400px',
              margin: '0 auto',
              padding: '40px 20px'
            }}>
              <h2 style={{
                fontSize: '36px',
                marginBottom: '10px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                🥽 VR/AR Creator Studio
              </h2>
              <p style={{ color: '#aaa', fontSize: '18px', marginBottom: '30px' }}>
                Build immersive VR worlds and AR experiences - Better than Unity for creators
              </p>

              <Tabs defaultValue="creator-studio" style={{ marginTop: '20px' }}>
                <TabsList style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.05)' }}>
                  <TabsTrigger value="creator-studio">🎨 Creator Studio</TabsTrigger>
                  <TabsTrigger value="3d-viewer">🧊 3D Viewer</TabsTrigger>
                  <TabsTrigger value="vr-experience">🥽 VR Experience</TabsTrigger>
                  <TabsTrigger value="ar-experience">📱 AR Experience</TabsTrigger>
                  <TabsTrigger value="legacy">⚙️ Legacy Tools</TabsTrigger>
                </TabsList>

                <TabsContent value="creator-studio">
                  <VRARCreatorStudio userId={userId} />
                </TabsContent>

                <TabsContent value="3d-viewer">
                  <Model3DViewer userId={userId} />
                </TabsContent>

                <TabsContent value="vr-experience">
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    padding: '30px',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>
                      🥽 VR Experience Preview
                    </h3>
                    <p style={{ color: '#aaa', marginBottom: '20px' }}>
                      Test your content in full VR. Compatible with Meta Quest, HTC VIVE, Valve Index, PSVR.
                    </p>
                    <div style={{
                      background: '#000',
                      borderRadius: '15px',
                      overflow: 'hidden',
                      border: '2px solid #667eea'
                    }}>
                      <WebXRExperience mode="vr" userId={userId} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ar-experience">
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    padding: '30px',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>
                      📱 AR Experience Preview
                    </h3>
                    <p style={{ color: '#aaa', marginBottom: '20px' }}>
                      Place your content in the real world. Works on iPhone (ARKit) and Android (ARCore).
                    </p>
                    <div style={{
                      background: '#000',
                      borderRadius: '15px',
                      overflow: 'hidden',
                      border: '2px solid #22c55e'
                    }}>
                      <WebXRExperience mode="ar" userId={userId} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="legacy">
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    padding: '30px'
                  }}>
                    <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>
                      ⚙️ Legacy AR/VR Studio Pro
                    </h3>
                    <p style={{ color: '#aaa', marginBottom: '20px' }}>
                      Original professional interface (maintained for compatibility)
                    </p>
                    <ARVRStudioPro userId={userId} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="vr-recording">
        <ToolLockGate userId={userId} toolId="arvr">
          <VRRecordingStudio userId={userId} />
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="3d-library">
        <ToolLockGate userId={userId} toolId="arvr">
          <ModelAssetLibrary userId={userId} />
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="backup">
        <ContentExportBackup userId={userId} />
      </TabsContent>
      <TabsContent value="collaborate">
        <CreatorCollaboration userId={userId} />
      </TabsContent>
      <TabsContent value="ai-gen">
        <ToolLockGate userId={userId} toolId="arvr">
          <AIContentGenerator userId={userId} />
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="file-editor">
        <AdvancedFileEditor userId={userId} />
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
      {isAdmin && (
        <TabsContent value="profiles">
          <UserProfileManager />
        </TabsContent>
      )}
      <TabsContent value="3d-model">
        <ThreeDModelViewer userId={userId} />
      </TabsContent>
      <TabsContent value="collab-room">
        <CollaborationRoom userId={userId} />
      </TabsContent>
      <TabsContent value="cloud-render">
        <CloudRenderManager userId={userId} />
      </TabsContent>
      <TabsContent value="video-editor">
        <TimelineVideoEditor userId={userId} />
      </TabsContent>
      <TabsContent value="asset-lib">
        <AssetLibrary userId={userId} />
      </TabsContent>
      <TabsContent value="voice-chat">
        <VoiceChatRoom userId={userId} />
      </TabsContent>
      <TabsContent value="revenue">
        <CreatorRevenueAnalytics userId={userId} />
      </TabsContent>
      <TabsContent value="livestream">
        <LiveStreamingStudio userId={userId} />
      </TabsContent>
      <TabsContent value="modtools">
        <CommunityModTools userId={userId} />
      </TabsContent>
      <TabsContent value="merch">
        <MerchStore userId={userId} />
      </TabsContent>
      <TabsContent value="rewards">
        <FanRewardsSystem userId={userId} />
      </TabsContent>
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
