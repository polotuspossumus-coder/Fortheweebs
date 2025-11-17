import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

/**
 * Mico Orchestrator - Autonomous code execution agent
 * Takes a user request, uses Claude to generate code, and executes it
 */
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
    const { task, projectContext = '' } = req.body;
    
    if (!task) {
      return res.status(400).json({ error: 'task is required' });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Step 1: Ask Claude what tools to use
    const planningPrompt = `You are Mico, an autonomous coding agent. Analyze this task and determine which operations to perform.

TASK: ${task}

PROJECT CONTEXT:
${projectContext}

Available tools:
1. read-file - Read a file from the project
2. write-file - Create or overwrite a file
3. execute-command - Run git, npm, or node commands

Respond with a JSON array of tool calls in this exact format:
[
  {
    "tool": "read-file",
    "params": {"filePath": "src/example.js"},
    "reason": "Need to understand current structure"
  },
  {
    "tool": "write-file",
    "params": {"filePath": "src/newFeature.js", "content": "// code here"},
    "reason": "Creating new feature"
  }
]

Return ONLY the JSON array, no other text.`;

    const planResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: planningPrompt }],
    });

    const planText = planResponse.content[0].text;
    let toolCalls;
    
    try {
      toolCalls = JSON.parse(planText);
    } catch (e) {
      return res.status(500).json({
        error: 'Failed to parse tool execution plan',
        rawResponse: planText,
      });
    }

    // Step 2: Execute tools directly (no function calls)
    const executionLog = [];
    const projectRoot = process.cwd();

    for (const call of toolCalls) {
      const { tool, params, reason } = call;
      
      executionLog.push({
        tool,
        reason,
        status: 'executing',
      });

      try {
        let result;
        
        switch (tool) {
          case 'read-file':
            const filePath = path.resolve(projectRoot, params.filePath);
            const content = await fs.readFile(filePath, 'utf-8');
            result = { success: true, content, lines: content.split('\n').length };
            break;
            
          case 'write-file':
            const writeFilePath = path.resolve(projectRoot, params.filePath);
            await fs.mkdir(path.dirname(writeFilePath), { recursive: true });
            await fs.writeFile(writeFilePath, params.content, 'utf-8');
            result = { success: true, bytesWritten: Buffer.byteLength(params.content) };
            break;
            
          default:
            result = { error: `Unknown tool: ${tool}` };
        }

        executionLog[executionLog.length - 1].status = 'completed';
        executionLog[executionLog.length - 1].result = result;
        
      } catch (error) {
        executionLog[executionLog.length - 1].status = 'failed';
        executionLog[executionLog.length - 1].error = error.message;
      }
    }

    // Step 3: Log the artifact
    const timestamp = new Date().toISOString();
    const artifact = {
      timestamp,
      task,
      toolCalls: executionLog,
      status: executionLog.every(e => e.status === 'completed') ? 'success' : 'partial',
    };

    console.log('MICO EXECUTION:', JSON.stringify(artifact, null, 2));

    return res.status(200).json({
      success: true,
      artifact,
      message: 'Mico execution completed',
    });

  } catch (error) {
    console.error('Orchestration error:', error);
    return res.status(500).json({
      error: 'Orchestration failed',
      message: error.message,
    });
  }
}
