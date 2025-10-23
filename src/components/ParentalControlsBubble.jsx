import { useState } from "react";
import "./ParentalControlsBubble.css";

export const ParentalControlsBubble = () => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="parental-bubble">
      <button
        className={`bubble-toggle ${enabled ? "active" : ""}`}
        onClick={() => setEnabled(!enabled)}
      >
        🛡️ Parental Controls {enabled ? "ON" : "OFF"}
      </button>

      {enabled && (
        <div className="bubble-panel">
          <p className="bubble-text">
            Mature uploads will be access-separated. Vault entries flagged PG-13 or M require unlock.
          </p>
          <button className="bubble-disable" onClick={() => setEnabled(false)}>
            Disable Controls
          </button>
        </div>
      )}
    </div>
  );
};
