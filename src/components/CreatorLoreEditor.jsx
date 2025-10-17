/**
 * @param {{ creatorId: string, initialLore?: string, onSave: (lore: string) => void }} props
 */
import React, { useState } from 'react';

export const CreatorLoreEditor = ({ creatorId, initialLore = '', onSave }) => {
  const [lore, setLore] = useState(initialLore);

  return (
    <div className="lore-editor">
      <h3 className="lore-title">📝 Mythology Codex — {creatorId}</h3>
      <textarea
        value={lore}
        onChange={(e) => setLore(e.target.value)}
        rows={6}
        className="lore-textarea"
        placeholder="Forge your remix legacy here..."
      />
      <button onClick={() => onSave(lore)} className="primary-btn lore-save-btn">
        Save Lore
      </button>
    </div>
  );
};
