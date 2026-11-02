import { textOr } from '../../website/src/lib/features/content/text.model.ts';
import { dialogIsOpen } from './browser-dom.ts';
import { createAuditPage } from './browser-fixture.ts';
import { waitForLandscape } from './check-progressive-scene.ts';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resolve } from 'node:path';
import type {
  Browser,
  BrowserContext,
  HTTPRequest,
  Page,
} from 'puppeteer-core';

async function initialize(
  page: Page,
  theme: string,
  languages = [
    'pt-BR',
  ],
): Promise<void> {
  await page.setCacheEnabled(false);
  await page.evaluateOnNewDocument((languages): void => {
    Object.defineProperty(navigator, 'languages', {
      get: (): string[] => {
        return languages;
      },
    });
  }, languages);
  await page.emulateMediaFeatures([
    {
      name: 'prefers-color-scheme',
      value: theme,
    },
  ]);
}

async function snapshot(page: Page): Promise<{
  headings: string[];
  width: number;
  height: number;
  history: number;
}> {
  return page.evaluate(
    (): {
      headings: string[];
      width: number;
      height: number;
      history: number;
    } => {
      const siteFrame = window.lobbyAssertions.element(document, '.site-frame');

      const {
        width,
        height
      } = siteFrame.getBoundingClientRect();

      const headings = Array.from(
        document.querySelectorAll<HTMLElement>('main h2,main h3'),
        (node): string => {
          return node.textContent;
        },
      );

      return {
        headings,
        width,
        height,
        history: history.length,
      };
    },
  );
}

async function preparePage(
  context: BrowserContext,
  theme: string,
  width: number,
): Promise<Page> {
  const page = await createAuditPage(context);

  await initialize(page, theme);
  await page.setViewport({
    width,
    height: 900,
  });

  return page;
}

