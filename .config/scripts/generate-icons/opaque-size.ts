export function opaqueSize(
  data: Uint8Array,
  width: number,
  height: number,
): number {
  const bounds = {
    left: width,
    top: height,
    right: -1,
    bottom: -1,
  };

  for (let offset = 3; offset < data.length; offset += 4) {
    const alpha = data[offset];

    if (alpha === undefined) {
      throw new Error('Missing alpha channel');
    }

    if (alpha <= 16) {
      continue;
    }

    const pixel = (offset - 3) / 4;

    const x = pixel % width;

    const y = Math.floor(pixel / width);

    bounds.left = Math.min(bounds.left, x);
    bounds.top = Math.min(bounds.top, y);
    bounds.right = Math.max(bounds.right, x);
    bounds.bottom = Math.max(bounds.bottom, y);
  }

  return Math.max(
    bounds.right - bounds.left + 1,
    bounds.bottom - bounds.top + 1,
  );
}
