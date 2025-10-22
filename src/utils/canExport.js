function canExport(userTier, tool) {
  const exportable = {
    mythic: ['canvas', 'cgi', 'sound', 'video'],
    standard: ['canvas', 'cgi', 'sound', 'video'],
    legacy: ['canvas', 'sound'],
    supporter: ['canvas'],
    general: []
  };
  return exportable[userTier]?.includes(tool);
}

export { canExport };
