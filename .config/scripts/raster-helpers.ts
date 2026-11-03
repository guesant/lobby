import { readRasterPixels } from './read-raster-pixels.ts';

export function installRasterHelpers(): void {
  window.rasterPixels = readRasterPixels;
}
