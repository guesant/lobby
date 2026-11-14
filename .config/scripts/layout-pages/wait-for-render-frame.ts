export function waitForRenderFrame(): Promise<number> {
  return new Promise<number>(requestAnimationFrame);
}
