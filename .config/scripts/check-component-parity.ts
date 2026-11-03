import type { LinkDocument } from '../../website/src/lib/features/content/content.types.ts';
import { textOr } from '../../website/src/lib/features/content/text-or.model.ts';
import { createAuditPage } from './browser-fixture.ts';
import { applyLinkPresentation, withBrowser } from './browser-presentation.ts';
import type {
  BadgeExpectation,
  ParityRoute,
} from './check-component-parity.types.ts';
import { readConfiguration } from './configuration.ts';
import { inspectControlReadiness } from './fixtures/control-readiness.ts';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Browser, Page } from 'puppeteer-core';

const widths = [
  320,
  390,
  768,
  1024,
  1440,
];

async function inspectComponents(
  page: Page,
  expected: BadgeExpectation,
  minecraft: boolean,
): Promise<void> {
  const actual = await page.evaluate(
    (
      input,
    ):
      | {
        badgesCorrect: boolean;
        ownershipCorrect: boolean;
        independent: boolean;
        avatar?: never;
        frames?: never;
        icons?: never;
        activeCheck?: never;
        profileShadow?: never;
        sharedOrnaments?: never;
        shortcutsInHeader?: never;
        navigationSeparated?: never;
        navigationAligned?: never;
        navigationText?: never;
      }
      | {
        badgesCorrect: boolean;
        ownershipCorrect: boolean;
        avatar: string;
        frames: {
          source: string;
          width: number;
          repeat: string;
          background: string;
          innerBorder: string;
          innerBackground: string;
        }[];
        icons: {
          width: number;
          height: number;
          wrapped: boolean;
        }[];
        activeCheck: boolean;
        profileShadow: string;
        sharedOrnaments: boolean;
        shortcutsInHeader: boolean;
        navigationSeparated: boolean;
        navigationAligned: boolean;
        navigationText: boolean;
        independent?: never;
      } => {
      const {
        expected,
        minecraft
      } = input;

      const badges = [
        ...document.querySelectorAll<HTMLElement>(
          '.link-third-party-badge, .terminal-third-party-badge',
        ),
      ];

      const links = [
        ...document.querySelectorAll<HTMLElement>('.link-button'),
      ];

      function own(url: URL): boolean {
        return expected.domains.some((domain): boolean => {
          return url.hostname === domain || url.hostname.endsWith(`.${domain}`);
        });
      }

      const badgesCorrect =
        badges.length > 0 &&
        badges.every((badge): boolean => {
          return badge.textContent.trim() === expected.label;
        });

      const ownershipCorrect = links.every((link): boolean => {
        if (!(link instanceof HTMLAnchorElement)) {
          throw new Error('Expected HTMLAnchorElement: link');
        }

        const url = new URL(link.href);

        const thirdParty =
          /^https?:/i.test(link.getAttribute('href') ?? '') && !own(url);

        return (
          Boolean(
            link.querySelector<HTMLElement>('.link-third-party-badge'),
          ) === thirdParty
        );
      });

      if (!minecraft) {
        return {
          badgesCorrect,
          ownershipCorrect,
          independent: !document.querySelector<HTMLElement>(
            '.site-frame,.quick-contact-link,.profile-avatar',
          ),
        };
      }

      const profileAvatar = window.lobbyAssertions.element(
        document,
        '.profile-avatar',
      );

      const avatar = profileAvatar.textContent.trim();

      const frames = [
        ...document.querySelectorAll<HTMLElement>('.quick-contact-link'),
      ].map(
        (
          link,
        ): {
          source: string;
          width: number;
          repeat: string;
          background: string;
          innerBorder: string;
          innerBackground: string;
        } => {
          const style = getComputedStyle(link);

          const quickContactIcon = window.lobbyAssertions.element(
            link,
            '.quick-contact-icon',
          );

          const iconStyle = getComputedStyle(quickContactIcon);

          return {
            source: style.borderImageSource,
            width: parseFloat(style.borderTopWidth),
            repeat: style.borderImageRepeat,
            background: style.backgroundColor,
            innerBorder: iconStyle.borderTopWidth,
            innerBackground: iconStyle.backgroundColor,
          };
        },
      );

      const icons = [
        ...document.querySelectorAll<HTMLElement>(
          '.quick-contact-icon .site-icon, .statistic dt .site-icon',
        ),
      ]
        .filter((icon): number => {
          return icon.getClientRects().length;
        })
        .map(
          (
            icon,
          ): {
            width: number;
            height: number;
            wrapped: boolean;
          } => {
            const box = icon.getBoundingClientRect();

            const parentElementValue = icon.parentElement;

            if (parentElementValue === null) {
              throw new Error('Missing required parentElementValue');
            }

            return {
              width: box.width,
              height: box.height,
              wrapped: parentElementValue.matches(
                '.button-icon, .quick-contact-icon',
              ),
            };
          },
        );

      const activeCheck = Boolean(
        document.querySelector<HTMLAnchorElement>(
          '.header-navigation-links a[aria-current="page"]',
        ),
      );

      const shortcuts = window.lobbyAssertions.element(
        document,
        '.quick-contacts',
      );

      const shortcutsBox = shortcuts.getBoundingClientRect();

      const profile = window.lobbyAssertions.element(document, '.profile');

      const profileBox = profile.getBoundingClientRect();

      const profileUptime = window.lobbyAssertions.element(
        document,
        '.profile-uptime',
      );

      const uptimeBox = profileUptime.getBoundingClientRect();

      const navigation = window.lobbyAssertions.element(
        document,
        '.profile-navigation',
      );

      const ornaments = [
        ...document.querySelectorAll<HTMLElement>('.profile .ornament-label'),
      ];

      const profileValue = window.lobbyAssertions.element(document, '.profile');

      function headerNavigationIsSeparated(): boolean {
        return (
          !navigation.querySelector<HTMLElement>('.quick-contacts') &&
          navigation.closest('.profile') !== null &&
          navigation.getBoundingClientRect().top >= uptimeBox.bottom &&
          !document.querySelector<HTMLElement>('.quick-access') &&
          !navigation.querySelector<HTMLElement>('details, button, summary') &&
          navigation.querySelectorAll<HTMLAnchorElement>('.navigation-links a')
            .length ===
            document.querySelectorAll<HTMLAnchorElement>(
              '.footer-navigation-links a',
            ).length
        );
      }

      function shortcutsStayInsideHeader(): boolean {
        return (
          shortcuts.closest('.profile') !== null &&
          shortcuts.children.length === 8 &&
          shortcutsBox.top >= navigation.getBoundingClientRect().bottom &&
          shortcutsBox.bottom <= profileBox.bottom &&
          shortcutsBox.left >= profileBox.left &&
          shortcutsBox.right <= profileBox.right
        );
      }

      function headerOrnamentsMatch(): boolean {
        return (
          ornaments.length === 3 &&
          ornaments.every((label): boolean => {
            const before = getComputedStyle(label, '::before');

            const after = getComputedStyle(label, '::after');

            return (
              before.width === after.width &&
              before.flexGrow === '0' &&
              before.content === '""'
            );
          }) &&
          document
            .querySelector<HTMLElement>('#footer-navigation-title')
            ?.classList.contains('ornament-label-footer') === true
        );
      }

      return {
        badgesCorrect,
        ownershipCorrect,
        avatar,
        frames,
        icons,
        activeCheck,
        profileShadow: getComputedStyle(profileValue).boxShadow,
        sharedOrnaments: headerOrnamentsMatch(),
        shortcutsInHeader: shortcutsStayInsideHeader(),
        navigationSeparated: headerNavigationIsSeparated(),
        navigationAligned: [
          ...navigation.querySelectorAll<HTMLAnchorElement>('a'),
        ].every((link): boolean => {
          return link.getBoundingClientRect().height >= 44;
        }),
        navigationText: [
          ...navigation.querySelectorAll<HTMLAnchorElement>('a'),
        ].every((control): boolean => {
          const style = getComputedStyle(control);

          return (
            style.borderImageSource === 'none' &&
            style.borderWidth === '0px' &&
            style.backgroundColor === 'rgba(0, 0, 0, 0)' &&
            style.boxShadow === 'none'
          );
        }),
      };
    },
    {
      expected,
      minecraft,
    },
  );

  assert.equal(actual.badgesCorrect, true, 'translated text in every badge');
  assert.equal(actual.ownershipCorrect, true, 'badges match domain ownership');

  if (!minecraft) {
    assert.equal(
      actual.independent,
      true,
      'Terminal has no Minecraft structure',
    );

    return;
  }

  assert.equal(actual.avatar, 'GA');
  assert.equal(actual.sharedOrnaments, true, 'shared header/footer ornaments');
  assert.equal(
    actual.shortcutsInHeader,
    true,
    'eight shortcuts below uptime inside header',
  );
  assert.equal(
    actual.navigationSeparated,
    true,
    'header uses the same full link list as footer, without dropdown',
  );
  assert.equal(
    actual.navigationAligned,
    true,
    'text navigation links preserve accessible target heights',
  );
  assert.equal(actual.navigationText, true, 'navigation has no button frame');
  assert(actual.frames.length > 0);

  for (const frame of actual.frames) {
    assert.match(frame.source, /oak-frame/);
    assert(frame.width > 0);
    assert.equal(frame.repeat, 'repeat');
    assert.equal(frame.background, 'rgba(0, 0, 0, 0)');
    assert.equal(frame.innerBorder, '0px');
    assert.equal(frame.innerBackground, 'rgba(0, 0, 0, 0)');
  }

  assert(actual.icons.length > 0);

  for (const icon of actual.icons) {
    assert.equal(icon.wrapped, true);
    assert(icon.width > 0);
    assert(Math.abs(icon.width - icon.height) < 0.5, JSON.stringify(icon));
  }

  assert.equal(actual.activeCheck, true);
  assert.equal(
    actual.profileShadow,
    'none',
    'header has no rectangular shadow',
  );
}

