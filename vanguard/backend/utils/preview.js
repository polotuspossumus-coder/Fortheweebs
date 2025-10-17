// utils/preview.js
// Generate a preview URL or data for a file (stub)
module.exports = function generatePreview(file) {
  if (file.type && file.type.startsWith('image')) return `/previews/${file.name}.jpg`;
  if (file.type && file.type.startsWith('video')) return `/previews/${file.name}.mp4`;
  return null;
};
