// utils/autoFlag.js
// Auto-flag files based on tags or content (stub)
module.exports = function autoFlag(file) {
  const nsfwTags = ['nsfw', 'explicit', '18+'];
  return Array.isArray(file.tags) && nsfwTags.some((tag) => file.tags.includes(tag));
};
