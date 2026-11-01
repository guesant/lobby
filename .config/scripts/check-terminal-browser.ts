import type { Page } from 'puppeteer-core';
import { animationFrames } from './browser-dom.ts';
import { dialogIsOpen, waitForBoot } from './browser-dom.ts';
import type { Browser } from 'puppeteer-core';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pa11y } from './audit-browser.ts';
import type { ConfiguredPage } from './configuration.ts';
import { pagesFor } from './configuration.ts';
import {
  editorialDestinations,
  createBrowserAudit,
} from './browser-presentation.ts';
import type { LinkDocument } from '../../website/src/lib/site-data.ts';

export default async function checkTerminalBrowser(
  browser: Browser,
  baseURL: string,
  reportDirectory: string,
): Promise<void> {
  const {
    config,
    context,
    page,
    checks,
    errors
  } =
    await createBrowserAudit(browser);

  const accessibility: Record<string, unknown>[] = [];

  const url = (path: string): string => {
    return new URL(path.replace(/^\//, ''), baseURL).href;
  };

  try {
    for (const language of config.language_options) {
      for (const route of pagesFor(config, language.id)
        .filter(
          (entry): boolean => {
            return !entry.fallback;
          },
        )) {
        await inspectTerminalRoute(
          route,
          language,
          page,
          url,
          config,
          checks,
          reportDirectory,
          browser,
          accessibility,
        );
      }
    }

    await page.goto(url('pt-br/career/?verify=terminal#main-content'), {
      waitUntil: 'networkidle2',
    });
    await page.click('[data-settings-open]');
    await page.click('label[for="theme-light"]');
    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle2',
      }),
      page.click('label[for="interface-terminal"]'),
    ]);
    await waitForBoot(page, true);
    assert.equal(new URL(page.url()).pathname, '/pt-br/terminal/career/');
    assert.equal(new URL(page.url()).search, '?verify=terminal');
    assert.equal(new URL(page.url()).hash, '#main-content');
    assert.equal(
      await page.$eval('html', (root): string | undefined => {
        return root.dataset.theme;
      }),
      'light',
    );
    await page.keyboard.press('Escape');
    assert.equal(await page.$eval('#bios-dialog', dialogIsOpen), false);
    await page.reload({
      waitUntil: 'networkidle2',
    });
    assert.equal(await page.$eval('#bios-dialog', dialogIsOpen), false);
    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'domcontentloaded',
      }),
      page.click('[data-reboot]'),
    ]);
    await waitForBoot(page, true);
    assert.equal(await page.$eval('#bios-dialog', dialogIsOpen), true);
    assert.equal(new URL(page.url()).search, '?verify=terminal');
    assert.equal(new URL(page.url()).hash, '#main-content');
    await page.keyboard.press('Escape');
    await page.emulateMediaFeatures([
      {
        name: 'prefers-reduced-motion',
        value: 'reduce',
      },
    ]);
    await page.goto(url('pt-br/terminal/?lobby-boot=1'), {
      waitUntil: 'networkidle2',
    });
    await waitForBoot(page, false);
    assert.equal(await page.$eval('#bios-dialog', dialogIsOpen), false);
    await page.keyboard.press('Tab');
    assert.equal(
      await page.$eval('.skip-link', (link): boolean => {
        return (
          link === document.activeElement &&
          link.getBoundingClientRect().top >= 0
        );
      }),
      true,
    );
    assert.deepEqual(errors, []);
    fs.writeFileSync(
      `${reportDirectory}/terminal-checks.json`,
      JSON.stringify(
        {
          checks,
          errors,
        },
        null,
        2,
      ),
    );
    console.log(
      `Terminal: ${checks.length} responsive checks and interface/BIOS lifecycle passed`,
    );
  } finally {
    await context.close();
  }
}

