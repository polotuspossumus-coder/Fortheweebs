
import StandaloneAccess from './StandaloneAccess';
import ModerationQueue from './ModerationQueue';
import { useEffect, useState } from 'react';

export default function VanguardDashboard() {
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isPaidUser, setIsPaidUser] = useState(
    localStorage.getItem('fortheweebs_payment_verified') === 'true'
  );
  const [standaloneAccess, setStandaloneAccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch files from backend
  useEffect(() => {
    fetch('/api/vanguard/list')
      .then(res => res.json())
      .then(setFiles)
      .catch(() => setFiles([]));
  }, [uploading]);

  // Upload files to backend
  async function uploadFiles(fileList) {
    setUploading(true);
    for (const file of fileList) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', 'demo'); // TODO: Replace with real userId
      formData.append('mediaType', file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'other');
      await fetch('/api/vanguard/ingest', {
        method: 'POST',
        body: formData,
      });
    }
    setUploading(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    uploadFiles(dropped);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleFileInput(e) {
    const files = Array.from(e.target.files);
    uploadFiles(files);
  }

  function handleSelect(file) {
    setSelected(sel => sel.includes(file) ? sel.filter(f => f !== file) : [...sel, file]);
  }

  async function handleModerate(file, status) {
    await fetch(`/api/vanguard/moderate/${file.fileName}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setUploading(u => !u); // trigger refresh
  }

  // Access gating logic
  if (!isPaidUser && !standaloneAccess) {
    return (
      <StandaloneAccess
        isSubscriber={false}
        onAccess={() => setStandaloneAccess(true)}
      />
    );
  }

  return (
    <div className="vanguard-dashboard">
      <h2>Vanguard Media Manager</h2>
      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p>Drag and drop files here, or click to select.</p>
        <input
          type="file"
          multiple
          style={{ display: 'none' }}
          id="file-input"
          onChange={handleFileInput}
        />
        <label htmlFor="file-input" className="file-input-label">Browse Files</label>
      </div>
      {uploading && <div>Uploading...</div>}
      {files.length > 0 && (
        <>
          <div className="batch-controls">
            <button onClick={() => alert('Batch convert coming soon!')}>Convert</button>
            <button onClick={() => alert('Batch tag coming soon!')}>Tag</button>
            <button onClick={() => alert('Batch move coming soon!')}>Move</button>
            <button onClick={() => alert('Batch flag coming soon!')}>Flag</button>
          </div>
          <ul className="file-list">
            {files.map(file => (
              <li key={file.fileName} className={selected.includes(file) ? 'selected' : ''}>
                <input
                  type="checkbox"
                  checked={selected.includes(file)}
                  onChange={() => handleSelect(file)}
                />
                <span>{file.originalName}</span>
                <span>({file.mediaType})</span>
                <span>Status: {file.status || 'pending'}</span>
                <button onClick={() => handleModerate(file, 'approved')}>Approve</button>
                <button onClick={() => handleModerate(file, 'rejected')}>Reject</button>
                <button onClick={() => handleModerate(file, 'flagged')}>Flag</button>
              </li>
            ))}
          </ul>
          <ModerationQueue files={files} onModerate={handleModerate} />
        </>
      )}
      <style>{`
        .vanguard-dashboard { max-width: 700px; margin: 2rem auto; padding: 2rem; background: #181a20; border-radius: 2rem; box-shadow: 0 8px 32px 0 rgba(56,189,248,0.18); color: #fff; }
        .drop-zone { border: 2px dashed #38bdf8; border-radius: 1.5rem; padding: 2rem; text-align: center; margin-bottom: 2rem; background: rgba(56,189,248,0.05); cursor: pointer; }
        .file-input-label { color: #38bdf8; cursor: pointer; text-decoration: underline; }
        .batch-controls { display: flex; gap: 1rem; margin-bottom: 1rem; }
        .file-list { list-style: none; padding: 0; }
        .file-list li { display: flex; align-items: center; gap: 1rem; padding: 0.5rem 0; border-bottom: 1px solid #222; }
        .file-list li.selected { background: rgba(56,189,248,0.08); }
        button { background: #23233a; color: #38bdf8; border: none; border-radius: 0.5rem; padding: 0.3rem 0.8rem; cursor: pointer; transition: background 0.2s; }
        button:hover { background: #38bdf8; color: #23233a; }
      `}</style>
    </div>
  );
}
