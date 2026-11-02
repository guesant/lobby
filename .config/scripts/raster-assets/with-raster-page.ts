import { createAuditPage } from '../browser-fixture.ts';
import { installRasterHelpers } from '../raster-helpers.ts';
import type { Page } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';

export async function withRasterPage(
  task: (page: Page) => Promise<void>,
): Promise<void> {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  try {
    const page = await createAuditPage(browser);

    await page.evaluate(installRasterHelpers);
    await task(page);
  } finally {
    await browser.close();
  }
}