async function inspectTerminalStyles(page: Page, path: string): Promise<void> {
  const styles = await page.$$eval(
    'link[rel="stylesheet"]',
    (links): string[] => {
      return links.map((link): string => {
        return link.href;
      });
    },
  );

  assert(styles.length > 0, `${path} must load its Vite stylesheets`);

  for (const href of styles) {
    assert.match(
      new URL(href).pathname,
      /^\/_app\/immutable\/assets\/.+\.[\w-]+\.css$/,
    );
  }

  assert.equal(
    await page.evaluate((): boolean => {
      return [
        ...document.styleSheets,
      ].some((sheet): boolean => {
        return [
          ...sheet.cssRules,
        ].some((rule): boolean => {
          return rule.cssText.startsWith(
            '@scope (:root[data-interface="terminal"])',
          );
        });
      });
    }),
    true,
    `${path} must load the independent Terminal scope`,
  );
}

async function inspectTerminalRoute(
  route: ConfiguredPage,
  language: {
    id: string;
    path: string;
    label: string;
    hreflang: string;
  },
  page: Page,
  url: (path: string) => string,
  config: LinkDocument,
  checks: Record<string, unknown>[],
  reportDirectory: string,
  browser: Browser,
  accessibility: Record<string, unknown>[],
): Promise<void> {
  const resolvePath = (): string => {
    if (route.id === 'home') {
      return '';
    }

    return `${route.id}/`;
  };

  const path = `${language.path}terminal/${resolvePath()}`;

  assert.equal(
    (await page.goto(url(path), {
      waitUntil: 'networkidle2',
    }))!.status(),
    200,
    path,
  );
  await page.evaluate((): Promise<FontFaceSet> => {
    return document.fonts.ready;
  });
  assert.equal(
    await page.$eval('html', (root): string | undefined => {
      return root.dataset.interface;
    }),
    'terminal',
  );
  assert.equal(
    await page.$('.site-frame,.suspension-rails,.quick-access,.world-scene'),
    null,
  );
  assert.equal(
    await page.$$eval('h1', (elements): number => {
      return elements.length;
    }),
    1,
  );
  assert.deepEqual(
    await page.$$eval('.language-select option', (options): string[] => {
      return options.map((option): string => {
        return new URL(option.value, location.href).pathname;
      });
    }),
    config.language_options.map((option): string => {
      const resolveValue = (): string => {
        if (
          route.id === 'home' ||
          (route.id === 'now' && !config.now[option.id])
        ) {
          return '';
        }

        return `${route.id}/`;
      };

      return `${option.path}terminal/${resolveValue()}`;
    }),
  );
  assert.equal(await page.$eval('#bios-dialog', dialogIsOpen), false);

  await inspectTerminalStyles(page, path);

  const initial = await page.$$eval(
    '[data-link-id],[data-editorial-id]',
    (items): (string | undefined)[] => {
      return items.map((item): string | undefined => {
        if (!(item instanceof HTMLElement)) {
          throw new Error('Expected HTMLElement: item');
        }

        return item.dataset.linkId || item.dataset.editorialId;
      });
    },
  );

  assert.equal(
    await page.$$eval(
      '.editorial-entry:has(.editorial-details)',
      editorialDestinations,
    ),
    true,
    `${path} curriculum and platform destinations`,
  );

  for (const mode of [
    'compact',
    'detailed',
  ] as const) {
    await inspectTerminalMode(route, page, mode, path, initial, checks);
  }

  if (route.id === 'home' && language.id === 'pt-br') {
    for (const mode of [
      'compact',
      'detailed',
    ] as const) {
      await page.click(`label[for="link-view-${mode}"]`);

      for (const theme of [
        'light',
        'dark',
      ] as const) {
        await page.evaluate((value): void => {
          document.documentElement.dataset.theme = value;
        }, theme);

        for (const width of [
          390,
          1440,
        ] as const) {
          await captureTerminalViewport(
            page,
            width,
            reportDirectory,
            mode,
            theme,
          );
        }
      }
    }
  }

  if (
    [
      'home',
      'career',
      'code',
      'now',
    ].includes(route.id)
  ) {
    for (const theme of [
      'light',
      'dark',
    ] as const) {
      await page.evaluate((value): void => {
        document.documentElement.dataset.theme = value;
      }, theme);

      const result = await pa11y(url(path), {
        browser,
        page,
        ignoreUrl: true,
        runners: [
          'axe',
          'htmlcs',
        ],
        standard: 'WCAG2AA',
        levelCapWhenNeedsReview: 'warning',
        viewport: {
          width: 1440,
          height: await page.evaluate((): number => {
            return Math.max(900, document.documentElement.scrollHeight);
          }),
        },
      });

      const issues = result.issues.filter((issue): boolean => {
        return issue.type === 'error';
      });

      accessibility.push({
        path,
        theme,
        issues,
      });
      fs.writeFileSync(
        `${reportDirectory}/terminal-accessibility.json`,
        JSON.stringify(accessibility, null, 2),
      );
      assert.deepEqual(issues, [], `${path} ${theme} accessibility`);
    }
  }
}

