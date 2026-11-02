import { iconCatalog, iconGeometry } from '../asset-data.ts';
import { loadPNG } from '../raster-assets.ts';
import { withRasterPage } from '../raster-assets.ts';
import { calculateOpticalScales } from './calculate-optical-scales.ts';
import { createManifest } from './create-manifest.ts';
import type { RenderContext } from './icon-generation.types.ts';
import { loadTiles } from './load-tiles.ts';
import { renderContextPage } from './render-context-page.ts';
import { writeFile } from 'node:fs/promises';

export async function generateIcons(): Promise<void> {
  const catalog = await iconCatalog();

  const names = Object.keys(catalog);

  const geometry = await iconGeometry();

  const tiles = await loadTiles(names, geometry.tile_size);

  const favicon = await loadPNG('website/src/assets/icons/favicon.png', 64, 64);

  const renderContext: RenderContext = {
    tiles,
    names,
    tileSize: geometry.tile_size,
    compactTileSize: geometry.compact_tile_size,
    favicon,
  };

  const renderPage = renderContextPage.bind(null, renderContext);

  await withRasterPage(renderPage);

  const opticalScales = await calculateOpticalScales(names, geometry.tile_size);

  const manifest = createManifest({
    catalog,
    names,
    tileSize: geometry.tile_size,
    compactTileSize: geometry.compact_tile_size,
    opticalScales,
  });

  const serializedManifest = JSON.stringify(manifest, null, 2);

  await writeFile(
    'website/src/assets/icons/manifest.json',
    `${serializedManifest}\n`,
  );

  const iconCount = String(names.length);

  console.log(`Generated PNG atlas with ${iconCount} icons and PNG favicons`);
}
