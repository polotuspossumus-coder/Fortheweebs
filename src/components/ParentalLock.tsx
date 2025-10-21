import { useState } from "react";

export const ParentalLock = ({ onSetLock }: { onSetLock: (lock: { rating: string; password: string }) => void }) => {
  const [rating, setRating] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!rating || !password) return alert("Please select a rating and set a password.");
    onSetLock({ rating, password });
  };

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded">
      <h3 className="font-bold text-lg mb-2">🔒 Parental Controls</h3>
      <p className="mb-4">
        Set a content rating and lock it with a separate password. Your child will not be able to change these settings without your password.
      </p>

      <label htmlFor="rating" className="block font-semibold mb-2">Content Access Level:</label>
      <select
        id="rating"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        className="w-full p-2 border rounded bg-white text-black mb-4"
      >
        <option value="">-- Select Rating --</option>
        <option value="G">G – General audiences</option>
        <option value="PG">PG – Some mild content</option>
        <option value="PG-13">PG-13 – Stylized nudity, horror, suggestive themes</option>
        <option value="M">M – Mature themes, adult content</option>
        <option value="MA">MA – Explicit adult content</option>
        <option value="XXX">XXX – Unrestricted explicit content</option>
      </select>

      <label htmlFor="password" className="block font-semibold mb-2">Parent Password:</label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded bg-white text-black mb-4"
      />

      <button
        onClick={handleSubmit}
        className="px-6 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700"
      >
        Lock Settings
      </button>
    </div>
  );
};
