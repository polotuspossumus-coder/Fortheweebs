import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { legalIndex } from "../legal/legalIndex";
import { getInteractionLogs, getRemixConsents, getCommentAcks } from '../legal/interaction-log';



// Fetch markdown content from public folder
async function fetchMarkdown(path) {
  const res = await fetch(path);
  return await res.text();
}


export const LegalDocumentsList = () => {
  const [accepted, setAccepted] = useState(() => {
    const stored = localStorage.getItem("legalAccepted");
    return stored ? JSON.parse(stored) : {};
  });
  const [docs, setDocs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const loaded = {};
      for (const doc of legalIndex) {
        loaded[doc.id] = await fetchMarkdown(doc.path);
      }
      setDocs(loaded);
      setLoading(false);
    })();
  }, []);

  const handleAccept = (id) => {
    const updated = { ...accepted, [id]: true };
    setAccepted(updated);
    localStorage.setItem("legalAccepted", JSON.stringify(updated));
  };

  const allAccepted = legalIndex.every(doc => !doc.requiredAcceptance || accepted[doc.id]);

  if (loading) return <div className="legal-docs-loading">Loading legal documents…</div>;

  if (allAccepted) return null;

  return (
    <div className="legal-docs-container" style={{ maxWidth: 700, margin: "40px auto", background: "#181818", borderRadius: 12, boxShadow: "0 2px 16px #0008", padding: 32 }}>
      <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 32, color: "#FFD700", textAlign: "center" }}>Legal Documents</h2>
      {legalIndex.map(doc => (
        <div key={doc.id} style={{ marginBottom: 32, background: "#222", borderRadius: 8, padding: 24, boxShadow: "0 1px 8px #0006" }}>
          <div style={{ fontWeight: "bold", fontSize: "1.3rem", marginBottom: 8 }}>{doc.title}</div>
          <div style={{ fontSize: "0.95rem", color: "#FFD700", marginBottom: 12 }}>Version: {doc.version} | Last Updated: {doc.lastUpdated}</div>
          <div style={{ background: "#181818", borderRadius: 6, padding: 16, marginBottom: 16, maxHeight: 300, overflowY: "auto", border: "1px solid #333" }}>
            <ReactMarkdown>{docs[doc.id] || ""}</ReactMarkdown>
          </div>
          {doc.requiredAcceptance && !accepted[doc.id] && (
            <button onClick={() => handleAccept(doc.id)} style={{ background: "#FFD700", color: "#222", fontWeight: 700, border: 0, borderRadius: 6, padding: "10px 24px", fontSize: "1rem", cursor: "pointer" }}>
              Accept & Continue
            </button>
          )}
          {doc.requiredAcceptance && accepted[doc.id] && (
            <div style={{ color: "#0f0", fontWeight: 600, marginTop: 8 }}>Accepted</div>
          )}
        </div>
      ))}
    </div>
  );
};

export function SovereignInteractionHistory({ userId }) {
  const [uploads, setUploads] = useState([]);
  const [remixes, setRemixes] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setUploads(getInteractionLogs(userId).filter(log => log.type === 'upload'));
      setRemixes(getRemixConsents(userId));
        setComments(getCommentAcks(userId));
        setLoading(false);
      }
      fetchData();
    }, [userId]);

    if (loading) return <div>Loading interaction history...</div>;

    return (
      <div className="sovereign-interaction-history">
        <h3>Sovereign Interaction History</h3>
        <section>
          <h4>Uploads</h4>
          <ul>
            {uploads.map((log, i) => (
              <li key={i}>{log.timestamp}: {JSON.stringify(log.metadata)}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4>Remixes</h4>
          <ul>
            {remixes.map((consent, i) => (
              <li key={i}>{consent.timestamp}: Consent Hash {consent.consentHash}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4>Comments</h4>
          <ul>
            {comments.map((ack, i) => (
              <li key={i}>{ack.timestamp}: Comment {ack.commentId}</li>
            ))}
          </ul>
        </section>
      </div>
    );
  }
// ...existing code...
