import { useEffect, useState } from 'react';

export function useArtifact(slug: string) {
  const [artifact, setArtifact] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/artifacts/${slug}`)
      .then((res) => res.json())
      .then(setArtifact)
      .catch(() => setArtifact(null));
  }, [slug]);

  return artifact;
}
