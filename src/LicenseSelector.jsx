export default function LicenseSelector({ value, onChange }) {
  const options = ['CC-BY', 'CC0', 'Exclusive', 'Custom'];

  return (
    <div>
      <label htmlFor="license-select" className="block mb-1">License Type</label>
      <select
        id="license-select"
        value={options.includes(value) ? value : 'Custom'}
        onChange={e => onChange(e.target.value)}
        className="border p-2 rounded"
        aria-label="Select license type"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {value === 'Custom' && (
        <input
          type="text"
          className="border p-2 rounded mt-2 w-full"
          placeholder="Enter custom license"
          value={custom}
          onChange={e => { setCustom(e.target.value); onChange(e.target.value); }}
          aria-label="Custom license input"
        />
      )}
    </div>
  );
}
