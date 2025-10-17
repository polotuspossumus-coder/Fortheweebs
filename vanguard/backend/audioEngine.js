// audioEngine.js
const ffmpeg = require('fluent-ffmpeg');

async function mixTracks(tracks, bpm, effects) {
  // Combine tracks, apply effects, export
  return new Promise((resolve, reject) => {
    const command = ffmpeg();
    tracks.forEach(t => command.input(t.url));
    command
      .complexFilter(effects)
      .output('output.mp3')
      .on('end', () => resolve('/media/output.mp3'))
      .on('error', reject)
      .run();
  });
}

module.exports = { mixTracks };
