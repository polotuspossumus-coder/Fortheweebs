const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3({ region: 'us-east-1' });

function uploadFileToS3(localPath, s3Key) {
  const fileStream = fs.createReadStream(localPath);
  const params = {
    Bucket: 'vanguard-media',
    Key: s3Key,
    Body: fileStream,
    ACL: 'public-read',
  };
  return s3.upload(params).promise();
}

module.exports = uploadFileToS3;
