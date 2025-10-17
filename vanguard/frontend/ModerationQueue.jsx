import React from 'react';

export default function ModerationQueue({ files, onModerate }) {
  return (
    <div className="moderation-queue">
      <h3>Moderation Queue</h3>
      <ul>
        {files
          .filter((f) => f.status === 'pending' || f.status === 'flagged')
          .map((file) => (
            <li key={file.fileName}>
              <span>
                {file.originalName} ({file.mediaType})
              </span>
              <span>Status: {file.status || 'pending'}</span>
              <button onClick={() => onModerate(file, 'approved')}>Approve</button>
              <button onClick={() => onModerate(file, 'rejected')}>Reject</button>
              <button onClick={() => onModerate(file, 'flagged')}>Flag</button>
            </li>
          ))}
      </ul>
      <style>{`
        .moderation-queue { background: #23233a; color: #fff; padding: 1.5rem; border-radius: 1rem; margin: 2rem 0; }
        .moderation-queue ul { list-style: none; padding: 0; }
        .moderation-queue li { display: flex; align-items: center; gap: 1.5rem; padding: 0.7rem 0; border-bottom: 1px solid #222; }
        button { background: #23233a; color: #38bdf8; border: none; border-radius: 0.5rem; padding: 0.3rem 0.8rem; cursor: pointer; transition: background 0.2s; }
        button:hover { background: #38bdf8; color: #23233a; }
      `}</style>
    </div>
  );
}