async function captureTerminalViewport(
  page: Page,
  width: number,
  reportDirectory: string,
  mode: string,
  theme: string,
): Promise<void> {
  await page.setViewport({
    width,
    height: 900,
  });
  await page.evaluate((): void => {
    return scrollTo(0, 0);
  });
  await page.screenshot({
    path: `${reportDirectory}/terminal-${mode}-${theme}-${width}.png`,
  });
}

async function inspectTerminalMode(
  route: ConfiguredPage,
  page: Page,
  mode: string,
  path: string,
  initial: (string | undefined)[],
  checks: Record<string, unknown>[],
): Promise<void> {
  if (route.type !== 'now') {
    await page.click(`label[for="link-view-${mode}"]`);
  }

  for (const theme of [
    'light',
    'dark',
  ] as const) {
    await page.evaluate((value): void => {
      document.documentElement.dataset.theme = value;
    }, theme);

    for (const width of [
      320,
      390,
      768,
      1024,
      1440,
    ] as const) {
      await inspectTerminalViewport(
        page,
        width,
        path,
        theme,
        mode,
        initial,
        checks,
      );
    }
  }
}

async function inspectTerminalViewport(
  page: Page,
  width: number,
  path: string,
  theme: string,
  mode: string,
  initial: (string | undefined)[],
  checks: Record<string, unknown>[],
): Promise<void> {
  await page.setViewport({
    width,
    height: 900,
  });
  await page.evaluate(animationFrames, 2);

  const actual = await page.evaluate(
    (): {
      overflow: boolean;
      font: string;
      skipHidden: boolean;
      nestedLinks: boolean;
      thirdPartyBadges: boolean;
      ids: (string | undefined)[];
    } => {
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        font: getComputedStyle(document.body).fontFamily,
        skipHidden:
          document
            .querySelector<HTMLElement>('.skip-link')!
            .getBoundingClientRect().bottom <= 0,
        nestedLinks: Boolean(document.querySelector<HTMLAnchorElement>('a a')!),
        thirdPartyBadges: [
          ...document.querySelectorAll<HTMLElement>(
            '.terminal-third-party-badge,.link-third-party-badge',
          ),
        ].every((badge): boolean => {
          return (
            parseFloat(getComputedStyle(badge).fontSize) >= 12 &&
            getComputedStyle(badge).whiteSpace === 'nowrap'
          );
        }),
        ids: [
          ...document.querySelectorAll<HTMLElement>(
            '[data-link-id],[data-editorial-id]',
          ),
        ].map((item): string | undefined => {
          return item.dataset.linkId || item.dataset.editorialId;
        }),
      };
    },
  );

  assert.equal(
    actual.overflow,
    false,
    `${path} ${width}/${theme}/${mode} overflow`,
  );
  assert.match(actual.font, /JetBrains Mono/);
  assert(actual.skipHidden, `${path} skip link remains visible without focus`);
  assert.equal(actual.nestedLinks, false);
  assert.equal(actual.thirdPartyBadges, true);
  assert.deepEqual(actual.ids, initial);
  checks.push({
    path,
    width,
    theme,
    mode,
  });
}
