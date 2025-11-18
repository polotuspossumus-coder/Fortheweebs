import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'command is required' });
    }

    // Security: whitelist allowed commands
    const allowedPrefixes = [
      'git ',
      'npm ',
      'node ',
      'ls ',
      'cat ',
      'echo ',
      'pwd',
      'mkdir ',
      'rm ',
      'mv ',
      'cp '
    ];

    const isAllowed = allowedPrefixes.some(prefix =>
      command.trim().startsWith(prefix) || command.trim() === 'pwd'
    );

    if (!isAllowed) {
      return res.status(403).json({
        error: 'Command not allowed',
        allowedPrefixes
      });
    }

    const { stdout, stderr } = await execPromise(command, {
      cwd: process.cwd(),
      timeout: 30000, // 30 second timeout
      maxBuffer: 1024 * 1024 // 1MB max output
    });

    res.json({
      success: true,
      command,
      stdout: stdout || '(no output)',
      stderr: stderr || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      command: req.body.command,
      error: error.message,
      stdout: error.stdout || null,
      stderr: error.stderr || null,
    });
  }
}
