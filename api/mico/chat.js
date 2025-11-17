import Anthropic from '@anthropic-ai/sdk';

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
    const { message, conversationHistory = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = `You are Mico, an autonomous AI development agent for ForTheWeebs.

You have these tools available:
1. read-file: Read any file in the project
2. write-file: Create or overwrite files
3. edit-file: Replace specific text in files
4. list-directory: List folder contents
5. execute-command: Run git, npm, node commands
6. search-files: Search for text across all files

When a user asks you to do something:
1. Think about which tools you need
2. Execute them in the right order
3. Verify your work (run builds, check git status)
4. Report what you did

Be autonomous. Build features fully. Fix errors. Don't give up.

Respond with either:
- Plain text advice/explanation
- A structured tool invocation (JSON format)

Example tool invocation:
{
  "tool": "write-file",
  "params": {
    "filePath": "src/components/NewFeature.jsx",
    "content": "// Generated code here"
  },
  "reasoning": "Creating new feature component"
}`;

    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: message,
      },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages,
    });

    const assistantMessage = response.content[0].text;

    // Check if response contains a tool invocation
    let toolInvocation = null;
    try {
      const jsonMatch = assistantMessage.match(/\{[\s\S]*"tool"[\s\S]*\}/);
      if (jsonMatch) {
        toolInvocation = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Not a tool invocation, just plain text
    }

    res.json({
      success: true,
      response: {
        role: 'assistant',
        content: assistantMessage,
      },
      toolInvocation,
      conversationHistory: [
        ...messages,
        {
          role: 'assistant',
          content: assistantMessage,
        },
      ],
    });

  } catch (error) {
    console.error('Mico chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
