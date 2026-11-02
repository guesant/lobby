import { pngSignature } from './png-signature.ts';
import { readFile } from 'node:fs/promises';

export async function loadPNG(
  path: string,
  width: number,
  height: number,
): Promise<string> {
  const png = await readFile(path);

  if (
    png.length < 24 ||
    !png.subarray(0, 8)
      .equals(pngSignature) ||
    png.readUInt32BE(16) !== width ||
    png.readUInt32BE(20) !== height
  ) {
    throw new Error(`${path} must be a ${String(width)}x${String(height)} PNG`);
  }

  return png.toString('base64');
}
