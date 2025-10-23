// src/utils/logArtifact.ts
// Log Polotus access override as a legacy artifact

export const logArtifact = () => ({
  artifact: 'PolotusAccessBypass',
  type: 'AccessOverride',
  createdBy: 'system',
  timestamp: new Date().toISOString(),
  details: {
    user: 'jacob.morris',
    role: 'MythicFounder',
    bypass: ['accountCreation', 'paymentGate'],
    granted: true,
  },
});
