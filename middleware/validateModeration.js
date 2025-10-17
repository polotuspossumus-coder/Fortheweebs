module.exports = function validateModeration(req, res, next) {
  const { ids, action } = req.body;
  if (!Array.isArray(ids) || !['approve', 'reject', 'flag'].includes(action)) {
    return res.status(400).json({ error: 'Invalid moderation payload' });
  }
  next();
};
