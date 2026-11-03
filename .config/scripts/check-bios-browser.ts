import { textOr } from '../../website/src/lib/features/content/text-or.model.ts';
import { dialogIsOpen, waitForBoot } from './browser-dom.ts';
import { createAuditPage } from './browser-fixture.ts';
import type {
  BiosRoute,
  BootPresentation,
  BootStyle,
} from './check-bios-browser.types.ts';
import { readConfiguration } from './configuration.ts';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Browser, Page } from 'puppeteer-core';

const viewports = [
  {
    width: 320,
    height: 568,
  },
  {
    width: 390,
    height: 844,
  },
  {
    width: 768,
    height: 900,
  },
  {
    width: 1024,
    height: 768,
  },
  {
    width: 1440,
    height: 900,
  },
  {
    width: 844,
    height: 390,
  },
];

async function bootPresentation(
  page: Page,
  theme: string,
): Promise<BootPresentation> {
  await page.evaluate((appearance): void => {
    document.documentElement.dataset['theme'] = appearance;

    const dialog = document.querySelector<HTMLDialogElement>('#bios-dialog');

    if (!dialog) {
      throw new Error('Missing BIOS dialog');
    }

    if (!dialog.open) {
      dialog.showModal();
    }

    dialog.focus({
      preventScroll: true,
    });

    for (const line of dialog.querySelectorAll<HTMLElement>('[hidden]')) {
      line.hidden = false;
    }

    const dataBiosProgress = window.lobbyAssertions.element(
      dialog,
      '[data-bios-progress]',
    );

    dataBiosProgress.textContent = '██████████';
  }, theme);
  await page.evaluate((): Promise<FontFaceSet> => {
    return document.fonts.ready;
  });

  return page.evaluate((): BootPresentation => {
    const dialog = document.getElementById('bios-dialog');

    if (dialog === null) {
      throw new Error('Missing required dialog');
    }

    const box = dialog.getBoundingClientRect();

    const selectors = [
      '#bios-dialog',
      '.bios-screen',
      '.bios-header',
      '#bios-title',
      '.bios-status-badge',
      '.bios-post',
      '.bios-footer',
      '[data-bios-skip]',
      '.bios-build-stamp',
    ];

    const styles = selectors.map((selector): BootStyle => {
      const requiredValue = window.lobbyAssertions.element(document, selector);

      const style = getComputedStyle(requiredValue);

      return {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        color: style.color,
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        borderImageSource: style.borderImageSource,
        boxShadow: style.boxShadow,
        textShadow: style.textShadow,
        cursor: style.cursor,
      };
    });

    const biosStatus = document.getElementById('bios-status');

    if (biosStatus === null) {
      throw new Error('Missing required biosStatus');
    }

    return {
      styles,
      fullscreen:
        box.x === 0 &&
        box.y === 0 &&
        Math.abs(box.width - innerWidth) < 1 &&
        Math.abs(box.height - innerHeight) < 1,
      covered: [
        [
          1,
          1,
        ],
        [
          innerWidth - 2,
          1,
        ],
        [
          1,
          innerHeight - 2,
        ],
      ].every((entry): boolean => {
        const [
          x,
          y,
        ] = entry;

        if (x === undefined) {
          throw new Error('Missing required x');
        }

        if (y === undefined) {
          throw new Error('Missing required y');
        }

        return dialog.contains(document.elementFromPoint(x, y));
      }),
      backdrop: getComputedStyle(dialog, '::backdrop').backgroundColor,
      hiddenStatus: biosStatus.getBoundingClientRect().width < 2,
      horizontalOverflow: dialog.scrollWidth > dialog.clientWidth + 1,
    };
  });
}

function assertPresentation(actual: BootPresentation): void {
  assert(actual.fullscreen, 'boot covers the entire viewport');
  assert(actual.covered, 'the site cannot show through the boot screen');
  assert(actual.hiddenStatus);
  assert.equal(actual.horizontalOverflow, false);
  assert.equal(actual.backdrop, 'rgb(0, 0, 0)');

  const first = actual.styles[0];

  assert.ok(first);
  assert.equal(first.backgroundColor, 'rgb(0, 0, 0)');

  for (const style of actual.styles) {
    assert.match(style.fontFamily, /JetBrains Mono/);
    assert.equal(style.cursor, 'default');
    assert.equal(style.borderImageSource, 'none');
    assert.equal(style.backgroundImage, 'none');
    assert.equal(style.boxShadow, 'none');
    assert.equal(style.textShadow, 'none');
  }
}

async function assertBootClosed(page: Page): Promise<void> {
  const open = await page.$eval('#bios-dialog', dialogIsOpen);

  assert.equal(open, false);
}

