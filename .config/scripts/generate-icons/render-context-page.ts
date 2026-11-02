import type { RenderContext } from './icon-generation.types.ts';
import { renderAtlasOnPage } from './render-atlas-on-page.ts';
import type { Page } from 'puppeteer-core';

export async function renderContextPage(
  context: RenderContext,
  page: Page,
): Promise<void> {
  await renderAtlasOnPage(page, context);
}
