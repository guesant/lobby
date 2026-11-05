export function installRasterHelpers(): void {
  window.rasterPixels = window.readRasterPixels.bind(window);
}
