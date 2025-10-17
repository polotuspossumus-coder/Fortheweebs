module.exports = function tagAsset(file) {
  const tags = [];
  if (file.type && file.type.includes('image')) tags.push('image');
  if (file.name && file.name.toLowerCase().includes('nsfw')) tags.push('nsfw');
  if (file.size && file.size > 5_000_000) tags.push('large');
  return tags;
};
