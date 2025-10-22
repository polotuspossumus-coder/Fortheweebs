import React, { useState } from 'react';
import WelcomeScreen from './WelcomeScreen.jsx';
import ChooseArchetype from './ChooseArchetype.jsx';
import SelectTier from './SelectTier.jsx';
import ToolPreview from './ToolPreview.jsx';
import AcceptLegalSlabs from './AcceptLegalSlabs.jsx';
import ProfileBuilder from './ProfileBuilder.jsx';

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const steps = [
    <WelcomeScreen />,
    <ChooseArchetype />,
    <SelectTier />,
    <ToolPreview />,
    <AcceptLegalSlabs />,
    <ProfileBuilder />
  ];

  return (
    <div className="p-4">
      {steps[step]}
      <button
        onClick={() => setStep(step + 1)}
        className="mt-4 bg-purple-600 px-4 py-2 rounded"
        disabled={step >= steps.length - 1}
      >
        Next
      </button>
    </div>
  );
}
