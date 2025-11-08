const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'CreatorDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add import for AIContentStudio
content = content.replace(
  'import { FamilyAccessSystem } from "./components/FamilyAccessSystem";',
  'import { FamilyAccessSystem } from "./components/FamilyAccessSystem";\nimport { AIContentStudio } from "./components/AIContentStudio";'
);

// Add hasAIStudioAccess check after isAdmin
content = content.replace(
  'const isAdmin = userId === "owner" || userId === "admin";',
  'const isAdmin = userId === "owner" || userId === "admin";\n\n  // Check if user has access to AI Studio ($1000+ tier)\n  const hasAIStudioAccess = isAdmin || currentTier === \'SUPER_ADMIN\' || currentTier === \'super_admin\';'
);

// Add AI Studio tab after influencer tab
content = content.replace(
  '<TabsTrigger value="influencer">👑 Influencer</TabsTrigger>',
  '<TabsTrigger value="influencer">👑 Influencer</TabsTrigger>\n        {hasAIStudioAccess && (\n          <TabsTrigger value="ai-studio">🎨 AI Studio</TabsTrigger>\n        )}'
);

// Add AI Studio tab content after influencer tab content
content = content.replace(
  `<TabsContent value="influencer">
        <InfluencerVerification userId={userId} onVerified={(data) => {
          console.log('Verified as influencer:', data);
        }} />
      </TabsContent>`,
  `<TabsContent value="influencer">
        <InfluencerVerification userId={userId} onVerified={(data) => {
          console.log('Verified as influencer:', data);
        }} />
      </TabsContent>
      {hasAIStudioAccess && (
        <TabsContent value="ai-studio">
          <AIContentStudio userId={userId} tier={currentTier} />
        </TabsContent>
      )}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ CreatorDashboard.jsx updated successfully');
