type IconTile = {
  png: string;
  column: number;
  row: number;
};

type AtlasRequest = {
  tiles: IconTile[];
  columns: number;
  tileSize: number;
  compactTileSize: number;
};

export async function renderAtlas(
  input: AtlasRequest,
): Promise<Record<'pixel' | 'pixel-compact', string>> {
  function contextFor(
    size: number,
    smoothing: boolean,
  ): CanvasRenderingContext2D {
    const canvas = document.createElement('canvas');

    canvas.width = input.columns * size;
    canvas.height = size * 2;

    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Atlas generation requires a 2D context');
    }

    context.imageSmoothingEnabled = smoothing;
    context.imageSmoothingQuality = 'high';

    return context;
  }

  const pixel = contextFor(input.tileSize, false);

  const compact = contextFor(input.compactTileSize, true);

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

export async function renderFavicon(input: {
  favicon: string;
  size: number;
}): Promise<string> {
  const image = new Image();

  image.src = `data:image/png;base64,${input.favicon}`;
  await image.decode();

  const canvas = document.createElement('canvas');

  canvas.width = canvas.height = input.size;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Favicon generation requires a 2D context');
  }

  context.imageSmoothingEnabled = false;
  context.drawImage(image, 0, 0, input.size, input.size);

  return canvas.toDataURL('image/png')
    .slice('data:image/png;base64,'.length);
}
