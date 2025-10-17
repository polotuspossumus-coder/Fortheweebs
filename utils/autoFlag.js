module.exports = function autoFlag(file) {
  const nsfwTags = ['nsfw', 'explicit', '18+', 'uncensored'];
  const isFlagged = nsfwTags.some((tag) => file.tags?.includes(tag));
  return { ...file, flagged: isFlagged, status: isFlagged ? 'flagged' : 'pending' };
};
