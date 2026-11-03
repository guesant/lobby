import { validateStatistics } from '../../website/src/lib/features/content/statistics.validation.ts';
import { textOr } from '../../website/src/lib/features/content/text-or.model.ts';
import { activateElement } from './browser-dom.ts';
import { createAuditPage } from './browser-fixture.ts';
import { checkProgressiveScene } from './check-progressive-scene.ts';
import { pagesFor, readConfiguration, visibleLinks } from './configuration.ts';
import type { LayoutRoute } from './layout.types.ts';
import { measureMaterialContrast } from './layout-contrast.ts';
import { verifyDialogs } from './layout-dialogs.ts';
import { verifyRouteMetadata } from './layout-metadata.ts';
import {
  inspectHomeCategories,
  inspectLayoutViewport,
  inspectStatistics,
} from './layout-pages.ts';
import type { LayoutContext } from './layout-pages.types.ts';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resolve } from 'node:path';
import type { Page } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';
import { parse } from 'yaml';

const config = readConfiguration(
  textOr(
    process.env['QA_LINKS_CONFIG'],
    resolve(import.meta.dirname, '../../website/src/data/links.yaml'),
  ),
);

const primaryLanguage = config.language_options[0];

assert.ok(primaryLanguage, 'at least one localized language is configured');

const primaryLanguageID = primaryLanguage.id;

const snapshots = validateStatistics(
  parse(
    fs.readFileSync(
      resolve(import.meta.dirname, '../../website/src/data/statistics.yaml'),
      'utf8',
    ),
  ) as unknown,
);

const reportDirectory = textOr(
  process.env['QA_REPORT_DIR'],
  resolve('.local/reports'),
);

const base = new URL(
  textOr(process.env['QA_BASE_URL'], 'http://127.0.0.1:4173')
    .replace(
      /\/$/,
      '',
    ) + '/',
);

function href(path: string): string {
  if (/^(https?:|mailto:|tel:)/.test(path)) {
    return new URL(path).href;
  }

  return new URL(path.replace(/^\/+/, ''), base).href;
}

const widths = [
  320,
  390,
  768,
  1024,
  1440,
];

const routes = config.language_options.flatMap((input): LayoutRoute[] => {
  const {
    id
  } = input;

  return pagesFor(config, id)
    .filter((page): boolean => {
      return !page.fallback;
    })
    .map((page): LayoutRoute => {
      return {
        ...page,
        language: id,
      };
    });
});

const checks: Record<string, unknown>[] = [];

const layoutContext: LayoutContext = {
  config,
  href,
  checks,
  snapshots,
  reportDirectory,
};

