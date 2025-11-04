import React, { useState } from "react";

export default function CanvasForgeUI() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");

  const handleGenerate = () => {
    setResult(`Generated image for prompt: ${prompt}`);
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">🎨 Canvas Forge</h2>
      <input
        type="text"
        placeholder="Enter image prompt..."
        className="w-full p-2 rounded mb-4"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />
      <button
        className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
        onClick={handleGenerate}
      >
        Generate Image
      </button>
      {result && (
        <div className="mt-4 p-3 bg-gray-800 rounded">{result}</div>
      )}
    </div>
  );
}