async function rebootLifecycle(page: Page, url: string): Promise<void> {
  await page.goto(url, {
    waitUntil: 'networkidle2',
  });
  await Promise.all([
    page.waitForNavigation({
      waitUntil: 'domcontentloaded',
    }),
    page.click('[data-reboot]'),
  ]);
  await waitForBoot(page, true);
  assert.equal(page.url(), url);
  assertPresentation(await bootPresentation(page, 'light'));
  await page.keyboard.press('Tab');
  assert.equal(
    await page.$eval('[data-bios-skip]', (button): boolean => {
      return button === document.activeElement;
    }),
    true,
  );
  await page.keyboard.press('Escape');
  await assertBootClosed(page);
  await page.reload({
    waitUntil: 'networkidle2',
  });
  await assertBootClosed(page);
  await page.goto(`${String(url.split('#')[0])}&lobby-boot=1`, {
    waitUntil: 'domcontentloaded',
  });
  await waitForBoot(page, true);
  await page.click('[data-bios-skip]');
  await assertBootClosed(page);
  await page.goto(`${String(url.split('#')[0])}&lobby-boot=1`, {
    waitUntil: 'domcontentloaded',
  });
  await waitForBoot(page, true);
  await page.waitForFunction(
    (): boolean => {
      return (
        document.querySelector<HTMLDialogElement>('#bios-dialog')?.open ===
        false
      );
    },
    {
      timeout: 5000,
    },
  );
}

function biosRoutes(baseURL: string): {
  language: string;
  interfaceName: string;
  url: string;
}[] {
  return readConfiguration().language_options.flatMap(
    (
      language,
    ): {
      language: string;
      interfaceName: string;
      url: string;
    }[] => {
      return [
        '',
        'terminal/',
      ].map(
        (
          prefix,
        ): {
          language: string;
          interfaceName: string;
          url: string;
        } => {
          return {
            language: language.id,
            interfaceName: textOr(prefix.replace('/', ''), 'minecraft'),
            url: new URL(`${language.path.slice(1)}${prefix}career/`, baseURL)
              .href,
          };
        },
      );
    },
  );
}

async function inspectPresentations(input: {
  page: Page;
  route: BiosRoute;
  directory: string;
  fingerprints: Map<string, BootStyle[]>;
}): Promise<number> {
  const {
    page,
    route,
    directory,
    fingerprints
  } = input;

  await page.goto(route.url, {
    waitUntil: 'networkidle2',
  });

  for (const viewport of viewports) {
    await page.setViewport(viewport);

    for (const theme of [
      'light',
      'dark',
    ] as const) {
      const actual = await bootPresentation(page, theme);

      assertPresentation(actual);

      const key = `${route.language}-${String(viewport.width)}`;

      if (fingerprints.has(key)) {
        assert.deepEqual(
          actual.styles,
          fingerprints.get(key),
          'boot styles do not depend on the interface or appearance',
        );
      }

      fingerprints.set(key, actual.styles);

      if (
        route.language === 'pt-br' &&
        [
          390,
          1440,
        ].includes(viewport.width)
      ) {
        await page.screenshot({
          path: resolve(
            directory,
            `${route.interfaceName}-${theme}-${String(viewport.width)}.png`,
          ),
        });
      }
    }
  }

  return viewports.length * 2;
}

export default async function checkBiosBrowser(
  browser: Browser,
  baseURL: string,
  reportDirectory: string,
): Promise<void> {
  const context = await browser.createBrowserContext();

  const directory = resolve(reportDirectory, 'bios');

  const fingerprints = new Map<string, BootStyle[]>();

  let presentations = 0;

  await mkdir(directory, {
    recursive: true,
  });

  try {
    const page = await createAuditPage(context);

    for (const route of biosRoutes(baseURL)) {
      presentations += await inspectPresentations({
        page,
        route,
        directory,
        fingerprints,
      });
    }

    for (const prefix of [
      '',
      'terminal/',
    ] as const) {
      await page.setViewport({
        width: 390,
        height: 844,
      });

      const url = new URL(
        `pt-br/${prefix}career/?verify=bios#main-content`,
        baseURL,
      ).href;

      await rebootLifecycle(page, url);
      await page.emulateMediaFeatures([
        {
          name: 'prefers-reduced-motion',
          value: 'reduce',
        },
      ]);
      await page.goto(`${String(url.split('#')[0])}&lobby-boot=1`, {
        waitUntil: 'networkidle2',
      });
      await assertBootClosed(page);
      await page.emulateMediaFeatures([]);
    }

    await page.setJavaScriptEnabled(false);
    await page.goto(new URL('pt-br/?lobby-boot=1', baseURL).href, {
      waitUntil: 'networkidle2',
    });
    await assertBootClosed(page);
    await writeFile(
      resolve(directory, 'checks.json'),
      JSON.stringify(
        {
          presentations,
          lifecycle: true,
          noJavaScript: true,
        },
        null,
        2,
      ),
    );
    console.log(
      `BIOS: ${String(presentations)} fullscreen presentations, independent styles and Reboot lifecycle passed.`,
    );
  } finally {
    await context.close();
  }
}
