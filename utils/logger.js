let logger;
if (process.env.NODE_ENV === 'test') {
  logger = {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  };
} else {
  const winston = require('winston');
  logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [new winston.transports.Console()],
  });
}
module.exports = logger;

// usage example:
// const logger = require('./utils/logger');
// logger.info('Upload complete', { userId: req.user.id, file: req.file.filename });
