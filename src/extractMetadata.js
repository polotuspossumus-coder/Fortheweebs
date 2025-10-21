export async function extractMetadata(file) {
  const type = detectType(file);
  const tags = await autoTag(file, type);
  return { type, tags };
}

function detectType(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (["mp3", "wav", "flac"].includes(ext)) return "audio";
  if (["mp4", "mov", "avi"].includes(ext)) return "video";
  if (["jpg", "png", "gif"].includes(ext)) return "image";
  if (["txt", "pdf", "docx"].includes(ext)) return "text";
  return "unknown";
}

async function autoTag(file, type) {
  // Placeholder: replace with AI-powered tagging
  return [`tagged-${type}`, `actor-${file.name}`];
}
