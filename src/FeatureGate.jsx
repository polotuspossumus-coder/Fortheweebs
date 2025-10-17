function FeatureGate({ feature, children }) {
  const tier = useUserTier(); // e.g., '95'
  const flags = {
    '100': ['imageEditor', 'videoEditor', 'soundboard'],
    '95': ['imageEditor', 'soundboard'],
    '85': ['soundboard'],
    '80': [],
  };
  return flags[tier]?.includes(feature) ? children : null;
}

export default FeatureGate;
