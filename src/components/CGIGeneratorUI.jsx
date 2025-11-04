import React, { useState } from "react";

export default function CGIGeneratorUI() {
  const [style, setStyle] = useState("");
  const [result, setResult] = useState("");

  const handleRender = () => {
    // Placeholder for actual CGI character rendering logic
    setResult(`Generated CGI character in style: ${style}`);
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">🧍 CGI Generator</h2>
      <input
        type="text"
        placeholder="Enter character style or theme..."
        className="w-full p-2 rounded mb-4"
        value={style}
        onChange={e => setStyle(e.target.value)}
      />
      <button
        className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
        onClick={handleRender}
      >
        Render Character
      </button>
      {result && (
        <div className="mt-4 p-3 bg-gray-800 rounded">{result}</div>
      )}
    </div>
  );
}
