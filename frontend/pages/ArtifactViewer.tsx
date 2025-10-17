import { useArtifact } from '../hooks/useArtifact';

export default function ArtifactViewer({ slug }: { slug: string }) {
  const artifact = useArtifact(slug);

  if (!artifact) return <p>Loading artifact...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{artifact.type.toUpperCase()} — {artifact.language}</h1>
      <p className="text-gray-700 whitespace-pre-wrap">{artifact.content}</p>
    </div>
  );
}
