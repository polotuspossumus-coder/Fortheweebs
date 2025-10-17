import { useState } from 'react';
import AccessibleButton from './AccessibleButton';

/**
 * @param {Object} props
 * @param {function} [props.onBegin]
 */
export default function MobileOnboarding(props) {
  const onBegin = props.onBegin;
  const [tier, setTier] = useState('100');

  /**
   * @param {React.ChangeEvent<HTMLSelectElement>} e
   */
  const handleChange = (e) => setTier(e.target.value);
  const handleBegin = () => {
    if (typeof onBegin === 'function') onBegin(tier);
  };

  return (
    <div
      className="p-4 max-w-sm mx-auto bg-white rounded-lg shadow-lg"
      role="form"
      aria-label="Mobile onboarding"
    >
      <h2 className="text-2xl font-bold mb-2 text-indigo-700">Welcome to Fortheweebs</h2>
      <p className="text-base mb-4 text-gray-700">Start your remix journey. Choose your tier:</p>
      <label htmlFor="tier-select" className="sr-only">
        Choose your profit tier
      </label>
      <select
        id="tier-select"
        className="w-full p-2 border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500"
        value={tier}
        onChange={handleChange}
        aria-label="Profit tier"
      >
        <option value="100">Tier 100 – 100% Profit</option>
        <option value="95">Tier 95 – 95% Profit</option>
        <option value="85">Tier 85 – 85% Profit</option>
        <option value="80">Tier 80 – 80% Profit</option>
      </select>
      <div className="mt-4">
        <AccessibleButton label="Begin onboarding" onClick={handleBegin} />
      </div>
    </div>
  );
}
