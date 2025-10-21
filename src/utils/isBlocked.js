// Utility to check if a viewer is blocked from a content owner
export async function isBlocked(viewerIP, contentOwnerId) {
  const res = await fetch(`/api/isBlocked?ip=${viewerIP}&owner=${contentOwnerId}`);
  const { blocked } = await res.json();
  return blocked;
}
