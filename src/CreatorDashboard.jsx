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

export const CreatorDashboard = ({ userId = "demo_user", ipAddress = "127.0.0.1" }) => {
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
      </TabsList>

      <TabsContent value="overview">
        <OverviewPanel />
      </TabsContent>
      <TabsContent value="overlays">
        <OverlayPanel />
      </TabsContent>
      <TabsContent value="payments">
        <PaymentPanel />
      </TabsContent>
      <TabsContent value="legal">
        <LegalDocumentsList userId={userId} />
      </TabsContent>
    </Tabs>
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

// Functions moved to utils/dashboardActions.js for Fast Refresh compliance

// Stub panels for demonstration
export const OverviewPanel = () => (
  <div style={{ padding: 24 }}>
    <h2>Overview</h2>
    <p>Creator stats and summary will appear here.</p>
  </div>
);

export const PaymentPanel = () => (
  <div style={{ padding: 24 }}>
    <h2>Payments</h2>
    <p>Payment history and actions will appear here.</p>
  </div>
);
