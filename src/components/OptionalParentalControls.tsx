import { useState } from "react";
import { hashPassword } from "../utils/parentalControls";

export const OptionalParentalControls = ({ onConfirm }: { onConfirm: (controls: any) => void }) => {
  const [enabled, setEnabled] = useState(false);
  const [rating, setRating] = useState("");
  const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false); // Added loading state

  const handleSubmit = async () => {
    if (!enabled) return onConfirm(null); // No controls set
    if (!rating || !password) return alert("Please select a rating and set a password.");
    setLoading(true);
    const passwordHash = await hashPassword(password);
    setLoading(false);
    onConfirm({
      rating,
      passwordHash,
      creationLocked: true,
    });
  };

  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
      <h3 className="font-bold text-lg mb-2">⚠️ Attention Parents</h3>
      <p className="mb-4">
        Fortheweebs includes stylized nudity, horror, and adult themes. If you do not set parental controls, you are consenting to unrestricted access and assume full responsibility. You may enable controls now or later in settings.
      </p>

      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        Enable parental controls
      </label>

      {enabled && (
        <>
          <label htmlFor="rating" className="block font-semibold mb-2">Content Access Level:</label>
          <select
            id="rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full p-2 border rounded bg-white text-black mb-4"
          >
            <option value="">-- Select Rating --</option>
            <option value="G">G – General audiences</option>
            <option value="PG">PG – Mild themes</option>
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
        </>
      )}

      <button
        onClick={handleSubmit}
        className="px-6 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700"
        disabled={loading}
      >
        {loading ? "Saving..." : "Confirm"}
      </button>
    </div>
  );
};
