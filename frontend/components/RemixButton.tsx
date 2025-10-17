import AccessibleButton from './AccessibleButton';
import { logValidatorAction } from '../utils/logValidatorAction';

export default function RemixButton({ creatorId, slabId }: { creatorId: string; slabId: string }) {
  const handleRemix = () => {
    logValidatorAction(creatorId, 'remix', { slabId });
    // Trigger remix flow...
  };

  return <AccessibleButton label="Remix Slab" onClick={handleRemix} />;
}
