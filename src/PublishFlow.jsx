import { useState } from 'react';

function PublishFlow({ onPublish }) {
  const [step, setStep] = useState(0);
  const steps = ['Add Title', 'Select Tier', 'Attach License', 'Confirm'];

  return (
    <div>
      <h2>{steps[step]}</h2>
      <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : onPublish()}>
        {step < steps.length - 1 ? 'Next' : 'Publish'}
      </button>
    </div>
  );
}

export default PublishFlow;
