import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Soundboard() {
  const [sounds, setSounds] = useState([]);

  useEffect(() => {
    axios.get('/api/soundboard/sounds').then((res) => setSounds(res.data));
  }, []);

  const playSound = (url) => {
    const audio = new window.Audio(url);
    audio.play();
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {sounds.map((sound) => (
        <button
          key={sound.id}
          className="bg-purple-700 text-white p-4 rounded shadow"
          onClick={() => playSound(sound.url)}
        >
          {sound.name}
        </button>
      ))}
    </div>
  );
}
