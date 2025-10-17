import React, { useState, useEffect } from 'react';
import { Suspense, lazy, useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import { Switch } from '@radix-ui/react-switch';

const TermsOfService = lazy(() => import('./components/TermsOfService'));
const CreatorAgreementGate = lazy(() => import('./components/CreatorAgreementGate'));
const LegalDocumentsList = lazy(() => import('./components/LegalDocumentsList'));
const OverlayPanel = lazy(() => import('./OverlayPanel'));
const OverviewPanel = lazy(() => import('./OverviewPanel'));
const PaymentPanel = lazy(() => import('./PaymentPanel'));
const OwnerEarningsPanel = lazy(() => import('./OwnerEarningsPanel'));
import LegalConsentWall from "./LegalConsentWall";

export const CreatorDashboard = ({ userId = "demo_user", ipAddress = "127.0.0.1" }) => {
  const [consented, setConsented] = useState(
    localStorage.getItem("fortheweebs_legal_consent") === "true"
  );

  if (!consented) {
    return <LegalConsentWall onConsent={() => setConsented(true)} />;
  }

  const [tosAccepted, setTosAccepted] = useState(false);
  const [creatorAgreementAccepted, setCreatorAgreementAccepted] = useState(false);
  const version = "2025.10";

  if (!tosAccepted) {
    return (
      <Suspense fallback={<div>Loading Terms...</div>}>
        <TermsOfService onAccept={() => setTosAccepted(true)} />
      </Suspense>
    );
  }
  if (!creatorAgreementAccepted) {
    return (
      <Suspense fallback={<div>Loading Agreement...</div>}>
        <CreatorAgreementGate
          userId={userId}
          ipAddress={ipAddress}
          version={version}
          onAccepted={() => setCreatorAgreementAccepted(true)}
        />
      </Suspense>
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
        <Suspense fallback={<div>Loading Overview...</div>}>
            {/* <OverviewPanel /> */}
        </Suspense>
      </TabsContent>
      <TabsContent value="overlays">
        <Suspense fallback={<div>Loading Overlays...</div>}>
            {/* <OverlayPanel /> */}
        </Suspense>
      </TabsContent>
      <TabsContent value="payments">
    <Suspense fallback={<div>Loading Payments...</div>}>
      <PaymentPanel />
    </Suspense>
      </TabsContent>
      <TabsContent value="legal">
        <Suspense fallback={<div>Loading Legal...</div>}>
          <LegalDocumentsList userId={userId} />
        </Suspense>
      </TabsContent>
      {userId === "owner" && (
        <TabsContent value="earnings">
          <Suspense fallback={<div>Loading Earnings...</div>}>
            <OwnerEarningsPanel />
          </Suspense>
        </TabsContent>
      )}
    </Tabs>
  );
};

// Removed OverlayPanel to avoid redeclaration errors
