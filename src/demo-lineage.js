import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LineageMap } from './components/LineageMap';

const nodes = [
  { id: 'root', x: 100, y: 80, timestamp: '2025-10-16T00:00:00Z' },
  { id: 'child-1', x: 220, y: 160, timestamp: '2025-10-16T01:00:00Z' },
  { id: 'child-2', x: 220, y: 40, timestamp: '2025-10-16T02:00:00Z' },
];

function Controls({ multiSelect, setMultiSelect, announceSelections, setAnnounceSelections, selectedIds }) {
  return (
    <div style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <label style={{ display: 'flex', gap: 6, alignItems: 'center', color: '#fff' }}>
        <input
          type="checkbox"
          checked={multiSelect}
          onChange={(e) => setMultiSelect(e.target.checked)}
        />
        Multi-select
      </label>

      <label style={{ display: 'flex', gap: 6, alignItems: 'center', color: '#fff' }}>
        <input
          type="checkbox"
          checked={announceSelections}
          onChange={(e) => setAnnounceSelections(e.target.checked)}
        />
        Announce selections (aria-live)
      </label>

      <div style={{ color: '#d1d5db' }}>
        Selected: <strong style={{ color: '#fff' }}>{selectedIds.length ? selectedIds.join(', ') : '—'}</strong>
      </div>
    </div>
  );
}

function App() {
  const [multiSelect, setMultiSelect] = useState(true);
  const [announceSelections, setAnnounceSelections] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [history, setHistory] = useState([]);
  // resetKey removed in favor of imperative clearSelection()
  const mapRef = React.useRef(null);

  // track selection changes into history
  const handleSelectionChange = (ids) => {
    setSelectedIds(ids);
    setHistory((h) => [{ ts: new Date().toISOString(), ids }, ...h].slice(0, 20));
  };

  const resetSelections = () => {
    // clearing selectedIds will not directly clear LineageMap internal attributes,
    // but for demo we re-render by toggling a key via state trick: change nodes array reference
    // Here we simply clear the reported selectedIds and history; users can refresh the page to fully reset visuals.
    setSelectedIds([]);
    setHistory([]);
    try {
      if (mapRef.current && typeof mapRef.current.clearSelection === 'function') mapRef.current.clearSelection();
    } catch (e) {
      // ignore
    }
  };

  // keyboard shortcut: 'r' to reset
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        resetSelections();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div style={{ padding: 20, background: '#0f172a', minHeight: '100vh', color: '#fff' }}>
      <h2>LineageMap Demo</h2>

      <Controls
        multiSelect={multiSelect}
        setMultiSelect={setMultiSelect}
        announceSelections={announceSelections}
        setAnnounceSelections={setAnnounceSelections}
        selectedIds={selectedIds}
      />

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ background: '#071033', padding: 12, borderRadius: 8 }}>
          <LineageMap
            nodes={nodes}
            multiSelect={multiSelect}
            announceSelections={announceSelections}
            onSelectionChange={handleSelectionChange}
            ref={mapRef}
            onSelect={(id, selected) => console.log('onSelect', id, selected)}
          />
        </div>

        <aside style={{ width: 260, background: '#061025', borderRadius: 8, padding: 12, color: '#cbd5e1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <strong style={{ color: '#fff' }}>Selection History</strong>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={resetSelections} style={{ background: '#7f5af0', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: 4, cursor: 'pointer' }}>Reset</button>
            </div>
          </div>

          <div style={{ fontSize: 12, marginBottom: 8 }}>
            Current: <span style={{ color: '#fff' }}>{selectedIds.length ? selectedIds.join(', ') : '—'}</span>
          </div>

          <div style={{ maxHeight: 300, overflow: 'auto', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8 }}>
            {history.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: 13 }}>No history yet. Select nodes to populate history.</div>
            ) : (
              history.map((h, i) => (
                <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.02)', fontSize: 13 }}>
                  <div style={{ color: '#94a3b8' }}>{new Date(h.ts).toLocaleTimeString()}</div>
                  <div style={{ color: '#fff' }}>{h.ids.length ? h.ids.join(', ') : '—'}</div>
                </div>
              ))
            )}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>Tip: press 'r' to quickly reset the demo selection state.</div>
        </aside>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
