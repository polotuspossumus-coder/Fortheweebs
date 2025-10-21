import { useState } from 'react';

export default function CGITrigger() {
  const [image, setImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    const res = await fetch('/api/generate-cgi', {
      method: 'POST',
      body: JSON.stringify({ role: 'creator', ritual: 'onboard', mood: 'celestial' }),
    });
    const { imageUrl } = await res.json();
    setImage(imageUrl);
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate CGI Scene</button>
      {image && <img src={image} alt="CGI Scene" />}
    </div>
  );
}
