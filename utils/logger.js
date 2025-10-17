const winston = require('winston');
module.exports = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

// usage example:
// const logger = require('./utils/logger');
// logger.info('Upload complete', { userId: req.user.id, file: req.file.filename });
