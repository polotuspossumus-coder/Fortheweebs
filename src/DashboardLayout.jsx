// Dashboard layout using Radix UI
import React from 'react';
import StatusPanel from './components/StatusPanel.jsx';
import BanReview from './components/BanReview.jsx';
import GovernancePanel from './components/GovernancePanel.tsx';
import { CampaignStatus } from './components/CampaignStatus.jsx';
import CampaignMetricsPanel from './components/CampaignMetricsPanel.jsx';
import CouncilFeed from './CouncilFeed.jsx';
import * as Tabs from '@radix-ui/react-tabs';
import OverlayToggle from './OverlayToggle';

export default function DashboardLayout({ children }) {
  return (
    <div style={{ padding: 32, background: '#18181b', minHeight: '100vh' }}>
      <Tabs.Root defaultValue="dashboard">
        <Tabs.List>
          <Tabs.Trigger value="dashboard">Dashboard</Tabs.Trigger>
          <Tabs.Trigger value="payments">Payments</Tabs.Trigger>
          <Tabs.Trigger value="remix">Remix</Tabs.Trigger>
          <Tabs.Trigger value="codex">Codex</Tabs.Trigger>
        </Tabs.List>
        <OverlayToggle />
  <div style={{ marginTop: 24 }}>{children}</div>
  <StatusPanel creator={{ tier: 'mythic', unlocked: true, banned: false }} />
  <BanReview />
  <GovernancePanel />
  <CampaignStatus userId={"creator_042"} />
  <CampaignMetricsPanel campaign={{ views: 1200, conversions: 87, profit: 420 }} />
  <CouncilFeed />
      </Tabs.Root>
    </div>
  );
}
