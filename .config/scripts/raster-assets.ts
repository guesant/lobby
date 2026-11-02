import { createAuditPage } from './browser-fixture.ts';
import { installRasterHelpers } from './raster-helpers.ts';
import { readFile } from 'node:fs/promises';
import type { Page } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';

const signature = Buffer.from([
  137,
  80,
  78,
  71,
  13,
  10,
  26,
  10,
]);

export async function loadPNG(
  path: string,
  width: number,
  height: number,
): Promise<string> {
  const png = await readFile(path);

  if (
    png.length < 24 ||
    !png.subarray(0, 8)
      .equals(signature) ||
    png.readUInt32BE(16) !== width ||
    png.readUInt32BE(20) !== height
  ) {
    throw new Error(`${path} must be a ${String(width)}x${String(height)} PNG`);
  }

  return png.toString('base64');
}

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
