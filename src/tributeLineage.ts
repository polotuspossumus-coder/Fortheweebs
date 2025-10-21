// tributeLineage.ts
export async function getTributeLineage(userId: string) {
  const response = await fetch(`/api/lineage/${userId}`);
  if (!response.ok) throw new Error('Lineage fetch failed');
  return await response.json(); // returns CGI tribute tree, founder links, campaign echoes
}
