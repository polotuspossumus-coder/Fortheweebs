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
import { ARVRContentPanelWithPaywall } from "./components/ARVRContentPanelWithPaywall";
import { PhotoToolsHub } from "./components/PhotoToolsHub";
import { ContentPlanner } from "./components/ContentPlanner";
import { InfluencerVerification } from "./components/InfluencerVerification";
import { FamilyAccessSystem } from "./components/FamilyAccessSystem";
import { AudioProductionStudio } from "./components/AudioProductionStudio";
import { ComicBookCreator } from "./components/ComicBookCreator";
import { GraphicDesignStudio } from "./components/GraphicDesignStudio";
import { PrintOnDemand } from "./components/PrintOnDemand";
import { TradingCardDesigner } from "./components/TradingCardDesigner";
import { TipsAndDonations } from "./components/TipsAndDonations";
import { CommissionMarketplace } from "./components/CommissionMarketplace";
import { PremiumSubscription } from "./components/PremiumSubscription";
import { ToolLockGate } from "./components/ToolLockGate";
import { DevBalanceManager } from "./components/DevBalanceManager";
import { getUserBalance } from "./utils/toolUnlockSystem";

export const CreatorDashboard = ({ userId = "demo_user", ipAddress = "127.0.0.1", tier = "free" }) => {
  const [tosAccepted, setTosAccepted] = useState(false);
  const [creatorAgreementAccepted, setCreatorAgreementAccepted] = useState(false);
  const [currentTier] = useState(tier || 'General Access');
  const [userBalance, setUserBalance] = useState(0);
  const version = "2025.10";
  const isAdmin = userId === "owner" || userId === "admin";

  // Load user balance on mount
  useEffect(() => {
    const balance = getUserBalance(userId);
    setUserBalance(balance);
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
        <TabsTrigger value="photos">📸 Photo Tools</TabsTrigger>
        <TabsTrigger value="music">🎵 Music Studio</TabsTrigger>
        <TabsTrigger value="comics">📚 Comic Creator</TabsTrigger>
        <TabsTrigger value="design">🎨 Graphic Design</TabsTrigger>
        <TabsTrigger value="planner">📅 Content Planner</TabsTrigger>
        <TabsTrigger value="arvr">🎭 AR/VR Studio</TabsTrigger>
        <TabsTrigger value="influencer">👑 Influencer</TabsTrigger>
        <TabsTrigger value="overlays">Overlays</TabsTrigger>
        <TabsTrigger value="shop">📦 Print Shop</TabsTrigger>
        <TabsTrigger value="tips">☕ Tips</TabsTrigger>
        <TabsTrigger value="commissions">💼 Commissions</TabsTrigger>
        <TabsTrigger value="premium">💎 Premium</TabsTrigger>
        <TabsTrigger value="payments">Payments</TabsTrigger>
        <TabsTrigger value="legal">Legal</TabsTrigger>
        {isAdmin && (
          <TabsTrigger value="family-access">🎁 Family Access</TabsTrigger>
        )}
        {userId === "owner" && (
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="overview">
        <div style={{ marginBottom: 32 }}>
          <TierInfo currentTier={currentTier} />
          <UpgradePrompt userId={userId} currentTier={currentTier} />
        </div>
        <OverviewPanel />
      </TabsContent>
      <TabsContent value="photos">
        <ToolLockGate userId={userId} toolId="photo">
          <PhotoToolsHub userId={userId} />
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="music">
        <ToolLockGate userId={userId} toolId="audio">
          <AudioProductionStudio userId={userId} />
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="comics">
        <ToolLockGate userId={userId} toolId="comics">
          <ComicBookCreator userId={userId} />
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
            <GraphicDesignStudio userId={userId} />
          </TabsContent>
          <TabsContent value="cards">
            <TradingCardDesigner userId={userId} />
          </TabsContent>
        </Tabs>
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="planner">
        <ContentPlanner userId={userId} />
      </TabsContent>
      <TabsContent value="arvr">
        <ToolLockGate userId={userId} toolId="arvr">
          <ARVRContentPanelWithPaywall userId={userId} />
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

export const OverviewPanel = () => {
  const stats = {
    totalUploads: 0,
    storageUsed: '0 MB',
    accountAge: 'Just started',
    tier: 'Free'
  };

  return (
    <div style={{ padding: '32px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: '#fff' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '2rem', fontWeight: '800' }}>📊 Dashboard Overview</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px' }}>{stats.totalUploads}</div>
          <div style={{ opacity: 0.9 }}>Total Uploads</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px' }}>{stats.storageUsed}</div>
          <div style={{ opacity: 0.9 }}>Storage Used</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px' }}>✨</div>
          <div style={{ opacity: 0.9 }}>{stats.tier} Tier</div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '24px', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.3rem' }}>🎉 Welcome to ForTheWeebs!</h3>
        <p style={{ lineHeight: '1.6', opacity: 0.9 }}>
          Your creator platform is ready! Explore the tabs above to access photo tools, content planning, AR/VR studio, and more.
          Upgrade to unlock premium features and advanced tools.
        </p>
      </div>

      {/* Dev balance manager - only shows in development */}
      <DevBalanceManager userId={userId} />
    </div>
  );
};

export const PaymentPanel = () => (
  <div style={{ padding: 24 }}>
    <h2>Payments</h2>
    <p>Payment history and actions will appear here.</p>
  </div>
);
