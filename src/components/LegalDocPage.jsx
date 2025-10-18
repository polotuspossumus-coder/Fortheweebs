import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function LegalDocPage({ title, lastUpdated, version, content }) {
  return (
    <main>
      <h1>{title}</h1>
      <p><strong>Version:</strong> {version}</p>
      <p><strong>Last Updated:</strong> {lastUpdated}</p>
      <ReactMarkdown>{content}</ReactMarkdown>
    </main>
  );
}
