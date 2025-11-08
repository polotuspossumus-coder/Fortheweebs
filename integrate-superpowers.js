const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'CreatorDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add imports for all three superpower components
content = content.replace(
  'import { FamilyAccessSystem } from "./components/FamilyAccessSystem";',
  `import { FamilyAccessSystem } from "./components/FamilyAccessSystem";
import { AIContentStudio } from "./components/AIContentStudio";
import { UniversalContentGenerator } from "./components/UniversalContentGenerator";
import { FacialMediaSorter } from "./components/FacialMediaSorter";`
);

// Add hasAIStudioAccess check after isAdmin
content = content.replace(
  'const isAdmin = userId === "owner" || userId === "admin";',
  `const isAdmin = userId === "owner" || userId === "admin";

  // Check if user has access to $1000+ tier superpowers
  const hasSuperpowerAccess = isAdmin || currentTier === 'SUPER_ADMIN' || currentTier === 'super_admin';`
);

// Add AI superpowers tabs after influencer tab (create a superpower section)
content = content.replace(
  '<TabsTrigger value="influencer">👑 Influencer</TabsTrigger>',
  `<TabsTrigger value="influencer">👑 Influencer</TabsTrigger>
        {hasSuperpowerAccess && (
          <>
            <TabsTrigger value="ai-generator">⚡ AI Generator</TabsTrigger>
            <TabsTrigger value="ai-studio">🎨 AI Studio</TabsTrigger>
            <TabsTrigger value="media-sorter">👤 Face Sorter</TabsTrigger>
          </>
        )}`
);

// Add tab contents after influencer tab content
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
      {hasSuperpowerAccess && (
        <>
          <TabsContent value="ai-generator">
            <UniversalContentGenerator userId={userId} tier={currentTier} />
          </TabsContent>
          <TabsContent value="ai-studio">
            <AIContentStudio userId={userId} tier={currentTier} />
          </TabsContent>
          <TabsContent value="media-sorter">
            <FacialMediaSorter userId={userId} tier={currentTier} />
          </TabsContent>
        </>
      )}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ CreatorDashboard.jsx updated successfully with all superpowers!');
console.log('');
console.log('Added Features:');
console.log('  ⚡ Universal AI Generator - Generate ANY content from images + context');
console.log('  🎨 AI Studio - Character recognition, voice synthesis, CGI videos');
console.log('  👤 Facial Media Sorter - Group by face, auto-name, organize downloads');
console.log('');
console.log('Access: Only visible to SUPER_ADMIN tier ($1000+ holders)');