(async (): Promise<void> => {
  fs.mkdirSync(reportDirectory, {
    recursive: true,
  });

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await createAuditPage(browser);

  const errors: string[] = [];

  page.on('pageerror', (error): number => {
    return errors.push(String(error));
  });
  page.on('response', (response): void => {
    if (response.url()
      .startsWith(base.origin) && response.status() >= 400) {
      errors.push(`${String(response.status())} ${response.url()}`);
    }
  });

  const represented = new Set<string>();

  try {
    await checkProgressiveScene(browser, base.href);

    for (const route of routes) {
      await inspectLayoutRoute(page, route, represented);
    }

    assert.deepEqual(
      [
        ...represented,
      ].sort(),
      visibleLinks(config)
        .map((entry): string => {
          return entry.id;
        })
        .sort(),
      'Every public entry must have a page or tab',
    );
    await page.setJavaScriptEnabled(false);

    for (const route of routes) {
      await page.goto(href(route.url), {
        waitUntil: 'networkidle2',
      });

      if (!route.url.includes('/terminal/')) {
        assert.equal(
          await page.$eval('.world-landscape', (landscape): boolean => {
            const root = document.documentElement;

            const worldLandscapePreview = window.lobbyAssertions.element(
              document,
              '.world-landscape-preview',
            );

            const preview = getComputedStyle(worldLandscapePreview);

            return (
              !root.hasAttribute('data-js-enabled') &&
              getComputedStyle(landscape).backgroundImage !== 'none' &&
              Number(preview.opacity) === 0
            );
          }),
          true,
          `${route.url} progressive scene fallback without JavaScript`,
        );
      }

      assert.equal(
        await page.$eval('.header-navigation-links a', (tab): boolean => {
          return tab.getBoundingClientRect().height >= 44;
        }),
        true,
      );

      const destination = pagesFor(config, route.language)
        .find(
          (entry): boolean => {
            return (
              entry.id !== route.id &&
            [
              'home',
              'links-page',
            ].includes(entry.type)
            );
          },
        );

      if (destination === undefined) {
        throw new Error('Missing required destination');
      }

      await page.focus(
        `.header-navigation-links a[href="${new URL(href(destination.url)).pathname}"]`,
      );
      assert.equal(
        await page.$eval(':focus', (element): string => {
          return getComputedStyle(element).outlineStyle;
        }),
        'solid',
      );
      await Promise.all([
        page.waitForNavigation({
          waitUntil: 'networkidle2',
        }),
        page.keyboard.press('Enter'),
      ]);
      assert.equal(page.url(), href(destination.url));
      checks.push({
        path: route.url,
        navigationWithoutJavaScript: true,
        passed: true,
      });
    }

    await page.setJavaScriptEnabled(true);

    for (const language of config.language_options) {
      for (const id of [
        'start-here',
        'networks',
        'personal',
      ] as const) {
        await inspectIdCase(language, id);
      }
    }

    const requiredValue = config.language_options[0];

    if (requiredValue === undefined) {
      throw new Error('Missing required requiredValue');
    }

    await page.goto(href(requiredValue.path), {
      waitUntil: 'networkidle2',
    });
    await page.click('[data-settings-open]');
    await page.$eval('#motion-off', activateElement);
    await page.reload({
      waitUntil: 'networkidle2',
    });
    assert.equal(
      await page.$eval('html', (root): string | undefined => {
        return root.dataset['motion'];
      }),
      'off',
    );
    await page.click('[data-settings-open]');
    await page.emulateMediaFeatures([
      {
        name: 'prefers-reduced-motion',
        value: 'reduce',
      },
    ]);
    await page.$eval('#motion-on', activateElement);
    assert.equal(
      await page.$eval('html', (root): string | undefined => {
        return root.dataset['motion'];
      }),
      'off',
    );
    await page.emulateMediaFeatures([
      {
        name: 'prefers-color-scheme',
        value: 'light',
      },
    ]);
    await page.$eval('#theme-system', activateElement);
    assert.equal(
      await page.$eval('html', (root): string => {
        return getComputedStyle(root).colorScheme;
      }),
      'light',
    );
    assert.deepEqual(errors, []);
    await (
      await import('./check-navigation-browser.ts')
    ).default({
      browser,
      baseURL: base.href,
      reportDirectory,
    });
    await (
      await import('./check-language-browser.ts')
    ).default(browser, base.href);
    await (
      await import('./check-listing-browser.ts')
    ).default(browser, base.href, reportDirectory);
    await (
      await import('./check-component-parity.ts')
    ).default({
      browser,
      baseURL: base.href,
      reportDirectory,
    });
    await (
      await import('./check-link-view-browser.ts')
    ).default(browser, base.href, reportDirectory);
    await (
      await import('./check-compact-controls.ts')
    ).default(browser, base.href, reportDirectory);
    await (
      await import('./check-terminal-browser.ts')
    ).default(browser, base.href, reportDirectory);
    await (
      await import('./check-bios-browser.ts')
    ).default(browser, base.href, reportDirectory);
    await (
      await import('./check-native-runtime-browser.ts')
    ).default(browser, base.href);
    fs.writeFileSync(
      `${reportDirectory}/layout-checks.json`,
      JSON.stringify(
        {
          passed: checks.length,
          pages: routes.length,
          widths,
          failures: errors,
          checks,
        },
        null,
        2,
      ),
    );
    console.log(
      JSON.stringify({
        passed: checks.length,
        pages: routes.length,
        widths,
        failures: errors,
      }),
    );
  } finally {
    await browser.close();
  }

  async function inspectIdCase(
    language: {
      id: string;
      path: string;
      label: string;
      hreflang: string;
    },
    id: string,
  ): Promise<void> {
    for (const suffix of [
      '/',
      '',
    ] as const) {
      await inspectSuffixCase(language, id, suffix);
    }
  }

  async function inspectSuffixCase(
    language: {
      id: string;
      path: string;
      label: string;
      hreflang: string;
    },
    id: string,
    suffix: string,
  ): Promise<void> {
    const response = await fetch(href(`${language.path}${id}${suffix}`), {
      redirect: 'manual',
    });

    assert.equal(
      response.status,
      404,
      `${language.path}${id}${suffix} must return 404`,
    );
  }
})()
  .catch((error: unknown): void => {
    console.error(error);
    process.exitCode = 1;
  });

