export default function AccessibleButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      role="button"
      aria-label={label}
      className="focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {label}
    </button>
  );
}
