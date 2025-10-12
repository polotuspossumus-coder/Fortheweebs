// Development helper script
const { spawn } = require('child_process');
const path = require('path');

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    const process = spawn(command, args, { 
      stdio: 'inherit',
      shell: true,
      cwd: __dirname
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

async function dev() {
  console.log('🚀 Starting Fortheweebs development...');
  try {
    console.log('📦 Building app...');
    await runCommand('npm', ['run', 'build']);
    
    console.log('⚡ Starting Electron...');
    await runCommand('npx', ['electron', '.']);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function build() {
  console.log('🏗️ Building Fortheweebs for production...');
  try {
    await runCommand('npm', ['run', 'build']);
    console.log('✅ Build complete!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
  }
}

async function package() {
  console.log('📦 Packaging Fortheweebs...');
  try {
    await runCommand('npm', ['run', 'build']);
    await runCommand('npm', ['run', 'package', '--', '--overwrite']);
    console.log('✅ Package complete! Check release-build folder.');
  } catch (error) {
    console.error('❌ Package failed:', error.message);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'dev':
    dev();
    break;
  case 'build':
    build();
    break;
  case 'package':
    package();
    break;
  default:
    console.log(`
🌟 Fortheweebs Development Helper

Usage:
  node dev.js dev     - Build and run in development
  node dev.js build   - Build for production
  node dev.js package - Build and package for distribution

Current commands available:
  npm run dev     - Start Vite dev server
  npm run build   - Build with Vite
  npm run package - Package with Electron Packager
    `);
}