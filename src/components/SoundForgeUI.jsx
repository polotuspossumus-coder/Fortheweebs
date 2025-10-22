import React, { useState } from "react";

export default function SoundForgeUI() {
  const [style, setStyle] = useState("");
  const [result, setResult] = useState("");

  const handleGenerate = () => {
    // Placeholder for actual audio generation logic
    setResult(`Generated audio loop in style: ${style}`);
    setResult(`Generated audio in style: ${style}`);

  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">🔊 Sound Forge</h2>
      <input
        type="text"
        placeholder="Enter audio style or mood..."
        className="w-full p-2 rounded mb-4"
        value={style}
        placeholder="Audio style"
      />
      <button
        className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
        onClick={handleGenerate}
      >
        Generate Audio
      </button>
      {result && (
        <div className="mt-4 p-3 bg-gray-800 rounded">{result}</div>
      )}
    </div>
  );
}
