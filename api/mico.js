const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Mico's autonomous tool execution API
// These are the tools Mico uses to build features autonomously

/**
 * Tool 1: READ_FILE
 * Read contents of any file in the project
 */
router.post('/tool/read-file', async (req, res) => {
    try {
        const { filePath } = req.body;
        
        if (!filePath) {
            return res.status(400).json({ error: 'filePath is required' });
        }

        // Security: ensure path is within project directory
        const projectRoot = path.resolve(__dirname, '..');
        const fullPath = path.resolve(projectRoot, filePath);
        
        if (!fullPath.startsWith(projectRoot)) {
            return res.status(403).json({ error: 'Access denied: path outside project' });
        }

        const content = await fs.readFile(fullPath, 'utf-8');
        
        res.json({
            success: true,
            filePath,
            content,
            lines: content.split('\n').length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            code: error.code
        });
    }
});

/**
 * Tool 2: WRITE_FILE
 * Create or overwrite a file
 */
router.post('/tool/write-file', async (req, res) => {
    try {
        const { filePath, content } = req.body;
        
        if (!filePath || content === undefined) {
            return res.status(400).json({ error: 'filePath and content are required' });
        }

        const projectRoot = path.resolve(__dirname, '..');
        const fullPath = path.resolve(projectRoot, filePath);
        
        if (!fullPath.startsWith(projectRoot)) {
            return res.status(403).json({ error: 'Access denied: path outside project' });
        }

        // Create directory if it doesn't exist
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        
        // Write file
        await fs.writeFile(fullPath, content, 'utf-8');
        
        res.json({
            success: true,
            filePath,
            bytesWritten: Buffer.byteLength(content, 'utf-8')
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Tool 3: EDIT_FILE
 * Replace specific text in a file (more precise than rewriting)
 */
router.post('/tool/edit-file', async (req, res) => {
    try {
        const { filePath, oldText, newText } = req.body;
        
        if (!filePath || !oldText || newText === undefined) {
            return res.status(400).json({ error: 'filePath, oldText, and newText are required' });
        }

        const projectRoot = path.resolve(__dirname, '..');
        const fullPath = path.resolve(projectRoot, filePath);
        
        if (!fullPath.startsWith(projectRoot)) {
            return res.status(403).json({ error: 'Access denied: path outside project' });
        }

        // Read current content
        let content = await fs.readFile(fullPath, 'utf-8');
        
        // Check if old text exists
        if (!content.includes(oldText)) {
            return res.status(400).json({
                success: false,
                error: 'oldText not found in file',
                suggestion: 'Read the file first to get the exact text'
            });
        }

        // Replace text
        const updatedContent = content.replace(oldText, newText);
        
        // Write back
        await fs.writeFile(fullPath, updatedContent, 'utf-8');
        
        res.json({
            success: true,
            filePath,
            replacements: 1
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Tool 4: LIST_DIRECTORY
 * List files and folders in a directory
 */
router.post('/tool/list-directory', async (req, res) => {
    try {
        const { dirPath = '' } = req.body;

        const projectRoot = path.resolve(__dirname, '..');
        const fullPath = path.resolve(projectRoot, dirPath);
        
        if (!fullPath.startsWith(projectRoot)) {
            return res.status(403).json({ error: 'Access denied: path outside project' });
        }

        const entries = await fs.readdir(fullPath, { withFileTypes: true });
        
        const items = entries.map(entry => ({
            name: entry.name,
            type: entry.isDirectory() ? 'directory' : 'file',
            path: path.join(dirPath, entry.name)
        }));

        res.json({
            success: true,
            dirPath,
            items
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Tool 5: EXECUTE_COMMAND
 * Run shell commands (git, npm, etc.)
 */
router.post('/tool/execute-command', async (req, res) => {
    try {
        const { command } = req.body;
        
        if (!command) {
            return res.status(400).json({ error: 'command is required' });
        }

        // Security: whitelist safe commands
        const safeCommands = ['npm', 'git', 'node', 'npx'];
        const commandStart = command.trim().split(' ')[0];
        
        if (!safeCommands.some(safe => commandStart.includes(safe))) {
            return res.status(403).json({
                error: 'Command not allowed',
                allowed: safeCommands
            });
        }

        const projectRoot = path.resolve(__dirname, '..');
        
        const { stdout, stderr } = await execPromise(command, {
            cwd: projectRoot,
            timeout: 60000, // 60 second timeout
            maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        });

        res.json({
            success: true,
            command,
            stdout,
            stderr,
            exitCode: 0
        });
    } catch (error) {
        res.json({
            success: false,
            command: req.body.command,
            stdout: error.stdout || '',
            stderr: error.stderr || error.message,
            exitCode: error.code || 1
        });
    }
});

/**
 * Tool 6: SEARCH_FILES
 * Search for text across all files
 */
router.post('/tool/search-files', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'query is required' });
        }

        const projectRoot = path.resolve(__dirname, '..');
        
        // Use git grep if available (faster)
        try {
            const { stdout } = await execPromise(`git grep -n "${query}"`, {
                cwd: projectRoot,
                timeout: 10000
            });

            const matches = stdout.split('\n')
                .filter(line => line.trim())
                .map(line => {
                    const [filePath, lineNum, ...contentParts] = line.split(':');
                    return {
                        filePath,
                        lineNumber: parseInt(lineNum),
                        content: contentParts.join(':').trim()
                    };
                });

            res.json({
                success: true,
                query,
                matches,
                count: matches.length
            });
        } catch (grepError) {
            // Fallback to basic search
            res.json({
                success: false,
                error: 'Search failed. Use read_file on specific files instead.',
                gitError: grepError.message
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Chat endpoint - Process Mico requests with AI
 */
router.post('/chat', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'message is required' });
        }

        // TODO: Integrate with GitHub Models or Azure OpenAI
        // For now, provide intelligent tool suggestions
        
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

Example: "Add a search feature"
- read-file: src/index.jsx (understand structure)
- write-file: src/components/SearchBar.jsx (create component)
- edit-file: src/index.jsx (add import and component)
- execute-command: npm run build (verify it works)
- execute-command: git add . && git commit -m "feat: Add search" (commit)

Be autonomous. Build it fully. Fix errors. Don't give up.`;

        // Simple response for now - will integrate real AI
        const response = {
            role: 'assistant',
            content: `I understand you want to: "${message}". 

To execute this autonomously, I would:
1. Analyze the codebase to understand current structure
2. Create/modify necessary files
3. Run tests and builds to verify
4. Commit the changes with a clear message

However, I need AI integration (GitHub Models or Azure OpenAI) to execute autonomously. For now, I can help you plan the steps.

What specific part should I help you with first?`,
            toolsAvailable: [
                'read-file',
                'write-file', 
                'edit-file',
                'list-directory',
                'execute-command',
                'search-files'
            ]
        };

        res.json({
            success: true,
            response,
            needsAiIntegration: true
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get Mico's current status
 */
router.get('/status', (req, res) => {
    res.json({
        status: 'online',
        version: '1.0.0',
        tools: [
            'read-file',
            'write-file',
            'edit-file',
            'list-directory',
            'execute-command',
            'search-files'
        ],
        aiIntegrated: false,
        message: '🧠 Mico ready. Tool execution available. AI integration pending.'
    });
});

module.exports = router;
