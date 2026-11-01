import type { Page, Browser } from 'puppeteer-core';
import assert from 'node:assert/strict';
import { inspectControlReadiness } from './control-readiness.ts';
import fs from 'node:fs/promises';
import { withBrowser } from './browser-presentation.ts';
import { resolve } from 'node:path';
import { readConfiguration } from './configuration.ts';
import type { LinkDocument } from '../../website/src/lib/site-data.ts';

type BadgeExpectation = {
  label: string;
  domains: string[];
};

type ParityRoute = {
  path: string;
  language: string;
  minecraft: boolean;
  id: string;
  expected: BadgeExpectation;
};

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
    ({
      expected,
      minecraft,
    }):
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
      const badges = [
        ...document.querySelectorAll<HTMLElement>(
          '.link-third-party-badge, .terminal-third-party-badge',
        ),
      ];

      const links = [
        ...document.querySelectorAll<HTMLElement>('.link-button'),
      ];

      const own = (url: URL): boolean => {
        return expected.domains.some((domain): boolean => {
          return url.hostname === domain || url.hostname.endsWith(`.${domain}`);
        });
      };

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
          /^https?:/i.test(link.getAttribute('href') || '') && !own(url);

        return (
          Boolean(
            link.querySelector<HTMLElement>('.link-third-party-badge')!,
          ) === thirdParty
        );
      });

      if (!minecraft) {
        return {
          badgesCorrect,
          ownershipCorrect,
          independent: !document.querySelector<HTMLElement>(
            '.site-frame,.quick-contact-link,.profile-avatar',
          )!,
        };
      }

      const avatar = document
        .querySelector<HTMLElement>('.profile-avatar')!
        .textContent.trim();

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

          const iconStyle = getComputedStyle(
            link.querySelector<HTMLElement>('.quick-contact-icon')!,
          );

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

            return {
              width: box.width,
              height: box.height,
              wrapped: icon!.parentElement!.matches(
                '.button-icon, .quick-contact-icon',
              ),
            };
          },
        );

      const activeCheck = Boolean(
        document.querySelector<HTMLAnchorElement>(
          '.header-navigation-links a[aria-current="page"]',
        )!,
      );

      const shortcuts = document.querySelector<HTMLElement>('.quick-contacts')!;

      const shortcutsBox = shortcuts.getBoundingClientRect();

      const profileBox = document
        .querySelector<HTMLElement>('.profile')!
        .getBoundingClientRect();

      const uptimeBox = document
        .querySelector<HTMLElement>('.profile-uptime')!
        .getBoundingClientRect();

      const navigation = document.querySelector<HTMLElement>(
        '.profile-navigation',
      )!;

      const ornaments = [
        ...document.querySelectorAll<HTMLElement>('.profile .ornament-label'),
      ];

      return {
        badgesCorrect,
        ownershipCorrect,
        avatar,
        frames,
        icons,
        activeCheck,
        profileShadow: getComputedStyle(
          document.querySelector<HTMLElement>('.profile')!,
        ).boxShadow,
        sharedOrnaments:
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
            .querySelector<HTMLElement>('#footer-navigation-title')!
            .classList.contains('ornament-label-footer'),
        shortcutsInHeader:
          shortcuts.closest('.profile') !== null &&
          shortcuts.children.length === 8 &&
          shortcutsBox.top >= navigation.getBoundingClientRect().bottom &&
          shortcutsBox.bottom <= profileBox.bottom &&
          shortcutsBox.left >= profileBox.left &&
          shortcutsBox.right <= profileBox.right,
        navigationSeparated:
          !navigation.querySelector<HTMLElement>('.quick-contacts')! &&
          navigation.closest('.profile') !== null &&
          navigation.getBoundingClientRect().top >= uptimeBox.bottom &&
          !document.querySelector<HTMLElement>('.quick-access')! &&
          !navigation.querySelector<HTMLElement>('details, button, summary')! &&
          navigation.querySelectorAll<HTMLAnchorElement>('.navigation-links a')
            .length ===
            document.querySelectorAll<HTMLAnchorElement>(
              '.footer-navigation-links a',
            ).length,
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
  await page.evaluate(
    ({
      theme,
      view
    }): void => {
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.linkView = view;
    },
    {
      theme,
      view,
    },
  );
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

async function inspectRoute(
  page: Page,
  baseURL: string,
  route: ParityRoute,
  expected: BadgeExpectation,
  directory: string,
  screenshots: boolean,
): Promise<string[]> {
  const response = await page.goto(new URL(route.path, baseURL).href, {
    waitUntil: 'networkidle0',
  });

  assert.equal(response!.status(), 200, route.path);
  await page.evaluate((): Promise<FontFaceSet> => {
    return document.fonts.ready;
  });

  const checks = [];

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
        await setPresentation(page, theme, view);
        await inspectComponents(page, expected, route.minecraft);

        const resolveName = (): 'minecraft' | 'terminal' => {
          if (route.minecraft) {
            return 'minecraft';
          }

          return 'terminal';
        };

        const name = `${route.language}-${resolveName()}-${route.id}-${width}-${theme}-${view}`;

        if (screenshots && route.language === 'pt-br') {
          await captureComponents(page, directory, name);
        }

        checks.push(name);
      }
    }
  }

  return checks;
}

