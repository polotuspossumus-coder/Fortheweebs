const crypto = require('crypto');
module.exports = function checkArtifact(fileBuffer) {
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  const timestamp = Date.now();
  return { hash, timestamp };
};
