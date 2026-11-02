import { createAuditPage } from './browser-fixture.ts';
import type { Page } from 'puppeteer-core';
import puppeteer, { type LaunchOptions, type Viewport } from 'puppeteer-core';

export type AccessibilityAudit = {
  url: string;
  actions?: string[];
  rootElement?: string;
  viewport?: Viewport;
};

export type AccessibilityDefaults = {
  chromeLaunchConfig: LaunchOptions;
  viewport: Viewport;
};

function accessibilityView(audit: AccessibilityAudit): 'compact' | 'detailed' {
  if (
    audit.actions?.includes('click element label[for="link-view-detailed"]')
  ) {
    return 'detailed';
  }

  return 'compact';
}

async function measureHeight(
  page: Page,
  audit: AccessibilityAudit,
  view: string,
): Promise<number> {
  await page.goto(audit.url, {
    waitUntil: 'networkidle2',
  });
  await page.evaluate((view): void => {
    document.documentElement.dataset['linkView'] = view;
  }, view);
  await page.evaluate((): Promise<FontFaceSet> => {
    return document.fonts.ready;
  });

  return page.evaluate((): number => {
    return document.documentElement.scrollHeight;
  });
}

export default async function accessibilityViewports(
  audits: AccessibilityAudit[],
  defaults: AccessibilityDefaults,
): Promise<void> {
  const browser = await puppeteer.launch(defaults.chromeLaunchConfig);

  const heights = new Map<string, number>();

  try {
    const page = await createAuditPage(browser);

    await page.setViewport(defaults.viewport);

    for (const audit of audits) {
      const view = accessibilityView(audit);

      const key = `${audit.url}:${view}`;

      if (!heights.has(key)) {
        heights.set(key, await measureHeight(page, audit, view));
      }

      audit.viewport = {
        ...defaults.viewport,
        height: Math.max(
          defaults.viewport.height,
          heights.get(key) ?? defaults.viewport.height,
        ),
      };
    }
  } finally {
    await browser.close();
  }
}
