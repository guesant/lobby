import type { AtlasContextSize } from './icon-renderer.types.ts';

export function atlasContext(
  input: AtlasContextSize,
): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');

  canvas.width = input.columns * input.size;
  canvas.height = input.size * 2;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Atlas generation requires a 2D context');
  }

  context.imageSmoothingEnabled = input.smoothing;
  context.imageSmoothingQuality = 'high';

  return context;
}
