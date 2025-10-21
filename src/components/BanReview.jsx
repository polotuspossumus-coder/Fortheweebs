// BanReview.jsx — Jacob’s Ban Review Panel

import React, { useState, useEffect } from "react";

export default function BanReview() {
  const [pendingBan, setPendingBan] = useState(null);
  const [decision, setDecision] = useState("");

  useEffect(() => {
    fetch("/api/pending-ban")
      .then((res) => res.json())
      .then((data) => setPendingBan(data));
  }, []);

  const handleDecision = async (approve) => {
    const response = await fetch("/api/ban-decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approve, creatorId: pendingBan.creatorId })
    });

    if (response.ok) {
      setDecision(approve ? "✅ Ban approved and executed." : "❌ Ban rejected.");
    } else {
      setDecision("⚠️ Decision failed.");
    }
  };

  if (!pendingBan) return <p>🧠 No pending bans.</p>;

  return (
    <div className="ban-review">
      <h2>🛡️ Ban Proposal</h2>
      <p><strong>Creator:</strong> {pendingBan.creatorName}</p>
      <p><strong>Reason:</strong> {pendingBan.reason}</p>
      <p><strong>Flagged Content:</strong> {pendingBan.content}</p>
      <button onClick={() => handleDecision(true)}>Approve Ban</button>
      <button onClick={() => handleDecision(false)}>Reject Ban</button>
      {decision && <p>{decision}</p>}
    </div>
  );
}
