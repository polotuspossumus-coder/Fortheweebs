import React from 'react';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: React.ReactNode;
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({ label, icon, ...props }) => (
  <button
    {...props}
    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    aria-label={label}
  >
    {icon && <span className="mr-2">{icon}</span>}
    {label}
  </button>
);

export default AccessibleButton;
