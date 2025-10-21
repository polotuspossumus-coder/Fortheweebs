// memeForge.ts
import { fabric } from 'fabric';

export function generateMeme(imageURL: string, topText: string, bottomText: string) {
  const canvas = new fabric.Canvas('meme-canvas');
  fabric.Image.fromURL(imageURL, (img) => {
    if (!img) return;
    canvas.add(img);
    const top = new fabric.Text(topText, {
      top: 10,
      left: canvas.width ? canvas.width / 2 : 0,
      originX: 'center',
      fontSize: 40,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2,
      fontWeight: 'bold',
      shadow: 'rgba(0,0,0,0.5) 2px 2px 2px',
    });
    const bottom = new fabric.Text(bottomText, {
      top: (img.height ? img.height : 0) - 60,
      left: canvas.width ? canvas.width / 2 : 0,
      originX: 'center',
      fontSize: 40,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2,
      fontWeight: 'bold',
      shadow: 'rgba(0,0,0,0.5) 2px 2px 2px',
    });
    canvas.add(top);
    canvas.add(bottom);
  });
}
