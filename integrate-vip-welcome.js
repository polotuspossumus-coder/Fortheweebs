const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'CreatorDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add import for VIPWelcomeLetter
const viewerPaymentImport = 'import { ViewerPaymentSystem } from "./components/ViewerPaymentSystem";';
const newImport = `import { ViewerPaymentSystem } from "./components/ViewerPaymentSystem";
import { VIPWelcomeLetter } from "./components/VIPWelcomeLetter";`;

content = content.replace(viewerPaymentImport, newImport);

// Add state for VIP welcome letter display
const hasSuperpowerAccessLine = 'const hasSuperpowerAccess = isAdmin || currentTier === \'SUPER_ADMIN\' || currentTier === \'super_admin\';';
const newStateLines = `const hasSuperpowerAccess = isAdmin || currentTier === 'SUPER_ADMIN' || currentTier === 'super_admin';

  // VIP Welcome Letter - show once for $1000 tier holders
  const [showVIPWelcome, setShowVIPWelcome] = useState(() => {
    if (!hasSuperpowerAccess || isAdmin) return false; // Don't show for owner
    const hasSeenWelcome = localStorage.getItem('vip_welcome_seen');
    return !hasSeenWelcome;
  });

  const handleDismissVIPWelcome = () => {
    localStorage.setItem('vip_welcome_seen', 'true');
    setShowVIPWelcome(false);
  };`;

content = content.replace(hasSuperpowerAccessLine, newStateLines);

// Add VIPWelcomeLetter component before the return statement
const returnLine = 'return (';
const newReturnWithWelcome = `if (showVIPWelcome) {
    return <VIPWelcomeLetter onDismiss={handleDismissVIPWelcome} />;
  }

  return (`;

content = content.replace(returnLine, newReturnWithWelcome);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ VIP Welcome Letter integrated into CreatorDashboard.jsx!');
console.log('');
console.log('Features:');
console.log('  📜 4-page welcome letter for $1000 tier holders');
console.log('  ⚡ Explains Universal AI Generator');
console.log('  🎨 Explains AI Studio (3 modules)');
console.log('  👤 Explains Facial Media Sorter');
console.log('  🤫 NO mention of adult content or owner\'s use case');
console.log('  💾 Shows once per user (stored in localStorage)');
console.log('  👑 Skipped for owner (you already know!)');
