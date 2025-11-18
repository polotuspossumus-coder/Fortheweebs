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

    const tools = [
      {
        name: 'read_file',
        description: 'Read the contents of a file in the project',
        input_schema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the file relative to project root (e.g., src/components/App.jsx)'
            }
          },
          required: ['filePath']
        }
      },
      {
        name: 'write_file',
        description: 'Create or completely overwrite a file with new content',
        input_schema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path where the file should be created/overwritten'
            },
            content: {
              type: 'string',
              description: 'Full content to write to the file'
            }
          },
          required: ['filePath', 'content']
        }
      },
      {
        name: 'list_directory',
        description: 'List all files and folders in a directory',
        input_schema: {
          type: 'object',
          properties: {
            dirPath: {
              type: 'string',
              description: 'Path to directory (e.g., src/components or . for root)'
            }
          },
          required: ['dirPath']
        }
      },
      {
        name: 'search_files',
        description: 'Search for text across all project files',
        input_schema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Text to search for'
            },
            filePattern: {
              type: 'string',
              description: 'Optional: glob pattern to filter files (e.g., *.jsx)'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'execute_command',
        description: 'Execute a shell command (git, npm, node, etc.)',
        input_schema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'Shell command to execute (e.g., git status, npm test)'
            }
          },
          required: ['command']
        }
      }
    ];

    const systemPrompt = `You are Mico, an autonomous AI development agent for ForTheWeebs platform.

Your job: Build features, fix bugs, and improve code autonomously.

Available tools:
- read_file: Read any file
- write_file: Create/overwrite files
- list_directory: Browse folders
- search_files: Find code patterns
- execute_command: Run shell commands

When given a task:
1. Break it down into steps
2. Use tools to implement
3. Verify your work (build, test, git status)
4. Report what you accomplished

Be thorough. Don't give up on errors - fix them. Be autonomous.`;

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
      tools,
    });

    // Extract tool uses and text
    const toolUses = response.content.filter(block => block.type === 'tool_use');
    const textBlocks = response.content.filter(block => block.type === 'text');

    res.json({
      success: true,
      response: {
        role: 'assistant',
        content: textBlocks.map(b => b.text).join('\n') || 'Processing...',
        toolUses: toolUses.map(t => ({
          id: t.id,
          name: t.name,
          input: t.input
        }))
      },
      stopReason: response.stop_reason,
      conversationHistory: [
        ...messages,
        {
          role: 'assistant',
          content: response.content,
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
