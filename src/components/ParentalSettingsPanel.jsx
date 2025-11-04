import React from "react";

/**
 * ParentalSettingsPanel UI for configuring parental controls.
 * @param settings - The current parental settings object
 * @param update - Callback to update settings
 */
export default function ParentalSettingsPanel({ settings, update }) {
  function toggle(rating) {
    const allowed = settings.allowed.includes(rating)
      ? settings.allowed.filter(x => x !== rating)
      : [...settings.allowed, rating];
    update({ ...settings, allowed });
  }

  return (
    <div className="parental-settings-panel">
      <input
        type="password"
        placeholder="Set Passkey"
        value={settings.passkey}
        onChange={e => update({ ...settings, passkey: e.target.value })}
      />
      <label>
        <input
          type="checkbox"
          checked={settings.childMode}
          onChange={e => update({ ...settings, childMode: e.target.checked })}
        />
        Child Mode
      </label>
      <div className="rating-checkboxes">
        {["G", "PG", "PG-13", "M", "MA", "XXX"].map(r => (
          <label key={r}>
            <input
              type="checkbox"
              checked={settings.allowed.includes(r)}
              onChange={() => toggle(r)}
            />
            {r}
          </label>
        ))}
      </div>
    </div>
  );
}
