import { useState } from "react";

export const ParentalPasswordModal = ({
  onConfirm,
  onCancel,
  isVisible,
}: {
  onConfirm: (password: string) => void;
  onCancel: () => void;
  isVisible: boolean;
}) => {
  const [password, setPassword] = useState("");

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">🔐 Parental Access Required</h2>
        <p className="mb-4">
          This section is protected. Please enter the parental password to continue.
        </p>
        <input
          type="password"
          placeholder="Enter parental password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(password)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
