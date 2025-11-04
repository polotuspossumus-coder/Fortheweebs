import React, { useState } from "react";

export default function VideoForgeUI() {
  const [template, setTemplate] = useState("");
  const [result, setResult] = useState("");

  const handleGenerate = () => {
    // Placeholder for actual video generation logic
    setResult(`Rendered video using template: ${template}`);
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">🎬 Video Forge</h2>
      <input
        type="text"
        placeholder="Enter video template or theme..."
        className="w-full p-2 rounded mb-4"
        value={template}
        onChange={e => setTemplate(e.target.value)}
      />
      <button
        className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
        onClick={handleGenerate}
      >
        Generate Video
      </button>
      {result && (
        <div className="mt-4 p-3 bg-gray-800 rounded">{result}</div>
      )}
    </div>
  );
}
