// Central tool executor that routes to specific tool handlers
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
    const { toolName, toolInput } = req.body;

    if (!toolName || !toolInput) {
      return res.status(400).json({ error: 'toolName and toolInput are required' });
    }

    // Map Claude tool names to API endpoints
    const toolEndpoints = {
      'read_file': '/api/mico/read-file',
      'write_file': '/api/mico/write-file',
      'list_directory': '/api/mico/list-directory',
      'search_files': '/api/mico/search-files',
      'execute_command': '/api/mico/execute-command'
    };

    const endpoint = toolEndpoints[toolName];

    if (!endpoint) {
      return res.status(400).json({ error: `Unknown tool: ${toolName}` });
    }

    // Forward to specific tool handler
    const baseUrl = process.env.VITE_API_URL || 'http://localhost:3001';
    const toolResponse = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toolInput)
    });

    const result = await toolResponse.json();

    res.json({
      success: result.success,
      toolName,
      result
    });

  } catch (error) {
    console.error('Tool execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
