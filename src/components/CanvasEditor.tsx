// CanvasEditor.tsx
import { fabric } from 'fabric';

const canvas = new fabric.Canvas('canvas', { width: 1920, height: 1080, backgroundColor: '#fff' });

export function addLayer(type: 'text' | 'image' | 'shape', options: any) {
  let obj;
  switch (type) {
    case 'text':
      obj = new fabric.Textbox(options.text || 'New Text', { ...options });
      break;
    case 'image':
      fabric.Image.fromURL(options.url, (img) => {
        if (img) {
          img.set({ ...options });
          canvas.add(img);
        }
      });
      return;
    case 'shape':
      obj = new fabric.Rect({ ...options });
      break;
    default:
      return;
  }
  if (obj) canvas.add(obj);
}
