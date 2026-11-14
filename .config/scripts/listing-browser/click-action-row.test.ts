import { waitForRenderFrame } from '../layout-pages/wait-for-render-frame.ts';
import { assertClickCount } from './assert-click-count.test.ts';
import { rowPaddingPoint } from './row-padding-point.test.ts';
import { scrollRowIntoView } from './scroll-row-into-view.test.ts';
import type { ElementHandle, Page } from 'puppeteer-core';

export async function clickActionRow(
  page: Page,
  row: ElementHandle,
  selector: string,
): Promise<void> {
  await scrollRowIntoView(page, row, selector);

  const paddingPoint = await rowPaddingPoint(row);

  await page.mouse.click(paddingPoint.x, paddingPoint.y);
  await page.evaluate(waitForRenderFrame);
  await page.evaluate(waitForRenderFrame);

  await assertClickCount(page, 1, `${selector} whole-row click`);

  await page.click(`${selector} .action-row-title`);
  await page.evaluate(waitForRenderFrame);
  await page.evaluate(waitForRenderFrame);

  await assertClickCount(page, 2, `${selector} title click`);

  await page.click(`${selector} .external-link-icon`);
  await page.evaluate(waitForRenderFrame);
  await page.evaluate(waitForRenderFrame);

  await assertClickCount(page, 3, `${selector} external indicator click`);
}
