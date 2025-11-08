import React, { useState, useEffect } from 'react';
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

export const CreatorDashboard = ({ userId = "demo_user", ipAddress = "127.0.0.1", tier = "free" }) => {
  const [tosAccepted, setTosAccepted] = useState(false);
  const [creatorAgreementAccepted, setCreatorAgreementAccepted] = useState(false);
  const [currentTier] = useState(tier || 'General Access');
  const version = "2025.10";
  const isAdmin = userId === "owner" || userId === "admin";

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
        <TabsTrigger value="planner">📅 Content Planner</TabsTrigger>
        <TabsTrigger value="arvr">🎭 AR/VR Studio</TabsTrigger>
        <TabsTrigger value="influencer">👑 Influencer</TabsTrigger>
        <TabsTrigger value="overlays">Overlays</TabsTrigger>
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
        <PhotoToolsHub userId={userId} />
      </TabsContent>
      <TabsContent value="planner">
        <ContentPlanner userId={userId} />
      </TabsContent>
      <TabsContent value="arvr">
        <ARVRContentPanelWithPaywall userId={userId} />
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
    </div>
  );
};

export const PaymentPanel = () => (
  <div style={{ padding: 24 }}>
    <h2>Payments</h2>
    <p>Payment history and actions will appear here.</p>
  </div>
);
