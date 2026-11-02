import type { RasterPixels } from './raster-pixels.types.ts';

export async function readRasterPixels(png: string): Promise<RasterPixels> {
  const image = new Image();

  image.src = `data:image/png;base64,${png}`;
  await image.decode();

  const canvas = document.createElement('canvas');

  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Raster checks require a 2D context');
  }

  context.drawImage(image, 0, 0);

  const pixels = context.getImageData(0, 0, image.width, image.height);

  return {
    width: pixels.width,
    height: pixels.height,
    data: pixels.data,
  };
}
