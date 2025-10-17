const fs = require('fs');
const archiver = require('archiver');

function exportArtifactBundle(filePath, metadata, outputZip) {
  const output = fs.createWriteStream(outputZip);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);
  archive.file(filePath, { name: 'artifact' + filePath.slice(filePath.lastIndexOf('.')) });
  archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });
  archive.finalize();
}

module.exports = exportArtifactBundle;
