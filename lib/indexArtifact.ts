export const indexArtifact = async (artifact: any) => {
  await fetch('/api/index', {
    method: 'POST',
    body: JSON.stringify(artifact),
  });
};
