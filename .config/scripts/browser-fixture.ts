import type { PageFactory } from './browser-fixture.types.ts';
import type { Page } from 'puppeteer-core';

function installAssertions(): void {
  window.lobbyAssertions = {
    element(parent: ParentNode, selector: string): HTMLElement {
      const element = parent.querySelector<HTMLElement>(selector);

      if (!element) {
        throw new Error(`Missing required element: ${selector}`);
      }

      return element;
    },
  };
}

export async function createAuditPage(factory: PageFactory): Promise<Page> {
  const page = await factory.newPage();

  await page.evaluateOnNewDocument(installAssertions);
  await page.evaluate(installAssertions);

  return page;
}
