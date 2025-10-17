import * as Tone from 'tone';

export default function MusicMixer() {
  // Players for demo sounds
  const kick = new Tone.Player('/sounds/kick.wav').toDestination();
  const snare = new Tone.Player('/sounds/snare.wav').toDestination();

  const startLoop = () => {
    Tone.Transport.cancel();
    Tone.Transport.scheduleRepeat(time => {
      kick.start(time);
      snare.start(time + 0.5);
    }, '1m');
    Tone.Transport.start();
  };

  return (
    <div>
      <button onClick={startLoop}>Start Loop</button>
    </div>
  );
}
