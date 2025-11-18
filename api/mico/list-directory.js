import fs from 'fs/promises';
import path from 'path';

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
    const { dirPath } = req.body;

    if (!dirPath) {
      return res.status(400).json({ error: 'dirPath is required' });
    }

    const projectRoot = path.resolve(process.cwd());
    const fullPath = path.resolve(projectRoot, dirPath);

    if (!fullPath.startsWith(projectRoot)) {
      return res.status(403).json({ error: 'Access denied: path outside project' });
    }

    const entries = await fs.readdir(fullPath, { withFileTypes: true });

    const files = entries
      .filter(e => e.isFile())
      .map(e => e.name);

    const directories = entries
      .filter(e => e.isDirectory())
      .map(e => e.name);

    res.json({
      success: true,
      dirPath,
      files,
      directories,
      totalEntries: entries.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
    });
  }
}
