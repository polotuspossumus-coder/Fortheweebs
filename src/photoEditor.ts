// photoEditor.ts
import { fabric } from 'fabric';

export interface EditOptions {
  brightness?: number;
  contrast?: number;
  saturation?: number;
}

export function applyPhotoEdit(image: HTMLImageElement, edits: EditOptions) {
  const canvas = new fabric.Canvas('photo-canvas');
  fabric.Image.fromURL(image.src, (img) => {
    if (!img) return;
    if (edits.brightness)
      img.filters.push(new fabric.Image.filters.Brightness({ brightness: edits.brightness }));
    if (edits.contrast)
      img.filters.push(new fabric.Image.filters.Contrast({ contrast: edits.contrast }));
    if (edits.saturation)
      img.filters.push(new fabric.Image.filters.Saturation({ saturation: edits.saturation }));
    img.applyFilters();
    canvas.add(img);
  });
}
