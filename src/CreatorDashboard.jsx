import React, { useState } from 'react';
import { TermsOfService } from "./components/TermsOfService";
import { CreatorAgreementGate } from "./components/CreatorAgreementGate";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import { Switch } from '@radix-ui/react-switch';
// import { createClient } from '@supabase/supabase-js';
// import { queue } from '@/utils/asyncQueue';
// const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'demo-anon-key';
// ...existing code...
// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
import { LegalDocumentsList } from "./components/LegalDocumentsList";
import OwnerEarningsPanel from "./components/OwnerEarningsPanel";
import OverlayPanel from "./components/OverlayPanel";
import OverviewPanel from "./components/OverviewPanel";
import PaymentPanel from "./components/PaymentPanel";

const CreatorDashboard = ({ userId = "demo_user", ipAddress = "127.0.0.1" }) => {
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
        <section className="min-h-screen bg-black text-white px-6 py-12">
          <h1 className="text-4xl font-bold mb-6">🎛️ Creator Dashboard</h1>
          <p className="mb-4 max-w-xl">
            Welcome back. Your lore, rituals, validator memory, and remix lineage are all queryable and sovereign.
          </p>

          <ul className="space-y-4">
            <li><Link href="/lore/submit" className="underline text-purple-400">Submit New Lore</Link></li>
            <li><Link href="/rituals" className="underline text-purple-400">Join or Spawn Ritual</Link></li>
            <li><Link href="/validator/log" className="underline text-purple-400">View Validator Memory</Link></li>
            <li><Link href="/remix" className="underline text-purple-400">Track Remix Lineage</Link></li>
            <li><Link href="/legal" className="underline text-purple-400">Review Legal Slabs</Link></li>
          </ul>
        </section>

  );
}

export default CreatorDashboard;


