import React, { useState } from "react";
/**
 * @param {{ parentId: string }} props
 */
export default function MobileRemixForm({ parentId }) {
  const [logic, setLogic] = useState("");
  const [ui, setUI] = useState("");

  const publishRemix = async () => {
    try {
      await fetch("/api/remix", {
        method: "POST",
        body: JSON.stringify({ parentId, logic, ui }),
        headers: { "Content-Type": "application/json" },
      });
      setLogic("");
      setUI("");
      // Optionally show feedback
    } catch (err) {
      // Optionally handle error
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto" aria-label="Remix form">
      <h2 className="text-lg font-bold mb-2">Remix Slab</h2>
      <label htmlFor="logic-input" className="sr-only">Logic</label>
      <textarea id="logic-input" className="w-full border p-2 mb-2" placeholder="Logic" value={logic} onChange={e => setLogic(e.target.value)} />
      <label htmlFor="ui-input" className="sr-only">UI</label>
      <textarea id="ui-input" className="w-full border p-2 mb-2" placeholder="UI" value={ui} onChange={e => setUI(e.target.value)} />
      <button className="w-full bg-indigo-600 text-white py-2 rounded" onClick={publishRemix} aria-label="Publish remix">Publish Remix</button>
    </div>
  );
}
