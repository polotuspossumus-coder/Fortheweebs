module.exports = function moderateContent({ text, tags }) {
  const flaggedWords = ['hate', 'violence', 'nsfw'];
  const lowerText = text.toLowerCase();
  for (const w of flaggedWords) {
    if (lowerText.includes(w)) return { status: 'flagged', reason: `text contains '${w}'` };
    if (tags.includes(w)) return { status: 'flagged', reason: `tags include '${w}'` };
  }
  return { status: 'clean' };
};
