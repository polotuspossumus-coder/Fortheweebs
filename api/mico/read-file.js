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
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'filePath is required' });
    }

    // Security: ensure path is within project directory
    const projectRoot = path.resolve(process.cwd());
    const fullPath = path.resolve(projectRoot, filePath);
    
    if (!fullPath.startsWith(projectRoot)) {
      return res.status(403).json({ error: 'Access denied: path outside project' });
    }

    const content = await fs.readFile(fullPath, 'utf-8');
    
    res.json({
      success: true,
      filePath,
      content,
      lines: content.split('\n').length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
    });
  }
}
