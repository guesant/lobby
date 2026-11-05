import type { RasterPixels } from './raster-pixels.types.ts';
import sharp from 'sharp';

export async function readRasterPixels(png: string): Promise<RasterPixels> {
  const bytes = Buffer.from(png, 'base64');

  const source = sharp(bytes);

  const raw = source.raw();

  const decoded = await raw.toBuffer({
    resolveWithObject: true,
  });

  return {
    width: decoded.info.width,
    height: decoded.info.height,
    data: new Uint8ClampedArray(decoded.data),
  };
}
