import type { BoundingBox, Viewport } from 'puppeteer-core';

export function isBoxInViewport(box: BoundingBox, viewport: Viewport): boolean {
  return box.y >= 0 && box.y + box.height <= viewport.height;
}
