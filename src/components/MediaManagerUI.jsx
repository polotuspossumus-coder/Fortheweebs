import React, { useState } from "react";

export default function MediaManagerUI() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState("");

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleIngest = () => {
    // Placeholder for actual ingest/classification logic
    if (files.length === 0) {
      setResult("No files selected.");
      return;
    }
    setResult(`Ingested & classified ${files.length} file(s).`);
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl">
      <h2 className="text-2xl font-bold mb-4">🗂️ Media Manager</h2>
      <input
        type="file"
        multiple
        className="w-full p-2 rounded mb-4"
        onChange={handleFileChange}
      />
      <button
        className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
        onClick={handleIngest}
      >
        Ingest & Classify
      </button>
      <p className="mt-4 text-sm text-gray-400">Supported: image, audio, video, CGI, document</p>
      {result && (
        <div className="mt-4 p-3 bg-gray-800 rounded">{result}</div>
      )}
    </div>
  );
}
