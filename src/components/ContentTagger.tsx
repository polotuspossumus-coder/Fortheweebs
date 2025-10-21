import { useState } from "react";

export const ContentTagger = ({ onSubmit }: { onSubmit: (rating: string) => void }) => {
  const [rating, setRating] = useState("");

  const handleSubmit = () => {
    if (!rating) return alert("Please select a rating for your content.");
    onSubmit(rating);
  };

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-900 p-4 mb-6 rounded">
      <h3 className="font-bold text-lg mb-2">Content Rating</h3>
      <p className="mb-4">Select the appropriate rating for your content. This helps keep the platform safe and compliant for all users.</p>
      <select
        value={rating}
        onChange={e => setRating(e.target.value)}
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
      <button
        onClick={handleSubmit}
        className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700"
      >
        Tag Content
      </button>
    </div>
  );
};
