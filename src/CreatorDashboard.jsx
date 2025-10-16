import React from 'react';

// Workspace editor copy — replaced with a minimal, valid placeholder to avoid
// parse/lint errors. The real component lives in `src/CreatorDashboard.jsx`.
export default function CreatorDashboard() {
  return (
    <div className="creator-dashboard-placeholder">
      <h1>Creator Dashboard (editor copy placeholder)</h1>
      <p>This file is an editor artifact. The canonical component is in /src.</p>
    </div>
  );
}
    <div className="panel overlay-panel">
      <label className="overlay-label">
        Anime Overlay Enabled
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </label>
    </div>
  );
}

export function OverviewPanel() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        if (isMounted) setStats(data);
      } catch (err) {
        if (isMounted) setStats({ error: err.message });
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  import React from 'react';

  // Replace the large editor-shelf copy with a tiny, valid placeholder. This
  // file is only a workspace editor artifact; the real source is in /src.
  export default function CreatorDashboardPlaceholder() {
    return (
      <div className="creator-dashboard-editor-placeholder">
        <p>Editor copy placeholder — ignore.</p>
      </div>
    );
  }
}

export function OverlayPanel() {
  const [enabled, setEnabled] = useState(true);
  return (
    <div className="panel overlay-panel">
      <label className="overlay-label">
        Anime Overlay Enabled
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </label>
    </div>
  );
}

export function OverviewPanel() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        if (isMounted) setStats(data);
      } catch (err) {
        if (isMounted) setStats({ error: err.message });
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  return (
    <div className="panel">
      <h2>Overview</h2>
      {stats ? (
        stats.error ? <p className="error-msg">Error: {stats.error}</p> : <pre>{JSON.stringify(stats, null, 2)}</pre>
      ) : (<p>Loading live stats...</p>)}
    </div>
  );
}

export function PaymentPanel() {
  return (
    <div className="panel">
      <h2>Payments</h2>
      <p>Payment history and actions will appear here.</p>
    </div>
  );
}
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
          {userId === "owner" && (
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          )}
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
        {userId === "owner" && (
          <TabsContent value="earnings">
            <OwnerEarningsPanel />
          </TabsContent>
        )}
      </Tabs>
    );
export const OwnerEarningsPanel = () => {
  // TODO: Replace with real backend data
  const [topEarners, setTopEarners] = useState([
    { username: "creator1", profit: 1200 },
    { username: "creator2", profit: 950 },
    { username: "creator3", profit: 800 },
  ]);
  return (
    <div className="panel">
      <h2>Top Earning Creators</h2>
      <ul>
        {topEarners.map((c) => (
          <li key={c.username}>
            <strong>{c.username}</strong>: ${c.profit.toLocaleString()}
          </li>
        ))}
      </ul>
      <p className="muted">
        Only visible to platform owner. Replace with real data for live tracking.
      </p>
    </div>
  );
};
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
    <div className="panel">
      <h2>Overview</h2>
      {stats ? (
        stats.error ? (
          <p className="error-msg">Error: {stats.error}</p>
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
  <div className="panel">
    <h2>Payments</h2>
    <p>Payment history and actions will appear here.</p>
  </div>
);
