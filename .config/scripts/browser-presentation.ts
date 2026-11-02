import { createAuditPage } from './browser-fixture.ts';
import { readConfiguration } from './configuration.ts';
import type { Browser, BrowserContext, Page } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';

type BrowserAudit = {
  context: BrowserContext;
  page: Page;
  config: ReturnType<typeof readConfiguration>;
  checks: Record<string, unknown>[];
  errors: string[];
};

export async function createBrowserAudit(
  browser: Browser,
): Promise<BrowserAudit> {
  const context = await browser.createBrowserContext();

  const page = await createAuditPage(context);

  const errors: string[] = [];

  page.on('pageerror', (error): void => {
    errors.push(String(error));
  });

  return {
    context,
    page,
    config: readConfiguration(),
    checks: [],
    errors,
  };
}

const responsiveWidths = [
  320,
  390,
  768,
  1024,
  1440,
];

async function useBrowserLanguages(
  page: Page,
  languages = [
    'en-US',
  ],
): Promise<void> {
  await page.evaluateOnNewDocument((values): void => {
    Object.defineProperty(navigator, 'languages', {
      get: (): string[] => {
        return values;
      },
    });
  }, languages);
}

async function applyAppearance(page: Page, appearance: string): Promise<void> {
  await page.evaluate((value): void => {
    document.documentElement.dataset['theme'] = value;
  }, appearance);
}

export async function applyLinkPresentation(
  page: Page,
  theme: string,
  view: string,
): Promise<void> {
  await page.evaluate(
    (input): void => {
      document.documentElement.dataset['theme'] = input.theme;
      document.documentElement.dataset['linkView'] = input.view;
    },
    {
      theme,
      view,
    },
  );
}

async function captureFromTop(page: Page, path: string): Promise<void> {
  await page.evaluate((): void => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    scrollTo(0, 0);
  });
  await page.screenshot({
    path,
    fullPage: true,
  });
}

function editorialDestinations(entries: Element[]): boolean {
  return entries.every((entry): boolean => {
    const primary =
      entry.querySelector<HTMLAnchorElement>('.editorial-primary');

    const repository =
      entry.querySelector<HTMLAnchorElement>('.editorial-details');

    return (
      primary !== null &&
      repository !== null &&
      new URL(primary.href).hostname === 'curriculum.guesant.net' &&
      [
        'github.com',
        'gitlab.com',
        'www.youtube.com',
        'youtube.com',
        'youtu.be',
      ].includes(new URL(repository.href).hostname) &&
      repository.getClientRects().length > 0 &&
      Boolean(repository.querySelector<HTMLElement>('.link-third-party-badge'))
    );
  });
}

async function withBrowser<T>(
  task: (browser: Browser) => Promise<T>,
): Promise<T> {
  const launchOptions = {
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
    ],
  };

  const browser = await puppeteer.launch(launchOptions);

  try {
    return await task(browser);
  } finally {
    await browser.close();
  }
}

export {
  applyAppearance,
  captureFromTop,
  editorialDestinations,
  responsiveWidths,
  useBrowserLanguages,
  withBrowser,
};
