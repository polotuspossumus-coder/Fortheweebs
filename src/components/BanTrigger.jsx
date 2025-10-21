import React, { useState } from "react";
import "./BanTrigger.css";

export default function BanTrigger() {
  const [creatorId, setCreatorId] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [reason, setReason] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const handleBan = async () => {
    const payload = {
      id: creatorId,
      name: creatorName,
      reason
    };

    const response = await fetch("/api/ban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      setConfirmation(`🪦 ${creatorName} has been banned and transferred to the graveyard.`);
    } else {
      setConfirmation("❌ Ban failed. Check logs.");
    }
  };

  return (
    <div className="ban-trigger">
      <h2>🛡️ Sovereign Ban Panel</h2>
      <input
        type="text"
        placeholder="Creator ID"
        value={creatorId}
        onChange={(e) => setCreatorId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Creator Name"
        value={creatorName}
        onChange={(e) => setCreatorName(e.target.value)}
      />
      <textarea
        placeholder="Reason for ban"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button onClick={handleBan}>Execute Ban</button>
      {confirmation && <p>{confirmation}</p>}
    </div>
  );
}
