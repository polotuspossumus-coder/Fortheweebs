// Dashboard layout using Radix UI
import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import OverlayToggle from './OverlayToggle';

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-shell">
      <Tabs.Root defaultValue="dashboard">
        <Tabs.List className="tabs-list">
          <Tabs.Trigger value="dashboard">Dashboard</Tabs.Trigger>
          <Tabs.Trigger value="payments">Payments</Tabs.Trigger>
          <Tabs.Trigger value="remix">Remix</Tabs.Trigger>
          <Tabs.Trigger value="codex">Codex</Tabs.Trigger>
        </Tabs.List>
        <OverlayToggle />
        <div className="page-content">{children}</div>
      </Tabs.Root>
    </div>
  );
}
