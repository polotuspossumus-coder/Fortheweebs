// soundLibrary.js
// Simple in-memory sound library for demo
const soundList = [
  { id: 'kick', name: 'Kick Drum', url: '/sounds/kick.wav' },
  { id: 'snare', name: 'Snare', url: '/sounds/snare.wav' },
  { id: 'hihat', name: 'Hi-Hat', url: '/sounds/hihat.wav' },
  { id: 'clap', name: 'Clap', url: '/sounds/clap.wav' },
  { id: 'fx', name: 'FX', url: '/sounds/fx.wav' },
];

module.exports = {
  getAll: () => soundList,
  play: (id) => {
    // In a real app, trigger playback via Web Audio API or broadcast to clients
    const sound = soundList.find((s) => s.id === id);
    if (sound) {
      console.log(`Playing sound: ${sound.name}`);
    }
  },
};