async function setPresentation(
  page: Page,
  theme: string,
  view: string,
): Promise<void> {
  await applyLinkPresentation(page, theme, view);
  await page.evaluate((): Promise<unknown> => {
    return new Promise((accept): void => {
      requestAnimationFrame((): void => {
        requestAnimationFrame(accept);
      });
    });
  });
}

async function captureComponents(
  page: Page,
  directory: string,
  name: string,
): Promise<void> {
  await page.evaluate((): void => {
    scrollTo(0, 0);
  });
  await page.screenshot({
    path: resolve(directory, `${name}-header.png`),
  });

  await page.$eval(
    '.content-link-group, .terminal-link-list',
    (element): void => {
      element.scrollIntoView({
        block: 'start',
      });
    },
  );
  await page.screenshot({
    path: resolve(directory, `${name}-links.png`),
  });
  await page.evaluate((): void => {
    scrollTo(0, 0);
  });
}

async function inspectRoute(input: {
  page: Page;
  baseURL: string;
  route: ParityRoute;
  expected: BadgeExpectation;
  directory: string;
  screenshots: boolean;
}): Promise<string[]> {
  const {
    page,
    baseURL,
    route,
    expected,
    directory,
    screenshots
  } = input;

  const response = await page.goto(new URL(route.path, baseURL).href, {
    waitUntil: 'networkidle0',
  });

  if (response === null) {
    throw new Error('Missing required response');
  }

  assert.equal(response.status(), 200, route.path);
  await page.evaluate((): Promise<FontFaceSet> => {
    return document.fonts.ready;
  });

  const checks: string[] = [];

  for (const width of widths) {
    await page.setViewport({
      width,
      height: 900,
    });

    for (const theme of [
      'dark',
      'light',
    ] as const) {
      for (const view of [
        'compact',
        'detailed',
      ] as const) {
        await inspectViewCase(theme, view, width);
      }
    }
  }

  return checks;

  async function inspectViewCase(
    theme: string,
    view: string,
    width: number,
  ): Promise<void> {
    await setPresentation(page, theme, view);
    await inspectComponents(page, expected, route.minecraft);

    function resolveName(): 'minecraft' | 'terminal' {
      if (route.minecraft) {
        return 'minecraft';
      }

      return 'terminal';
    }

    const name = `${route.language}-${resolveName()}-${route.id}-${String(width)}-${theme}-${view}`;

    if (screenshots && route.language === 'pt-br') {
      await captureComponents(page, directory, name);
    }

    checks.push(name);
  }
}

