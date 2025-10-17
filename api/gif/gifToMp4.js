const { exec } = require('child_process');

function convertGifToMp4(gifPath, outputPath) {
  const command = `ffmpeg -i ${gifPath} -movflags faststart -pix_fmt yuv420p ${outputPath}`;
  exec(command, (err) => {
    if (err) console.error('Conversion failed:', err);
    else console.log('MP4 created:', outputPath);
  });
}

module.exports = convertGifToMp4;
