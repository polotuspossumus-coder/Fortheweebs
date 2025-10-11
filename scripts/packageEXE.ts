import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export const packageEXE = () => {
  try {
    console.log('🔄 Cleaning build artifacts...');
    execSync('rm -rf dist && rm -rf windows');

    console.log('📦 Building frontend...');
    execSync('npm run build');

    console.log('🧪 Syncing Capacitor config...');
    execSync('npx cap sync windows');

    console.log('🛠️ Copying assets...');
    execSync('npx cap copy windows');

    console.log('🧰 Opening Windows project...');
    execSync('npx cap open windows');

    console.log('✅ Fortheweebs EXE packaging complete. Ready for build in Visual Studio.');
  } catch (err) {
    console.error('❌ Packaging failed:', err);
  }
};
