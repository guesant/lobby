import assert from 'node:assert/strict';
import type { Page } from 'puppeteer-core';

export async function assertClickCount(
  page: Page,
  expectedCount: number,
  context: string,
): Promise<void> {
  const clickCount = await page.evaluate((): number => {
    return window.listingClicks.length;
  });

  assert.equal(clickCount, expectedCount, context);
}
