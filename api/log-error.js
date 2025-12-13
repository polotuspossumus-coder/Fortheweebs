/**
 * ERROR LOGGING API
 * Captures frontend errors for production monitoring
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      error,
      stack,
      componentStack,
      url,
      userAgent,
      timestamp
    } = req.body;

    // Create error log entry
    const logEntry = {
      timestamp: timestamp || new Date().toISOString(),
      error,
      stack,
      componentStack,
      url,
      userAgent,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    };

    // Write to error log file in production
    if (process.env.NODE_ENV === 'production') {
      const logDir = path.join(__dirname, '../logs');
      const logFile = path.join(logDir, 'frontend-errors.log');

      // Create logs directory if it doesn't exist
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Append to log file
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(logFile, logLine, 'utf8');
    }

    // Return success
    return res.status(200).json({
      success: true,
      message: 'Error logged successfully'
    });

  } catch (err) {
    console.error('Error logging failed:', err);
    return res.status(500).json({
      error: 'Failed to log error',
      details: err.message
    });
  }
}
