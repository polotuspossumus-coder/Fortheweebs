const express = require('express');
const router = express.Router();

// Import handlers
const chatHandler = require('./mico/chat.js');
const statusHandler = require('./mico/status.js');
const readFileHandler = require('./mico/read-file.js');
const writeFileHandler = require('./mico/write-file.js');
const listDirHandler = require('./mico/list-directory.js');
const searchHandler = require('./mico/search-files.js');
const executeHandler = require('./mico/execute-command.js');
const executeToolHandler = require('./mico/execute-tool.js');

// Define routes
router.get('/status', (req, res) => statusHandler.default(req, res));
router.post('/chat', (req, res) => chatHandler.default(req, res));
router.post('/read-file', (req, res) => readFileHandler.default(req, res));
router.post('/write-file', (req, res) => writeFileHandler.default(req, res));
router.post('/list-directory', (req, res) => listDirHandler.default(req, res));
router.post('/search-files', (req, res) => searchHandler.default(req, res));
router.post('/execute-command', (req, res) => executeHandler.default(req, res));
router.post('/execute-tool', (req, res) => executeToolHandler.default(req, res));

module.exports = router;
