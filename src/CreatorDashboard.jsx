import React, { useState } from 'react';
import { TermsOfService } from "./components/TermsOfService";
import { CreatorAgreementGate } from "./components/CreatorAgreementGate";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import { Switch } from '@radix-ui/react-switch';
// import { createClient } from '@supabase/supabase-js';
// import { queue } from '@/utils/asyncQueue';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'demo-anon-key';
// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

import { LegalDocumentsList } from "./components/LegalDocumentsList";
import TierInfo from "./components/TierInfo";
import UpgradePrompt from "./components/UpgradePrompt";
import VaultEntryList from "./components/VaultEntryList";

export const CreatorDashboard = ({ userId = "demo_user", ipAddress = "127.0.0.1", user }) => {
  const [currentTier] = useState(user?.tier || 'General Access');
  const isPolotus = user?.email === 'polotus@vanguard.tools' || user?.overrideAccess;

  // If Polotus/override, skip all onboarding/agreements and show dashboard immediately
  if (isPolotus) {
    return (
      <Tabs defaultValue="overview" className="dashboard-tabs">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="overlays">Overlays</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
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
        {userId === "owner" && (
          <TabsContent value="earnings">
            <OwnerEarningsPanel />
          </TabsContent>
        )}
      </Tabs>
    );
  }

  // Default: require onboarding/agreements for normal users
  const [tosAccepted, setTosAccepted] = useState(false);
  const [creatorAgreementAccepted, setCreatorAgreementAccepted] = useState(false);
  const version = "2025.10";

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
        <TabsTrigger value="overlays">Overlays</TabsTrigger>
        <TabsTrigger value="payments">Payments</TabsTrigger>
        <TabsTrigger value="legal">Legal</TabsTrigger>
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
      {userId === "owner" && (
        <TabsContent value="earnings">
          <OwnerEarningsPanel />
        </TabsContent>
      )}
    </Tabs>
  );
};
export const OwnerEarningsPanel = () => {
  // TODO: Replace with real backend data
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
// ...existing code...

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

// Functions moved to utils/dashboardActions.js for Fast Refresh compliance

// Stub panels for demonstration
import { useEffect } from 'react';

export const OverviewPanel = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        // Replace with your backend endpoint if available
        const res = await fetch('/api/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        if (isMounted) setStats(data);
      } catch (err) {
        if (isMounted) setStats({ error: err.message });
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Poll every 5 seconds
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Overview</h2>
      {stats ? (
        stats.error ? (
          <p style={{ color: 'red' }}>Error: {stats.error}</p>
        ) : (
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        )
      ) : (
        <p>Loading live stats...</p>
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
