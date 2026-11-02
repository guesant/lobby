import { opaqueSize } from './opaque-size.ts';
import sharp from 'sharp';

export async function calculateOpticalScales(
  names: string[],
  tileSize: number,
): Promise<Record<string, number>> {
  const scales: Record<string, number> = {};

  for (const name of names) {
    const {
      data,
      info
    } = await sharp(
      `website/src/assets/icons/source/${name}.png`,
    )
      .ensureAlpha()
      .raw()
      .toBuffer({
        resolveWithObject: true,
      });

    const size = opaqueSize(data, info.width, info.height);

    if (size <= 0) {
      throw new Error(`Empty icon source: ${name}`);
    }

    const roundedScale = ((tileSize * 5) / 6 / size).toFixed(3);

    scales[name] = Number(roundedScale);
  }

  return scales;
}
