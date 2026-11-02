import { renderAtlas, renderFavicon } from '../icon-renderer.ts';
import type { RenderContext } from './icon-generation.types.ts';
import { writeAtlas } from './write-atlas.ts';
import { writeFile } from 'node:fs/promises';
import type { Page } from 'puppeteer-core';

export async function renderAtlasOnPage(
  page: Page,
  context: RenderContext,
): Promise<void> {
  const atlas = await page.evaluate(renderAtlas, {
    tiles: context.tiles,
    columns: context.names.length,
    tileSize: context.tileSize,
    compactTileSize: context.compactTileSize,
  });

  await writeAtlas(atlas);

  for (const [
    name,
    size,
  ] of [
      [
        'favicon',
        64,
      ],
      [
        'icon-192',
        192,
      ],
      [
        'icon-512',
        512,
      ],
    ] as const) {
    const png = await page.evaluate(renderFavicon, {
      favicon: context.favicon,
      size,
    });

    const image = Buffer.from(png, 'base64');

    await writeFile(`website/static/${name}.png`, image);
  }
}