async function inspectLayoutRoute(
  page: Page,
  route: LayoutRoute,
  represented: Set<string>,
): Promise<void> {
  const nowPage = await verifyRouteMetadata({
    page,
    route,
    config,
    represented,
    href,
  });

  for (const theme of [
    'dark',
    'light',
  ] as const) {
    await inspectRouteAppearance(theme);
  }

  await inspectHomeCategories({
    route,
    page,
    nowPage,
    context: layoutContext,
  });

  await inspectStatistics(route, page, layoutContext);

  if (
    route.language === primaryLanguageID &&
    [
      'home',
      ...config.navigation.sections,
      'now',
    ].includes(route.id)
  ) {
    const original = await page.evaluate(
      (): {
        selector: string;
        text: string;
      }[] => {
        return [
          '.category-title a',
          '.category-description',
          '.category-preview-link .link-title',
          '.link-title',
          '.link-url-text',
        ].flatMap(
          (
            selector,
          ): {
            selector: string;
            text: string;
          }[] => {
            const element = document.querySelector<HTMLElement>(selector);

            if (!element) {
              return [];
            }

            const text = element.textContent;

            element.textContent = text.repeat(6);

            return [
              {
                selector,
                text,
              },
            ];
          },
        );
      },
    );

    for (const width of widths) {
      await page.setViewport({
        width,
        height: 900,
      });
      assert.equal(
        await page.evaluate((): boolean => {
          return document.documentElement.scrollWidth > innerWidth;
        }),
        false,
      );
      checks.push({
        path: route.url,
        width,
        longContent: true,
        passed: true,
      });
    }

    await page.evaluate((original): void => {
      for (const {
        selector,
        text
      } of original) {
        const requiredValue = window.lobbyAssertions.element(
          document,
          selector,
        );

        requiredValue.textContent = text;
      }
    }, original);
    await page.evaluate((): string => {
      return (document.documentElement.style.fontSize = '200%');
    });

    for (const width of widths) {
      await page.setViewport({
        width,
        height: 900,
      });

      const enlarged = await page.evaluate(
        (): {
          overflow: boolean;
          contentFits: boolean;
        } => {
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            contentFits: [
              ...document.querySelectorAll<HTMLElement>(
                '.category-summary,.category-preview-link,.link-button,.presentation-copy,.presentation-focus',
              ),
            ].every((element): boolean => {
              return element.scrollWidth <= element.clientWidth + 1;
            }),
          };
        },
      );

      assert.equal(
        enlarged.overflow,
        false,
        `${route.url} text enlarged at ${String(width)}`,
      );
      assert.equal(
        enlarged.contentFits,
        true,
        `${route.url} enlarged content fit at ${String(width)}`,
      );
      checks.push({
        path: route.url,
        width,
        enlargedText: true,
        passed: true,
      });
    }

    await page.evaluate((): string => {
      return document.documentElement.style.removeProperty('font-size');
    });
  }

  await verifyDialogs(page, route.url);
  console.log(
    JSON.stringify({
      path: route.url,
      layout: 'passed',
    }),
  );

  async function inspectRouteAppearance(theme: string): Promise<void> {
    await page.click('[data-settings-open]');
    await page.$eval(`#theme-${theme}`, activateElement);
    await page.click('#settings-dialog [data-dialog-close]');

    if (route.id === 'home' && route.language === primaryLanguageID) {
      const materialContrast = await page.evaluate(measureMaterialContrast);

      assert(
        materialContrast.panel >= 4.5 && materialContrast.wood >= 4.5,
        JSON.stringify(materialContrast),
      );
      checks.push({
        path: route.url,
        theme,
        materialContrast,
        passed: true,
      });
    }

    for (const width of widths) {
      await inspectLayoutViewport({
        page,
        width,
        route,
        theme,
        context: layoutContext,
      });
    }
  }
}