async function inspectNavigation(input: {
  page: Page;
  baseURL: string;
  minecraft: boolean;
  expected: BadgeExpectation;
}): Promise<void> {
  const {
    page,
    baseURL,
    minecraft,
    expected
  } = input;

  function resolvePrefix(): '' | 'terminal/' {
    if (minecraft) {
      return '';
    }

    return 'terminal/';
  }

  const prefix = `pt-br/${resolvePrefix()}`;

  await page.goto(new URL(prefix, baseURL).href, {
    waitUntil: 'networkidle0',
  });
  await page.evaluate((): void => {
    window.componentParityNavigation = true;
  });

  function resolveSelector():
    | '.header-navigation-links a[data-navigation-page="career"]'
    | '.terminal-navigation a[href$="/career/"]' {
    if (minecraft) {
      return '.header-navigation-links a[data-navigation-page="career"]';
    }

    return '.terminal-navigation a[href$="/career/"]';
  }

  const selector = resolveSelector();

  await page.click(selector);
  await page.waitForFunction((): boolean => {
    return document.documentElement.dataset['page'] === 'career';
  });
  assert.equal(
    await page.evaluate((): boolean => {
      return window.componentParityNavigation;
    }),
    true,
    'internal navigation stays client-side',
  );
  await inspectComponents(page, expected, minecraft);
}

