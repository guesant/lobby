import { loadPNG } from '../raster-assets.ts';
import type { AtlasTile } from './icon-generation.types.ts';

export async function loadTiles(
  names: string[],
  tileSize: number,
): Promise<AtlasTile[]> {
  const tiles: AtlasTile[] = [];

  for (const [
    column,
    name,
  ] of names.entries()) {
    for (const [
      row,
      suffix,
    ] of [
        '',
        '-mask',
      ].entries()) {
      const png = await loadPNG(
        `website/src/assets/icons/source/${name}${suffix}.png`,
        tileSize,
        tileSize,
      );

      tiles.push({
        png,
        column,
        row,
      });
    }
  }

  return tiles;
}
