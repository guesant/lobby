import { readRasterPixels } from './read-raster-pixels.ts';

export type { RasterPixels } from './raster-pixels.types.ts';

export function installRasterHelpers(): void {
  window.rasterPixels = readRasterPixels;
}
