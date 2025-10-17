import React from "react";
/**
 * @param {{ validator: {guild: string} }} props
 */
export default function MobileValidatorDashboard({ validator }) {
  return (
    <div className="p-4 max-w-sm mx-auto" aria-label="Validator panel">
      <h2 className="text-lg font-bold mb-2">Validator Panel</h2>
      <p className="text-sm text-gray-600">Guild: {validator.guild}</p>
      <button className="mt-2 w-full bg-indigo-600 text-white py-2 rounded" aria-label="View proposals">View Proposals</button>
      <button className="mt-2 w-full bg-purple-600 text-white py-2 rounded" aria-label="Endorse slabs">Endorse Slabs</button>
    </div>
  );
}
