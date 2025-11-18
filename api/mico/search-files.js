import fs from 'fs/promises';
import path from 'path';

async function searchInDirectory(dirPath, query, filePattern, results = []) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    // Skip node_modules, .git, dist, build
    if (entry.isDirectory()) {
      const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
      if (!skipDirs.includes(entry.name)) {
        await searchInDirectory(fullPath, query, filePattern, results);
      }
      continue;
    }

    // Check file pattern if provided
    if (filePattern && !entry.name.match(new RegExp(filePattern.replace('*', '.*')))) {
      continue;
    }

    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, lineNum) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            file: path.relative(process.cwd(), fullPath),
            line: lineNum + 1,
            content: line.trim(),
          });
        }
      });
    } catch (err) {
      // Skip files that can't be read (binary, permission issues)
    }
  }

  return results;
}

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
    const { query, filePattern } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    const projectRoot = process.cwd();
    const results = await searchInDirectory(projectRoot, query, filePattern);

    res.json({
      success: true,
      query,
      filePattern: filePattern || 'all files',
      matches: results.slice(0, 100), // Limit to first 100 matches
      totalMatches: results.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