function componentRoutes(config: LinkDocument): ParityRoute[] {
  return config.language_options.flatMap(
    (
      language,
    ): {
      path: string;
      language: string;
      minecraft: boolean;
      id: string;
      expected: {
        label: string;
        domains: string[];
      };
    }[] => {
      function interfaceRoutes(minecraft: boolean): {
        path: string;
        language: string;
        minecraft: boolean;
        id: string;
        expected: {
          label: string;
          domains: string[];
        };
      }[] {
        return [
          'home',
          'career',
          'code',
        ].map(
          (
            id,
          ): {
            path: string;
            language: string;
            minecraft: boolean;
            id: string;
            expected: {
              label: string;
              domains: string[];
            };
          } => {
            function resolvePath(): '' | 'terminal/' {
              if (minecraft) {
                return '';
              }

              return 'terminal/';
            }

            function resolvePath1(): string {
              if (id === 'home') {
                return '';
              }

              return `${id}/`;
            }

            return {
              path: `${language.path.slice(
                1,
              )}${resolvePath()}${resolvePath1()}`,
              language: language.id,
              minecraft,
              id,
              expected: {
                label: config.locales[language.id]?.ui.third_party ?? '',
                domains: config.site.first_party_domains,
              },
            };
          },
        );
      }

      return [
        true,
        false,
      ].flatMap(interfaceRoutes);
    },
  );
}

async function checkComponentParity(input: {
  browser: Browser;
  baseURL: string;
  reportDirectory: string;
  screenshots?: boolean;
}): Promise<void> {
  const {
    browser,
    baseURL,
    reportDirectory,
    screenshots = false
  } = input;

  const config = readConfiguration();

  const directory = resolve(reportDirectory, 'component-parity');

  await fs.mkdir(directory, {
    recursive: true,
  });

  const context = await browser.createBrowserContext();

  const checks = [];

  try {
    for (const minecraft of [
      true,
      false,
    ]) {
      await inspectControlReadiness(context, baseURL, minecraft);
    }

    const page = await createAuditPage(context);

    await page.setCacheEnabled(false);
    await page.emulateMediaFeatures([
      {
        name: 'prefers-reduced-motion',
        value: 'reduce',
      },
    ]);

    for (const route of componentRoutes(config)) {
      checks.push(
        ...(await inspectRoute({
          page,
          baseURL,
          route,
          expected: route.expected,
          directory,
          screenshots,
        })),
      );
    }

    for (const minecraft of [
      true,
      false,
    ]) {
      const requiredValue = config.locales['pt-br'];

      if (requiredValue === undefined) {
        throw new Error('Missing required requiredValue');
      }

      await inspectNavigation({
        page,
        baseURL,
        minecraft,
        expected: {
          label: requiredValue.ui.third_party,
          domains: config.site.first_party_domains,
        },
      });
    }

    await page.setJavaScriptEnabled(false);

    for (const minecraft of [
      true,
      false,
    ]) {
      function interfaceSegment(): '' | 'terminal/' {
        if (minecraft) {
          return '';
        }

        return 'terminal/';
      }

      await page.goto(
        new URL(`pt-br/${interfaceSegment()}career/`, baseURL).href,
        {
          waitUntil: 'networkidle0',
        },
      );
      await inspectComponents(
        page,
        {
          label: 'Terceiros',
          domains: config.site.first_party_domains,
        },
        minecraft,
      );
    }

    await fs.writeFile(
      resolve(directory, 'checks.json'),
      JSON.stringify(
        {
          passed: checks.length,
          checks,
        },
        null,
        2,
      ),
    );
    console.log(
      `Component parity: ${String(checks.length)} presentations, SPA and no-JavaScript checks passed.`,
    );
  } finally {
    await context.close();
  }
}

export default checkComponentParity;

if (import.meta.main) {
  withBrowser(async (browser: Browser): Promise<void> => {
    await checkComponentParity({
      browser,
      baseURL: textOr(process.env['QA_BASE_URL'], 'http://127.0.0.1:4173/'),
      reportDirectory: textOr(process.env['QA_REPORT_DIR'], '.local/reports'),
      screenshots: process.argv.includes('--screenshots'),
    });
  })
    .catch((error: unknown): void => {
      console.error(error);
      process.exitCode = 1;
    });
}
