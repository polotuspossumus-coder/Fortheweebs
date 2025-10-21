// autoCrop.ts
export interface CroppedImage {
  blob?: Blob;
  dataURL?: string;
}

export async function autoCrop(image: Blob): Promise<CroppedImage> {
  const response = await fetch('/api/crop', {
    method: 'POST',
    body: image,
  });
  if (!response.ok) throw new Error(`Auto-crop failed: ${response.statusText}`);
  return await response.json(); // returns cropped image blob or dataURL
}
