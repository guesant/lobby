import { atlasContext } from './atlas-context.ts';
import type { AtlasRequest } from './icon-renderer.types.ts';

export async function renderAtlas(
  input: AtlasRequest,
): Promise<Record<'pixel' | 'pixel-compact', string>> {
  const pixel = atlasContext({
    columns: input.columns,
    size: input.tileSize,
    smoothing: false,
  });

  const compact = atlasContext({
    columns: input.columns,
    size: input.compactTileSize,
    smoothing: true,
  });

  for (const tile of input.tiles) {
    const image = new Image();

    image.src = `data:image/png;base64,${tile.png}`;
    await image.decode();
    pixel.drawImage(
      image,
      tile.column * input.tileSize,
      tile.row * input.tileSize,
    );
    compact.drawImage(
      image,
      tile.column * input.compactTileSize,
      tile.row * input.compactTileSize,
      input.compactTileSize,
      input.compactTileSize,
    );
  }

  return {
    pixel: pixel.canvas
      .toDataURL('image/png')
      .slice('data:image/png;base64,'.length),
    'pixel-compact': compact.canvas
      .toDataURL('image/png')
      .slice('data:image/png;base64,'.length),
  };
}
