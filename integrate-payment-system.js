const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'CreatorDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add import for ViewerPaymentSystem
const importLine = 'import { FacialMediaSorter } from "./components/FacialMediaSorter";';
const newImport = `import { FacialMediaSorter } from "./components/FacialMediaSorter";
import { ViewerPaymentSystem } from "./components/ViewerPaymentSystem";`;

content = content.replace(importLine, newImport);

// Add payments tab to TabsList (after legal tab)
const legalTab = '<TabsTrigger value="legal">Legal</TabsTrigger>';
const paymentsTab = `<TabsTrigger value="legal">Legal</TabsTrigger>
        <TabsTrigger value="subscriptions">💳 Subscriptions</TabsTrigger>`;

content = content.replace(legalTab, paymentsTab);

// Add ViewerPaymentSystem tab content (after legal tab content)
const legalContent = `<TabsContent value="legal">
        <LegalDocumentsList userId={userId} />
      </TabsContent>`;

const newPaymentsContent = `<TabsContent value="legal">
        <LegalDocumentsList userId={userId} />
      </TabsContent>
      <TabsContent value="subscriptions">
        <ViewerPaymentSystem
          userId={userId}
          userType={isAdmin ? "creator" : "viewer"}
          tier={currentTier}
          subscriptions={[]}
        />
      </TabsContent>`;

content = content.replace(legalContent, newPaymentsContent);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Payment system integrated into CreatorDashboard.jsx!');
console.log('');
console.log('Added Features:');
console.log('  💳 Viewer Subscription System');
console.log('  🔞 $15/month adult access for viewers');
console.log('  👥 Per-creator subscription fees');
console.log('  👑 FREE access for owner + $1000 tier holders');
console.log('  ✅ Auto-access for creators');
console.log('');
console.log('Payment Tiers:');
console.log('  - Creators: FREE adult access (they create content)');
console.log('  - Viewers: $15/month for adult access');
console.log('  - Per-Creator: Each creator sets their own fee');
console.log('  - Owner + $1000 tier: FREE access to EVERYTHING');
