const { exec } = require('child_process');

function addAudioToVideo(videoPath, audioPath, outputPath) {
  const command = `ffmpeg -i ${videoPath} -i ${audioPath} -c:v copy -c:a aac -shortest ${outputPath}`;
  exec(command, (err) => {
    if (err) console.error('Audio merge failed:', err);
    else console.log('Video with audio created:', outputPath);
  });
}

module.exports = addAudioToVideo;
