import { useState, useEffect } from 'react';
import Sortable from 'sortablejs';

function FrameSequencer({ frames, setFrames }) {
  useEffect(() => {
    const el = document.getElementById('frame-list');
    if (!el) return;
    const sortable = Sortable.create(el, {
      animation: 150,
      onEnd: (e) => {
        const reordered = [...frames];
        const [moved] = reordered.splice(e.oldIndex, 1);
        reordered.splice(e.newIndex, 0, moved);
        setFrames(reordered);
      },
    });
    return () => sortable.destroy();
  }, [frames, setFrames]);

  return (
    <ul id="frame-list">
      {frames.map((frame, i) => (
        <li key={i}><img src={frame} alt={`Frame ${i}`} /></li>
      ))}
    </ul>
  );
}

export default FrameSequencer;
