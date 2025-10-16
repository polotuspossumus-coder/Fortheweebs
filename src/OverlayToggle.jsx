// Overlay toggle using Radix UI
import React, { useState } from 'react';
import * as Switch from '@radix-ui/react-switch';

export default function OverlayToggle() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="overlay-toggle">
      <label htmlFor="overlay-switch">Overlay</label>
      <Switch.Root id="overlay-switch" checked={enabled} onCheckedChange={setEnabled} className={enabled ? 'switch-root enabled' : 'switch-root'}>
        <Switch.Thumb className="switch-thumb" />
      </Switch.Root>
      <span>{enabled ? 'On' : 'Off'}</span>
    </div>
  );
}
