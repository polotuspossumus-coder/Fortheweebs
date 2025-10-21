export const remixTribute = (tributeId, remixType) => {
  return {
    tributeId,
    remixType,
    remix: `Remixed tribute ${tributeId} with style ${remixType}`,
    timestamp: new Date().toISOString(),
  };
};
