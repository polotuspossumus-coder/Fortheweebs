import { useState } from 'react';

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const steps = [
    'Choose your creator name',
    'Select your media focus (music, video, art)',
    'Upload your first artifact',
    'Set your access tier',
  ];

  return (
    <div className="p-6 bg-white rounded shadow max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Welcome to Vanguard</h2>
      <p className="mb-4">{steps[step]}</p>
      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded"
        onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()}
      >
        {step < steps.length - 1 ? 'Next' : 'Finish'}
      </button>
    </div>
  );
}
