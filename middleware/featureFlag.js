module.exports = function featureFlag(feature) {
  return (req, res, next) => {
    const tierFlags = {
      100: ['imageEditor', 'videoEditor', 'soundboard'],
      95: ['imageEditor', 'soundboard'],
      85: ['soundboard'],
      80: [],
    };
    const userTier = req.user?.tier || '80';
    if (tierFlags[userTier].includes(feature)) return next();
    res.status(403).json({ error: 'Feature not available for your tier' });
  };
};