async function inspectRoot(input: {
  browser: Browser;
  baseURL: string;
  width: number;
  theme: string;
  directory: string;
}): Promise<void> {
  const {
    browser,
    baseURL,
    width,
    theme,
    directory
  } = input;

  const context = await browser.createBrowserContext();

  try {
    const page = await preparePage(context, theme, width);

    let holding = true;

    let documents = 0;

    const requests: HTTPRequest[] = [];

    await page.setRequestInterception(true);
    page.on('request', (request): void => {
      if (
        request.isNavigationRequest() &&
        request.frame() === page.mainFrame()
      ) {
        documents++;
      }

      if (
        holding &&
        request.url()
          .includes('/_app/immutable/') &&
        request.resourceType() === 'script'
      ) {
        requests.push(request);
      } else {
        void request.continue();
      }
    });
    await page.goto(new URL('/', baseURL).href, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('.category-grid article');
    await page.evaluate((): Promise<FontFaceSet> => {
      return document.fonts.ready;
    });

    const preview = await page.$eval(
      '.world-landscape-preview',
      (
        element,
      ): {
        image: string;
        opacity: string;
      } => {
        const style = getComputedStyle(element);

        return {
          image: style.backgroundImage,
          opacity: style.opacity,
        };
      },
    );

    assert.match(preview.image, /\/assets\/generated\/.+-preview\.webp/);
    assert.equal(preview.opacity, '1');
    await page.evaluate((): void => {
      window.__languageFrame =
        document.querySelector<HTMLElement>('.site-frame');
      window.__languageSettings =
        document.querySelector<HTMLDialogElement>('#settings-dialog');
      window.__sceneRestarts = 0;
      new MutationObserver((records): void => {
        window.__sceneRestarts += records.filter((record): boolean => {
          return record.attributeName === 'data-landscape-ready';
        }).length;
      })
        .observe(document.documentElement, {
          attributes: true,
        });
    });

    const initial = await snapshot(page);

    assert.equal(new URL(page.url()).pathname, '/');
    assert(initial.headings.length > 9);
    assert.equal(
      await page.$eval('meta[name="robots"]', (node): string => {
        return node.content;
      }),
      'noindex, follow',
    );
    assert.equal(
      await page.$eval('link[rel="canonical"]', (node): string => {
        return new URL(node.href).pathname;
      }),
      '/pt-br/',
    );
    await page.screenshot({
      path: resolve(directory, `root-${String(width)}-${theme}.png`),
    });
    holding = false;
    await Promise.all(
      requests.map((request): Promise<void> => {
        return request.continue();
      }),
    );
    await page.waitForFunction((): boolean => {
      return (
        location.pathname === '/pt-br/' &&
        document.querySelector<HTMLMetaElement>('meta[name="robots"]')
          ?.content === 'index, follow'
      );
    });
    await waitForLandscape(page);

    const final = await page.evaluate(
      (): {
        frame: boolean;
        settings: boolean;
        restarts: number;
      } => {
        return {
          frame:
            window.__languageFrame ===
            document.querySelector<HTMLElement>('.site-frame'),
          settings:
            window.__languageSettings ===
            document.querySelector<HTMLDialogElement>('#settings-dialog'),
          restarts: window.__sceneRestarts,
        };
      },
    );

    assert.deepEqual(await snapshot(page), initial);
    assert.equal(final.frame, true);
    assert.equal(final.settings, true);
    assert.equal(final.restarts, 1);
    assert.equal(documents, 1);
    await page.screenshot({
      path: resolve(directory, `localized-${String(width)}-${theme}.png`),
    });
  } finally {
    await context.close();
  }
}

async function inspectMenu(input: {
  browser: Browser;
  baseURL: string;
  terminal: boolean;
  width: number;
  theme: string;
}): Promise<void> {
  const {
    browser,
    baseURL,
    terminal,
    width,
    theme
  } = input;

  const context = await browser.createBrowserContext();

  try {
    const page = await preparePage(context, theme, width);

    function resolveSegment(): '' | 'terminal/' {
      if (terminal) {
        return 'terminal/';
      }

      return '';
    }

    const segment = resolveSegment();

    let documents = 0;

    page.on('request', (request): void => {
      if (
        request.isNavigationRequest() &&
        request.frame() === page.mainFrame()
      ) {
        documents++;
      }
    });
    await page.goto(
      new URL(`/pt-br/${segment}career/?source=language#main-content`, baseURL)
        .href,
      {
        waitUntil: 'networkidle0',
      },
    );
    await page.evaluate((): void => {
      window.__languageSettings =
        document.querySelector<HTMLDialogElement>('#settings-dialog');
      window.__languageDocument = document;
      window.__languageHistory = history.length;
    });
    await page.click('[data-settings-open]');

    for (const locale of [
      'en',
      'fr',
      'es',
      'it',
      'zh',
      'pt-br',
    ] as const) {
      const path = `/${locale}/${segment}career/`;

      await page.focus('[data-language-switcher]');
      await page.select('[data-language-switcher]', path);
      await page.waitForFunction(
        (path: string): boolean => {
          return (
            location.pathname === path && document.documentElement.lang !== ''
          );
        },
        {},
        path,
      );
      await page.waitForFunction(
        (locale): boolean => {
          const dataLanguageSwitcher =
            document.querySelector<HTMLSelectElement>(
              '[data-language-switcher]',
            );

          if (dataLanguageSwitcher === null) {
            throw new Error('Missing required dataLanguageSwitcher');
          }

          return (
            dataLanguageSwitcher.selectedOptions.item(0)?.dataset[
              'language'
            ] === locale
          );
        },
        {},
        locale,
      );

      const state = await page.evaluate(
        (): {
          settings: boolean;
          document: boolean;
          open: boolean;
          focus: boolean;
          history: boolean;
          query: string;
          hash: string;
          interface: string | undefined;
          bios: boolean;
        } => {
          const settingsDialog =
            document.querySelector<HTMLDialogElement>('#settings-dialog');

          if (settingsDialog === null) {
            throw new Error('Missing required settingsDialog');
          }

          return {
            settings:
              window.__languageSettings ===
              document.querySelector<HTMLDialogElement>('#settings-dialog'),
            document: window.__languageDocument === document,
            open: settingsDialog.open,
            focus: Boolean(
              document.activeElement?.matches('[data-language-switcher]'),
            ),
            history: history.length === window.__languageHistory,
            query: location.search,
            hash: location.hash,
            interface: document.documentElement.dataset['interface'],
            bios:
              document.querySelector<HTMLDialogElement>('#bios-dialog')?.open ??
              false,
          };
        },
      );

      function resolveInterface(): 'minecraft' | 'terminal' {
        if (terminal) {
          return 'terminal';
        }

        return 'minecraft';
      }

      assert.deepEqual(state, {
        settings: true,
        document: true,
        open: true,
        focus: true,
        history: true,
        query: '?source=language',
        hash: '#main-content',
        interface: resolveInterface(),
        bios: false,
      });
      assert.equal(documents, 1);
    }
  } finally {
    await context.close();
  }
}

async function inspectFallbacks(
  browser: Browser,
  baseURL: string,
): Promise<void> {
  const context = await browser.createBrowserContext();

  try {
    const page = await createAuditPage(context);

    await initialize(page, 'dark', [
      'en',
    ]);
    await page.goto(
      new URL('/en/now/?source=fallback#now-context', baseURL).href,
      {
        waitUntil: 'networkidle0',
      },
    );
    await page.click('[data-settings-open]');
    await page.focus('[data-language-switcher]');
    await page.select('[data-language-switcher]', '/fr/');
    await page.waitForFunction((): boolean => {
      return location.pathname === '/fr/';
    });
    assert.equal(new URL(page.url()).hash, '');
    assert.equal(new URL(page.url()).search, '?source=fallback');
    assert.equal(await page.$eval('#settings-dialog', dialogIsOpen), true);
    await page.setJavaScriptEnabled(false);
    await page.goto(new URL('/', baseURL).href, {
      waitUntil: 'networkidle0',
    });
    await page.waitForFunction((): boolean => {
      return location.pathname === '/pt-br/';
    });
    assert(await page.$('main .category-grid'));
  } finally {
    await context.close();
  }
}

export default async function checkLanguageSPA(
  browser: Browser,
  baseURL: string,
): Promise<void> {
  const directory = resolve(
    textOr(process.env['QA_REPORT_DIR'], '.local/reports'),
    'language-spa',
  );

  fs.mkdirSync(directory, {
    recursive: true,
  });

  for (const theme of [
    'dark',
    'light',
  ] as const) {
    for (const width of [
      320,
      390,
      768,
      1024,
      1440,
    ] as const) {
      await inspectRoot({
        browser,
        baseURL,
        width,
        theme,
        directory,
      });
    }

    for (const terminal of [
      false,
      true,
    ]) {
      for (const width of [
        390,
        1440,
      ] as const) {
        await inspectMenu({
          browser,
          baseURL,
          terminal,
          width,
          theme,
        });
      }
    }
  }

  await inspectFallbacks(browser, baseURL);
  console.log(
    JSON.stringify({
      rootPresentations: 10,
      manualLanguageTransitions: 48,
      languageSPAFailures: [],
    }),
  );
}
