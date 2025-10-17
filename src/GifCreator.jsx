import { useState } from 'react';
import axios from 'axios';
import FrameSequencer from './FrameSequencer.jsx';

function GifCreator() {
  const [files, setFiles] = useState([]);
  const [gifUrl, setGifUrl] = useState('');
  const [text, setText] = useState('');
  const [delay, setDelay] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    setLoading(true);
    setError('');
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    formData.append('text', text);
    formData.append('delay', delay);
    try {
      const res = await axios.post('/api/gif/create', formData);
      setGifUrl(res.data.url);
    } catch (err) {
      setError('GIF generation failed');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-white rounded shadow max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">GIF Creator</h2>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setFiles([...e.target.files])}
        className="mb-2"
      />
      <input
        type="text"
        placeholder="Overlay text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mb-2"
      />
      <input
        type="number"
        placeholder="Frame delay (ms)"
        value={delay}
        onChange={(e) => setDelay(e.target.value)}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        disabled={loading || files.length === 0}
        className="bg-indigo-600 text-white px-4 py-2 rounded mb-2"
      >
        Create GIF
      </button>
      {loading && <p>Generating GIF…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {gifUrl && (
        <div className="mt-4">
          <img src={gifUrl} alt="Generated GIF" className="mb-2" />
          <a
            href={gifUrl}
            download="vanguard.gif"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Download GIF
          </a>
        </div>
      )}
      <FrameSequencer files={files} />
    </div>
  );
}

export default GifCreator;
