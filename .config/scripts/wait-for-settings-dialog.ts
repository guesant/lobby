import type { Page } from 'puppeteer-core';

export async function waitForSettingsDialog(page: Page): Promise<void> {
  await page.waitForSelector('#settings-dialog', {
    visible: true,
  });
}