async function inspectNavigation(
  page: Page,
  baseURL: string,
  minecraft: boolean,
  expected: BadgeExpectation,
): Promise<void> {
  const resolvePrefix = (): '' | 'terminal/' => {
    if (minecraft) {
      return '';
    }

    return 'terminal/';
  };

  const prefix = `pt-br/${resolvePrefix()}`;

  await page.goto(new URL(prefix, baseURL).href, {
    waitUntil: 'networkidle0',
  });
  await page.evaluate((): void => {
    window.componentParityNavigation = true;
  });

  const resolveSelector = ():
    | '.header-navigation-links a[data-navigation-page="career"]'
    | '.terminal-navigation a[href$="/career/"]' => {
    if (minecraft) {
      return '.header-navigation-links a[data-navigation-page="career"]';
    }

    return '.terminal-navigation a[href$="/career/"]';
  };

  const selector = resolveSelector();

  await page.click(selector);
  await page.waitForFunction((): boolean => {
    return document.documentElement.dataset.page === 'career';
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
      return [
        true,
        false,
      ].flatMap(
        (
          minecraft,
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
              const resolvePath = (): '' | 'terminal/' => {
                if (minecraft) {
                  return '';
                }

                return 'terminal/';
              };

              const resolvePath1 = (): string => {
                if (id === 'home') {
                  return '';
                }

                return `${id}/`;
              };

              return {
                path: `${language.path.slice(
                  1,
                )}${resolvePath()}${resolvePath1()}`,
                language: language.id,
                minecraft,
                id,
                expected: {
                  label: config.locales[language.id]?.ui.third_party || '',
                  domains: config.site.first_party_domains,
                },
              };
            },
          );
        },
      );
    },
  );
}

async function checkComponentParity(
  browser: Browser,
  baseURL: string,
  reportDirectory: string,
  screenshots = false,
): Promise<void> {
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

    const page = await context.newPage();

    await page.setCacheEnabled(false);
    await page.emulateMediaFeatures([
      {
        name: 'prefers-reduced-motion',
        value: 'reduce',
      },
    ]);

    for (const route of componentRoutes(config)) {
      checks.push(
        ...(await inspectRoute(
          page,
          baseURL,
          route,
          route.expected,
          directory,
          screenshots,
        )),
      );
    }

    for (const minecraft of [
      true,
      false,
    ]) {
      await inspectNavigation(page, baseURL, minecraft, {
        label: config!.locales['pt-br']!.ui.third_party,
        domains: config.site.first_party_domains,
      });
    }

    await page.setJavaScriptEnabled(false);

    for (const minecraft of [
      true,
      false,
    ]) {
      const resolveValue = (): '' | 'terminal/' => {
        if (minecraft) {
          return '';
        }

        return 'terminal/';
      };

      await page.goto(new URL(`pt-br/${resolveValue()}career/`, baseURL).href, {
        waitUntil: 'networkidle0',
      });
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
      `Component parity: ${checks.length} presentations, SPA and no-JavaScript checks passed.`,
    );
  } finally {
    await context.close();
  }
}

export default checkComponentParity;

if (import.meta.main) {
  withBrowser(async (browser: Browser): Promise<void> => {
    await checkComponentParity(
      browser,
      process.env.QA_BASE_URL || 'http://127.0.0.1:4173/',
      process.env.QA_REPORT_DIR || '.local/reports',
      process.argv.includes('--screenshots'),
    );
  })
    .catch((error): void => {
      console.error(error);
      process.exitCode = 1;
    });
}
