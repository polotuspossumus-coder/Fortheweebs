import React, { useEffect, useState } from "react";
import { legalIndex } from "../legal/legalIndex";
import { getInteractionLogs, getRemixConsents, getCommentAcks } from '../legal/interaction-log';

// Simulated API call to get acceptance status
async function fetchAcceptanceStatus(userId) {
  const status = {};
  for (const doc of legalIndex) {
    if (doc.requiredAcceptance) {
      const res = await fetch(`/api/tos/accepted/${userId}`);
      const data = await res.json();
      status[doc.id] = data.accepted;
    }
  }
  return status;
}

export const LegalDocumentsList = ({ userId }) => {
  const [acceptance, setAcceptance] = useState({});
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const status = await fetchAcceptanceStatus(userId);
        setAcceptance(status);
        // Fetch acceptance history for each doc
        const histories = {};
        for (const doc of legalIndex) {
          if (doc.requiredAcceptance) {
            const res = await fetch(`/api/tos/accepted/${userId}`);
            if (!res.ok) throw new Error(`Failed to fetch history for ${doc.id}`);
            const data = await res.json();
            histories[doc.id] = data.history || [];
          }
        }
        setHistory(histories);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  return (
    <div className="legal-docs-container">
      <h2>Legal Documents</h2>
      {loading && <div className="legal-docs-loading">Loading acceptance status…</div>}
      {error && <div style={{ color: 'red', marginBottom: 16 }}>Error: {error}</div>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {legalIndex.map(doc => (
          <li key={doc.id} style={{ marginBottom: 16, background: "#222", borderRadius: 8, padding: 16 }}>
            <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{doc.title}</div>
            <div style={{ fontSize: "0.9rem", color: "#FFD700" }}>Version: {doc.version} | Last Updated: {doc.lastUpdated}</div>
            <a href={doc.path} target="_blank" rel="noopener noreferrer" style={{ color: "#FFD700", textDecoration: "underline" }}>
              View Document
            </a>
            {doc.requiredAcceptance && (
              <div style={{ marginTop: 8 }}>
                <span style={{ fontWeight: 'bold' }}>Acceptance:</span> {acceptance[doc.id] ? "✅ Accepted" : "❌ Not Accepted"}
                {history[doc.id] && history[doc.id].length > 0 && (
                  <details style={{ marginTop: 4 }}>
                    <summary style={{ cursor: "pointer" }}>View Acceptance History</summary>
                    <ul style={{ fontSize: "0.85rem", margin: 0, paddingLeft: 16 }}>
                      {history[doc.id].map((entry, idx) => (
                        <li key={idx} style={{ marginBottom: 2 }}>
                          <span style={{ color: '#FFD700' }}>{new Date(entry.timestamp).toLocaleString()}</span>
                          <span style={{ marginLeft: 8 }}>IP: {entry.ipAddress}</span>
                          <span style={{ marginLeft: 8 }}>Version: {entry.version}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
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
