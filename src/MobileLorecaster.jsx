import React, { useState } from "react";
/**
 * @param {{ validatorId: string }} props
 */
export default function MobileLorecaster({ validatorId }) {
  const [lore, setLore] = useState("");

  const publishLore = async () => {
    try {
      await fetch('/api/lorecast', {
        method: 'POST',
        body: JSON.stringify({ validatorId, highlights: lore }),
        headers: { 'Content-Type': 'application/json' },
      });
      setLore("");
      // Optionally show feedback
    } catch (err) {
      // Optionally handle error
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto" aria-label="Lore drop">
      <h2 className="text-lg font-bold mb-2">Lore Drop</h2>
      <label htmlFor="lore-input" className="sr-only">Lore highlights</label>
      <textarea id="lore-input" className="w-full border p-2 mb-2" placeholder="This week’s mythic moments…" value={lore} onChange={e => setLore(e.target.value)} />
      <button className="w-full bg-indigo-600 text-white py-2 rounded" onClick={publishLore} aria-label="Publish lore">Publish</button>
    </div>
  );
}
