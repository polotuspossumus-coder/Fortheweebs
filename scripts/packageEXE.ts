/**
 * Packages the Fortheweebs Windows EXE using Capacitor and frontend build tools.
 *
 * Usage: Run as a script to automate build and packaging steps for Windows deployment.
 *
 * Steps:
 * 1. Cleans build artifacts
 * 2. Builds frontend
 * 3. Syncs Capacitor config
 * 4. Copies assets
 * 5. Opens Windows project for Visual Studio
 *
 * Errors are logged using Winston.
 */
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()]
});

export const packageEXE = () => {
  // Input validation: check required environment variables
  if (!process.env.NODE_ENV) {
    logger.warn('NODE_ENV is not set. Defaulting to development.');
    process.env.NODE_ENV = 'development';
  }
  if (typeof process.env.PACKAGE_OUTPUT !== 'undefined' && typeof process.env.PACKAGE_OUTPUT !== 'string') {
    logger.error('PACKAGE_OUTPUT must be a string if set.');
    return;
  }
  try {
    logger.info('🔄 Cleaning build artifacts...');
    execSync('rm -rf dist && rm -rf windows');

    logger.info('📦 Building frontend...');
    execSync('npm run build');

    logger.info('🧪 Syncing Capacitor config...');
    execSync('npx cap sync windows');

    logger.info('🛠️ Copying assets...');
    execSync('npx cap copy windows');

    logger.info('🧰 Opening Windows project...');
    execSync('npx cap open windows');

    logger.info('✅ Fortheweebs EXE packaging complete. Ready for build in Visual Studio.');
  } catch (err) {
    logger.error('❌ Packaging failed:', err);
  }
};
