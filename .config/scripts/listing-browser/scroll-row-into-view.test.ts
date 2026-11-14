import { waitForRenderFrame } from '../layout-pages/wait-for-render-frame.ts';
import { isBoxInViewport } from './is-box-in-viewport.test.ts';
import type { ElementHandle, Page } from 'puppeteer-core';

export async function scrollRowIntoView(
  page: Page,
  row: ElementHandle,
  selector: string,
): Promise<void> {
  const viewport = page.viewport();

  if (viewport === null) {
    throw new Error('Missing required viewport');
  }

  await page.evaluate(waitForRenderFrame);
  await page.evaluate(waitForRenderFrame);

  let box = await row.boundingBox();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (box && isBoxInViewport(box, viewport)) {
      return;
    }

    await row.evaluate((element): void => {
      element.scrollIntoView({
        block: 'center',
      });
    });
    await page.evaluate(waitForRenderFrame);
    await page.evaluate(waitForRenderFrame);
    box = await row.boundingBox();
  }

  if (box === null || !isBoxInViewport(box, viewport)) {
    throw new Error(`${selector} is not visible after scrolling`);
  }
}
