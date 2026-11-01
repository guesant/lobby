import type { Page, Browser } from 'puppeteer-core';
import { createBrowserAudit } from './browser-presentation.ts';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pagesFor } from './configuration.ts';
import type { ConfiguredPage } from '../../website/src/lib/configuration.ts';

async function inspectLists(
  page: Page,
  expected: ConfiguredPage[],
  currentID: string,
  baseURL: string,
): Promise<void> {
  const normalize = (
    entry: ConfiguredPage,
  ): {
    title: string;
    href: string;
    current: boolean;
  } => {
    return {
      title: entry.title,
      href: new URL(entry.url, baseURL).href,
      current: entry.id === currentID,
    };
  };

  for (const selector of [
    '.header-navigation-links a',
    '.footer-navigation-links a',
  ] as const) {
    assert.deepEqual(
      await page.$$eval(
        selector,
        (
          links,
        ): {
          title: string;
          href: string;
          current: boolean;
        }[] => {
          return links.map(
            (
              link,
            ): {
              title: string;
              href: string;
              current: boolean;
            } => {
              if (!(link instanceof HTMLAnchorElement)) {
                throw new Error('Expected HTMLAnchorElement: link');
              }

              return {
                title: link.textContent.trim(),
                href: link.href,
                current: link.getAttribute('aria-current') === 'page',
              };
            },
          );
        },
      ),
      expected.map(normalize),
    );
  }

  assert.equal(
    await page.$('.profile-navigation details, .quick-access'),
    null,
  );
  assert.equal(
    await page.$eval('.profile-navigation', (nav): boolean => {
      return Boolean(nav.closest('.profile'));
    }),
    true,
  );
}

async function inspectGeometry(page: Page): Promise<void> {
  const actual = await page.evaluate(
    (): {
      insideHeader: boolean;
      overflow: boolean;
      linksFit: boolean;
      textOnly: boolean;
    } => {
      const header = document
        .querySelector<HTMLElement>('.profile')!
        .getBoundingClientRect();

      const navigation = document
        .querySelector<HTMLElement>('.profile-navigation')!
        .getBoundingClientRect();

      const quick = document
        .querySelector<HTMLElement>('.quick-contacts')!
        .getBoundingClientRect();

      const links = [
        ...document.querySelectorAll<HTMLAnchorElement>('.navigation-links a'),
      ];

      return {
        insideHeader:
          navigation.top >= header.top &&
          navigation.bottom <= quick.top &&
          quick.bottom <= header.bottom &&
          navigation.left >= header.left &&
          navigation.right <= header.right,
        overflow: document.documentElement.scrollWidth > innerWidth,
        linksFit: links.every((link): boolean => {
          return (
            link.scrollWidth <= link.clientWidth + 1 &&
            link.getBoundingClientRect().height >= 44
          );
        }),
        textOnly: links.every((link): boolean => {
          const style = getComputedStyle(link);

          return (
            style.borderImageSource === 'none' &&
            style.borderWidth === '0px' &&
            style.backgroundColor === 'rgba(0, 0, 0, 0)' &&
            style.boxShadow === 'none' &&
            style.transform === 'none'
          );
        }),
      };
    },
  );

  assert.deepEqual(actual, {
    insideHeader: true,
    overflow: false,
    linksFit: true,
    textOnly: true,
  });
}

async function inspectKeyboardNavigation(
  page: Page,
  baseURL: string,
): Promise<void> {
  await page.goto(new URL('/pt-br/', baseURL).href, {
    waitUntil: 'networkidle0',
  });
  await page.evaluate((): void => {
    window.navigationTest = true;
  });
  await page.focus('.header-navigation-links a');
  await page.keyboard.press('Tab');
  assert.equal(
    await page.$eval(':focus', (link): string | undefined => {
      if (!(link instanceof HTMLElement)) {
        throw new Error('Expected HTMLElement: link');
      }

      return link.dataset.navigationPage;
    }),
    'career',
  );
  await page.keyboard.press('Enter');
  await page.waitForFunction((): boolean => {
    return document.documentElement.dataset.page === 'career';
  });
  assert.equal(
    await page.evaluate((): boolean => {
      return window.navigationTest;
    }),
    true,
    'navigation stays client-side',
  );
  await page.setJavaScriptEnabled(false);
  await page.reload({
    waitUntil: 'networkidle0',
  });
  await page.focus('.header-navigation-links a[data-navigation-page="code"]');
  await Promise.all([
    page.waitForNavigation({
      waitUntil: 'networkidle0',
    }),
    page.keyboard.press('Enter'),
  ]);
  assert.equal(new URL(page.url()).pathname, '/pt-br/code/');
  await page.setJavaScriptEnabled(true);
}

async function checkNavigationBrowser(
  browser: Browser,
  baseURL: string,
  reportDirectory: string,
  pageIDs: string[] = [],
): Promise<void> {
  const {
    config,
    context,
    page,
    checks,
    errors
  } =
    await createBrowserAudit(browser);

  fs.mkdirSync(reportDirectory, {
    recursive: true,
  });

  try {
    for (const language of config.language_options) {
      const pages = pagesFor(config, language.id);

      const expected = pages.filter((entry): boolean => {
        return (
          [
            'home',
            'links-page',
          ].includes(entry.type) || entry.id === 'now'
        );
      });

      const routes = pages.filter((entry): boolean => {
        return (
          !entry.fallback && (!pageIDs.length || pageIDs.includes(entry.id))
        );
      });

      for (const route of routes) {
        await page.goto(new URL(route.url, baseURL).href, {
          waitUntil: 'networkidle0',
        });
        await page.evaluate((): Promise<FontFaceSet> => {
          return document.fonts.ready;
        });
        await inspectLists(page, expected, route.id, baseURL);

        for (const theme of [
          'dark',
          'light',
        ] as const) {
          await inspectNavigationAppearance(page, theme, checks, route);
        }
      }
    }

    await inspectKeyboardNavigation(page, baseURL);
    await page.goto(new URL('/pt-br/', baseURL).href, {
      waitUntil: 'networkidle0',
    });
    await page.$eval('html', (root): void => {
      root.style.fontSize = '200%';
    });

    for (const width of [
      320,
      390,
      768,
      1024,
      1440,
    ] as const) {
      await page.setViewport({
        width,
        height: 900,
      });
      await inspectGeometry(page);
    }

    assert.deepEqual(errors, []);
    fs.writeFileSync(
      `${reportDirectory}/navigation-checks.json`,
      JSON.stringify(
        {
          passed: checks.length,
          failures: errors,
          checks,
        },
        null,
        2,
      ),
    );
    console.log(
      JSON.stringify({
        navigationChecks: checks.length,
        failures: errors,
      }),
    );
  } finally {
    await context.close();
  }
}

export default checkNavigationBrowser;

async function inspectNavigationAppearance(
  page: Page,
  theme: string,
  checks: Record<string, unknown>[],
  route: ConfiguredPage,
): Promise<void> {
  await page.evaluate((theme): void => {
    document.documentElement.dataset.theme = theme;
  }, theme);

  for (const width of [
    320,
    390,
    768,
    1024,
    1440,
  ] as const) {
    await page.setViewport({
      width,
      height: 900,
    });
    await inspectGeometry(page);
    checks.push({
      path: route.url,
      theme,
      width,
      passed: true,
    });
  }
}
